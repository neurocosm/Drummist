import { getAudioContext, trackSampleSource } from './drumSounds';
import definitions from './sampleKitDefinitions.json';

const cache = new Map();
const openHats = new Map();

export function loadSample(url) {
  if (!cache.has(url)) {
    const pending = (async () => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Sample could not load (${response.status})`);
      const context = getAudioContext();
      if (!context) throw new Error('Audio is not supported in this browser');
      const buffer = await context.decodeAudioData(await response.arrayBuffer());
      let peak = 0;
      for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        for (const value of buffer.getChannelData(channel)) peak = Math.max(peak, Math.abs(value));
      }
      return { buffer, gain: peak ? Math.min(8, 0.65 / peak) : 1 };
    })();
    cache.set(url, pending);
    pending.catch(() => cache.delete(url));
  }
  return cache.get(url);
}

function createKit(folder, name, description) {
  const decoded = new Map();
  const sounds = {};
  for (const {key, name: label, role, file, category, order} of definitions[folder]) {
    const sound = {
      name: label,
      role,
      category,
      order,
      file,
      sample: () => {
        const audio = decoded.get(key);
        return audio && { ...audio, gain: audio.gain * (role === 'crash' ? 0.6 : role.includes('hat') ? 0.75 : 1) };
      },
      play(options = {}) {
        const audio = decoded.get(key);
        if (!audio) return;
        const context = getAudioContext();
        const channel = options.channel || 'preview';
        if (role === 'closed-hat' || role === 'open-hat') {
          openHats.get(channel)?.stop();
          openHats.delete(channel);
        }
        const source = context.createBufferSource();
        const gain = context.createGain();
        source.buffer = audio.buffer;
        gain.gain.value = audio.gain * (role === 'crash' ? 0.6 : role.includes('hat') ? 0.75 : 1);
        source.connect(gain);
        gain.connect(options.destination || context.destination);
        if (role === 'open-hat') openHats.set(channel, source);
        trackSampleSource(source, () => {
          if (openHats.get(channel) === source) openHats.delete(channel);
          source.disconnect();
          gain.disconnect();
        });
        source.start();
      },
    };
    sounds[key] = sound;
  }
  sounds[' '] = { name: 'Rest', play() {} };
  return {
    name, description, sounds, sampleBased: true,
    async preload() {
      await Promise.all(definitions[folder].map(async ({key, file}) => {
        const sample = await loadSample(`${process.env.PUBLIC_URL || ''}/samples/${file}`);
        decoded.set(key, sample);
      }));
    },
  };
}

export const acousticKit = createKit('acoustic', 'Acoustic Studio', '51 hits · rock drums, roto-toms, bells and percussion');
export const vintageKit = createKit('808', 'Vintage 808', '39 recordings · drums, congas, claps and percussion');
export const worldKit = createKit('world', 'World Percussion', '39 recordings · congas, bongos, cajón, shakers and bells');
export const industrialKit = createKit('industrial', 'Industrial', '33 hits · metal, machinery, scrapes and impacts');
export const fxKit = createKit('fx', 'FX', '10 accents · lasers, scratch, zaps, drops and swells');
