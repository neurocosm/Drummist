import { soundPacks, defaultSoundPack } from './soundPacks';

export const MAX_TRACKS = 4;
// Fixed headroom keeps adding or muting a track from changing the others' levels.
export const MIX_GAIN = 0.25;
export const newTrack = (id, soundPack = defaultSoundPack) => ({ id, text: '', soundPack, volume: 100, muted: false, solo: false });
export const loopLength = tracks => Math.max(0, ...tracks.map(track => track.text.length));
export const audibleTracks = tracks => tracks.filter(track => !track.muted && (!tracks.some(t => t.solo) || track.solo));
export const trackGain = track => track.volume / 100 * MIX_GAIN;

export function normalizeBeat(beat) {
  const raw = Array.isArray(beat.tracks) ? beat.tracks : [{text: beat.text, soundPack: beat.soundPack}];
  if (!raw.length || raw.length > MAX_TRACKS || !Number.isFinite(beat.bpm) || beat.bpm < 60 || beat.bpm > 200) throw Error('Invalid beat.');
  return { bpm: beat.bpm, tracks: raw.map((track, id) => {
    if (typeof track.text !== 'string' || track.text.length > 200 || !soundPacks[track.soundPack]) throw Error('Invalid track.');
    return { ...newTrack(id + 1, track.soundPack), text: track.text,
      volume: Number.isFinite(track.volume) ? Math.max(0, Math.min(100, track.volume)) : 100,
      muted: track.muted === true, solo: track.solo === true };
  }) };
}
