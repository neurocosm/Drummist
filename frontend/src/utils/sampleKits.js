import { getAudioContext, trackSampleSource } from './drumSounds';

const cache = new Map();
let openHat = null;
const roles = {
  'kick': ['Kick', 'abk01'],
  'snare': ['Snare', 'sdf23'],
  'closed-hat': ['Closed hi-hat', 'hcix45'],
  'open-hat': ['Open hi-hat', 'ou6'],
  'low-tom': ['Low tom', 'jmz7'],
  'mid-tom': ['Mid tom', 'gnv8'],
  'high-tom': ['High tom', 'ety9'],
  'crash': ['Crash cymbal', 'q!'],
  'ride': ['Ride cymbal', 'w'],
  'rim': ['Rim click', 'lrp.,'],
};

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

function createKit(folder, extension, name, description) {
  const decoded = new Map();
  const sounds = {};
  for (const [role, [label, keys]] of Object.entries(roles)) {
    const sound = {
      name: role === 'ride' && folder === '808' ? 'Cowbell' : label,
      role,
      sample: () => {
        const audio = decoded.get(role);
        return audio && { ...audio, gain: audio.gain * (role === 'crash' ? 0.6 : role.includes('hat') ? 0.75 : 1) };
      },
      play() {
        const audio = decoded.get(role);
        if (!audio) return;
        const context = getAudioContext();
        if (role === 'closed-hat' || role === 'open-hat') {
          openHat?.stop();
          openHat = null;
        }
        const source = context.createBufferSource();
        const gain = context.createGain();
        source.buffer = audio.buffer;
        gain.gain.value = audio.gain * (role === 'crash' ? 0.6 : role.includes('hat') ? 0.75 : 1);
        source.connect(gain);
        gain.connect(context.destination);
        if (role === 'open-hat') openHat = source;
        trackSampleSource(source, () => {
          if (openHat === source) openHat = null;
          source.disconnect();
          gain.disconnect();
        });
        source.start();
      },
    };
    for (const key of keys) sounds[key] = sound;
  }
  sounds[' '] = { name: 'Rest', play() {} };
  return {
    name, description, sounds, sampleBased: true,
    async preload() {
      await Promise.all(Object.keys(roles).map(async role => {
        const sample = await loadSample(`${process.env.PUBLIC_URL || ''}/samples/${folder}/${role}.${extension}`);
        decoded.set(role, sample);
      }));
    },
  };
}

export const acousticKit = createKit('acoustic', 'flac', 'Acoustic Studio', 'Recorded drums · woody shells, ringing cymbals');
export const vintageKit = createKit('808', 'wav', 'Vintage 808', 'Recorded drum machine · deep kicks, crisp hats');
