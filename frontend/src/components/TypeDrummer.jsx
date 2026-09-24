import './TrackStudio.css';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { getAudioContext, stopDrumSounds } from '../utils/drumSounds';
import { soundPacks } from '../utils/soundPacks';
import { MAX_TRACKS, MIX_GAIN, newTrack, loopLength, audibleTracks, trackGain, normalizeBeat } from '../utils/tracks';
import BeatControls from './BeatControls';
import { groupSoundMap } from '../utils/soundMapGroups';

export default function TypeDrummer() {
  const [tracks, setTracks] = useState(() => [newTrack(1)]);
  const [activeId, setActiveId] = useState(1);
  const [bpm, setBpm] = useState(85);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(-1);
  const [loaded, setLoaded] = useState('');
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const nextId = useRef(2), nextStep = useRef(0), buses = useRef(new Map());
  const latest = useRef(tracks);
  latest.current = tracks;
  const active = tracks.find(t => t.id === activeId) || tracks[0];
  const length = loopLength(tracks);
  const kitIds = [...new Set(tracks.map(t => t.soundPack))].sort().join('|');
  const ready = loaded === kitIds;
  const pack = soundPacks[active.soundPack];

  useEffect(() => {
    let cancelled = false;
    setError('');
    Promise.all(kitIds.split('|').map(id => soundPacks[id].preload?.())).then(() => {
      if (!cancelled) setLoaded(kitIds);
    }).catch(() => { if (!cancelled) setError('Could not load a kit. Check your connection and retry.'); });
    return () => { cancelled = true; };
  }, [kitIds, attempt]);

  useEffect(() => {
    const context = getAudioContext();
    if (!context) return;
    const audible = new Set(audibleTracks(tracks).map(t => t.id));
    tracks.forEach(track => {
      if (!buses.current.has(track.id)) {
        const gain = context.createGain(); gain.connect(context.destination);
        buses.current.set(track.id, gain);
      }
      const gain = buses.current.get(track.id).gain;
      gain.setTargetAtTime(audible.has(track.id) ? trackGain(track) : 0, context.currentTime, 0.005);
    });
    for (const [id, bus] of buses.current) if (!tracks.some(t => t.id === id)) {
      bus.disconnect(); buses.current.delete(id);
    }
  }, [tracks]);

  useEffect(() => () => {
    stopDrumSounds();
    buses.current.forEach(bus => bus.disconnect()); buses.current.clear();
  }, []);

  useEffect(() => {
    if (!playing || !ready || !length) return;
    const tick = () => {
      const step = nextStep.current % length;
      setPosition(step);
      audibleTracks(latest.current).forEach(track => {
        if (track.volume === 0) return;
        const char = track.text[step]; // Shorter tracks rest until the shared loop returns to zero.
        if (char) soundPacks[track.soundPack].sounds[char.toLowerCase()]?.play({
          destination: buses.current.get(track.id), channel: track.id,
        });
      });
      nextStep.current = (step + 1) % length;
    };
    tick();
    const timer = setInterval(tick, 60000 / bpm / 4);
    return () => { clearInterval(timer); stopDrumSounds(); };
  }, [playing, ready, length, bpm, kitIds]);

  const stop = () => { setPlaying(false); setPosition(-1); nextStep.current = 0; stopDrumSounds(); };
  const patchTrack = (id, patch) => setTracks(current => current.map(t => t.id === id ? {...t, ...patch} : t));
  const editText = (id, text) => {
    patchTrack(id, {text});
    if (text || tracks.some(t => t.id !== id && t.text)) {
      getAudioContext()?.resume(); setPlaying(true);
    } else stop();
  };
  const add = (source) => {
    if (tracks.length >= MAX_TRACKS) return;
    const id = nextId.current++;
    setTracks(current => [...current, source ? {...source, id} : newTrack(id, active.soundPack)]);
    setActiveId(id);
  };
  const load = data => {
    try {
      const beat = normalizeBeat(data);
      stop(); setTracks(beat.tracks); setBpm(beat.bpm); setActiveId(beat.tracks[0].id);
      nextId.current = beat.tracks.length + 1;
    } catch (err) { setError(err.message); }
  };
  const preview = async key => {
    const context = getAudioContext();
    if (!context || !ready) return;
    await context.resume();
    // Audition is independent of track mute/solo, at the same fixed mix headroom.
    const bus = context.createGain(); bus.gain.value = MIX_GAIN * active.volume / 100;
    bus.connect(context.destination);
    const sound = pack.sounds[key];
    sound?.play({destination: bus, channel: 'audition'});
    setTimeout(() => bus.disconnect(), ((sound?.sample?.()?.buffer.duration || sound?.synthesis?.duration || 1) + 0.1) * 1000);
  };

  return <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
    <header className="studio-header">
      <h1 className="text-3xl font-black tracking-tight text-gray-900">Drummist<span className="text-blue-600">.</span></h1>
      <p className="text-xs text-gray-500">By BostonyFX</p>
      <p className="text-sm text-gray-600">Make a drum beat by typing. Layer up to four tracks.</p>
    </header>
    <main className="studio-main">
      <div className="studio-toolbar"><div className="flex flex-wrap items-center gap-2">
        <Button disabled={!length || (!ready && !playing)} onClick={() => { if (playing) {setPlaying(false); stopDrumSounds();} else {getAudioContext()?.resume(); setPlaying(true);} }}>{playing ? 'Pause' : 'Play'}</Button>
        <Button variant="outline" onClick={stop} disabled={!playing && position < 0}>Stop</Button>
        <Button variant="outline" onClick={() => {stop(); setTracks(current => current.map(t => ({...t, text: ''})));}}>Clear all</Button>
        <span role="status" className="text-sm text-gray-600">{error ? 'Kit unavailable' : !ready ? 'Loading kits' : playing ? 'Playing' : position >= 0 ? 'Paused' : 'Stopped'} · {bpm} BPM · {length} steps</span>
      </div>
      <BeatControls bpm={bpm} setBpm={setBpm} tracks={tracks} text={tracks.map(t => t.text).join('')} soundPack={active.soundPack} onLoadBeat={load} /></div>
      {error && <p role="alert">{error} <button className="underline" onClick={() => setAttempt(n => n + 1)}>Retry loading</button></p>}
      <p className="text-sm text-gray-500">One character = one sixteenth note. Spaces are rests. Shorter tracks rest until the longest track loops.</p>
      <div className="track-scroll"><div className="track-table" style={{'--lane-width': Math.max(24, length + 4) * 24 + 'px'}}>
      <div className="track-ruler"><div className="track-label">TRACK / MIX</div><div className="ruler-steps">{Array.from({length: Math.max(24, length + 4)}, (_, i) => <span key={i} className={i === position ? 'ruler-active' : ''}>{i % 4 === 0 ? i + 1 : '·'}</span>)}</div></div>
      {tracks.map((track, index) => <Card key={track.id} onFocus={() => setActiveId(track.id)} className={`track-row ${active.id === track.id ? 'track-selected' : ''}`}>
        <div className="track-controls"><div className="track-control-top">
          <button className="font-bold text-sm" onClick={() => setActiveId(track.id)}>Track {index + 1}</button>
          <div className="track-actions">
            <Button size="sm" variant={track.muted ? 'default' : 'outline'} aria-label={`Mute track ${index + 1}`} aria-pressed={track.muted} onClick={() => patchTrack(track.id, {muted: !track.muted})} title="Mute">M</Button>
            <Button size="sm" variant={track.solo ? 'default' : 'outline'} aria-label={`Solo track ${index + 1}`} aria-pressed={track.solo} onClick={() => patchTrack(track.id, {solo: !track.solo})} title="Solo">S</Button>
            <details className="track-menu"><summary aria-label={`Track ${index + 1} actions`}>⋯</summary><div className="track-menu-items"><Button size="sm" variant="outline" aria-label={`Duplicate track ${index + 1}`} disabled={tracks.length >= MAX_TRACKS} onClick={() => add(track)}>Duplicate</Button>
            <Button size="sm" variant="outline" aria-label={`Clear track ${index + 1}`} onClick={() => {patchTrack(track.id, {text: ''}); if (!tracks.some(t => t.id !== track.id && t.text)) stop();}}>Clear</Button>
            <Button size="sm" variant="outline" aria-label={`Remove track ${index + 1}`} disabled={tracks.length === 1} onClick={() => { const remaining = tracks.filter(t => t.id !== track.id); setTracks(remaining); if (active.id === track.id) setActiveId(remaining[0].id); if (!loopLength(remaining)) stop(); }}>Remove</Button></div></details>
          </div>
        </div>
        <div className="track-mix">
          <label className="sr-only">Kit</label><select aria-label={`Track ${index + 1} kit`} className="track-kit" value={track.soundPack} onChange={event => patchTrack(track.id, {soundPack: event.target.value})}>
            {Object.entries(soundPacks).filter(([id, kit]) => !kit.legacy || id === track.soundPack).map(([id, kit]) => <option key={id} value={id}>{kit.name}</option>)}
          </select>
          <label className="track-volume"><span>{track.volume}%</span><input aria-label={`Track ${index + 1} volume`} type="range" min="0" max="100" value={track.volume} className="accent-blue-600" onChange={event => patchTrack(track.id, {volume: Number(event.target.value)})} /></label>
        </div>
        </div><div className="track-lane">
          <div className="lane-ink" aria-hidden="true">{Array.from({length: Math.max(24, length + 4)}, (_, step) => <span key={step} className={step === position ? 'step-playing' : step >= track.text.length ? 'step-rest' : ''}>{track.text[step] && track.text[step] !== ' ' ? track.text[step] : step < length ? '·' : ''}</span>)}</div>
          <textarea rows={1} wrap="off" spellCheck={false} aria-label={`Track ${index + 1} beat`} value={track.text} onChange={event => editText(track.id, event.target.value.replace(/[\r\n]/g, ' '))} placeholder={length ? "" : "type your beat here…"} maxLength={200} className="lane-input" />
          <div className="lane-meta">{track.text.length}/200 · {Math.max(0, length - track.text.length)} trailing rests</div>
        </div>
      </Card>)}</div></div>
      {tracks.length < MAX_TRACKS && <Button variant="outline" size="sm" onClick={() => add()}><span aria-hidden="true" className="mr-2 text-lg">＋</span>Add track</Button>}
      <details className="sound-drawer"><summary>Sound Map — Track {tracks.indexOf(active) + 1} · {pack.name}</summary><Card className="p-4 border-0 shadow-none">
        <h3 className="text-lg font-semibold mb-2">Sound Map — Track {tracks.indexOf(active) + 1} · {pack.name}</h3>
        <p className="text-sm text-gray-500 mb-5">{pack.description} · Select a track to see its sounds.</p>
        <div className="space-y-6">{groupSoundMap(pack.sounds).map(group => <section key={group.name} aria-label={group.name}>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">{group.name}</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm">{group.entries.map(([key, sound]) => <button key={key} disabled={!ready} className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100 text-left" onClick={() => preview(key)}><span className="font-mono text-lg font-bold text-blue-600">{key === ' ' ? 'space' : key}</span><span className="text-gray-600">{sound.name}</span></button>)}</div>
        </section>)}</div>
      </Card></details>
    </main>
    <footer className="text-center py-3 px-4 text-gray-500 text-xs"><p>Drummist · <a href="https://www.instagram.com/tony_bostony/" target="_blank" rel="noopener noreferrer" className="underline">BostonyFX</a></p><a href={`${process.env.PUBLIC_URL || ''}/sample-credits.html`} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 underline">Sound credits</a></footer>
  </div>;
}


