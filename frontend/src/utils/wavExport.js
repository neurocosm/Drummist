import { soundPacks } from './soundPacks';

export function encodeWav(buffer) {
  const channels = buffer.numberOfChannels;
  const bytes = new ArrayBuffer(44 + buffer.length * channels * 2);
  const view = new DataView(bytes);
  const tag = (offset, text) => [...text].forEach((char, i) => view.setUint8(offset + i, char.charCodeAt(0)));
  tag(0, 'RIFF'); view.setUint32(4, bytes.byteLength - 8, true);
  tag(8, 'WAVE'); tag(12, 'fmt '); view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); view.setUint16(22, channels, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * channels * 2, true);
  view.setUint16(32, channels * 2, true); view.setUint16(34, 16, true);
  tag(36, 'data'); view.setUint32(40, bytes.byteLength - 44, true);
  const data = Array.from({ length: channels }, (_, i) => buffer.getChannelData(i));
  let peak = 1;
  data.forEach(channel => { for (const value of channel) peak = Math.max(peak, Math.abs(value)); });
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (const channel of data) {
      const value = Math.max(-1, Math.min(1, channel[i] / peak));
      view.setInt16(offset, Math.round(value * (value < 0 ? 32768 : 32767)), true);
      offset += 2;
    }
  }
  return bytes;
}

export async function renderBeatWav(text, bpm, packId, loops = 4) {
  if (!text.trim() || text.length > 200 || !Number.isFinite(bpm) || bpm < 60 || bpm > 200 || ![1, 2, 4, 8].includes(loops)) {
    throw new Error('Enter a beat and choose a valid tempo and loop count.');
  }
  const pack = soundPacks[packId];
  if (!pack) throw new Error('Unknown sound kit.');
  await pack.preload?.();
  const step = 60 / bpm / 4;
  const sounds = [...text].map(char => pack.sounds[char.toLowerCase()] || pack.sounds[' ']);
  const tail = Math.max(0, ...sounds.map(sound => sound?.sample?.()?.buffer.duration || sound?.synthesis?.duration || 0));
  const rate = 44100;
  const context = new OfflineAudioContext(2, Math.ceil((sounds.length * loops * step + tail) * rate), rate);
  let openHat;
  for (let i = 0; i < sounds.length * loops; i++) {
    const sound = sounds[i % sounds.length];
    const when = i * step;
    const sample = sound?.sample?.();
    const synth = sound?.synthesis;
    if (!sample && !synth) continue;
    const gain = context.createGain();
    gain.connect(context.destination);
    let source;
    if (sample) {
      source = context.createBufferSource();
      source.buffer = sample.buffer;
      gain.gain.value = sample.gain;
      if (sound.role === 'closed-hat' || sound.role === 'open-hat') {
        if (openHat && when < openHat.end) openHat.source.stop(when);
        openHat = null;
      }
      if (sound.role === 'open-hat') openHat = { source, end: when + sample.buffer.duration };
      source.connect(gain);
    } else {
      gain.gain.setValueAtTime(synth.gain, when);
      gain.gain.exponentialRampToValueAtTime(0.01, when + synth.duration);
      if (synth.type === 'noise') {
        source = context.createBufferSource();
        source.buffer = context.createBuffer(1, Math.ceil(rate * synth.duration), rate);
        const data = source.buffer.getChannelData(0);
        for (let j = 0; j < data.length; j++) data[j] = Math.random() * 2 - 1;
        const filter = context.createBiquadFilter();
        filter.type = 'lowpass'; filter.frequency.value = synth.filterFreq;
        source.connect(filter); filter.connect(gain);
      } else {
        source = context.createOscillator();
        source.type = synth.type; source.frequency.value = synth.frequency;
        source.connect(gain);
      }
    }
    source.start(when);
    if (synth) source.stop(when + synth.duration);
  }
  return new Blob([encodeWav(await context.startRendering())], { type: 'audio/wav' });
}
