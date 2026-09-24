import { acousticKit, vintageKit, worldKit, industrialKit, fxKit, loadSample } from './sampleKits';
import { getAudioContext, trackSampleSource } from './drumSounds';
import definitions from './sampleKitDefinitions.json';

jest.mock('./drumSounds', () => ({ getAudioContext: jest.fn(), trackSampleSource: jest.fn() }));

let sources;
beforeEach(() => {
  sources = [];
  global.fetch = jest.fn(async url => ({ ok: true, arrayBuffer: async () => url }));
  getAudioContext.mockReturnValue({
    destination: {},
    decodeAudioData: async url => ({ url, numberOfChannels: 1, getChannelData: () => new Float32Array([0, 0.5, -0.25]) }),
    createBufferSource: () => {
      const source = { connect: jest.fn(), disconnect: jest.fn(), start: jest.fn(), stop: jest.fn() };
      sources.push(source);
      return source;
    },
    createGain: () => ({ gain: { value: 1 }, connect: jest.fn(), disconnect: jest.fn() }),
  });
});

test('kits preload distinct recordings; cymbal and cowbell differ and hats choke', async () => {
  await acousticKit.preload();
  await vintageKit.preload();
  expect(fetch).toHaveBeenCalledTimes(definitions.acoustic.length + definitions['808'].length);
  Object.values(acousticKit.sounds).find(s => s.name === 'Crash · choke').play();
  Object.values(acousticKit.sounds).find(s => s.name === 'Ride · hard bow').play();
  Object.values(vintageKit.sounds).find(s => s.name === 'Cymbal · dark short').play();
  Object.values(vintageKit.sounds).find(s => s.name === 'Cowbell').play();
  expect(new Set(sources.map(source => source.buffer.url)).size).toBe(4);
  expect(Object.values(acousticKit.sounds).find(s => s.name === 'Ride · hard bow').name).toBe('Ride · hard bow');
  expect(Object.values(vintageKit.sounds).find(s => s.name === 'Cowbell').name).toBe('Cowbell');
  expect(acousticKit.sounds[0].role).toBe(vintageKit.sounds[0].role);
  Object.values(acousticKit.sounds).find(s => s.name === 'Hi-hat · half open').play();
  const openHat = sources[sources.length - 1];
  Object.values(acousticKit.sounds).find(s => s.name === 'Hi-hat · tight tip').play();
  expect(openHat.stop).toHaveBeenCalledTimes(1);
  expect(trackSampleSource).toHaveBeenCalled();
  await acousticKit.preload();
  expect(fetch).toHaveBeenCalledTimes(definitions.acoustic.length + definitions['808'].length);
});

test('failed downloads can be retried instead of poisoning the cache', async () => {
  fetch.mockResolvedValueOnce({ ok: false, status: 503 });
  await expect(loadSample('/retry.wav')).rejects.toThrow('503');
  await expect(loadSample('/retry.wav')).resolves.toHaveProperty('buffer');
  expect(fetch).toHaveBeenCalledTimes(2);
});

test.each([['acoustic', acousticKit], ['808', vintageKit], ['world', worldKit], ['industrial', industrialKit], ['fx', fxKit]])('%s gives every pad a unique recording in playback and WAV export', async (id, kit) => {
  await kit.preload();
  const entries = Object.entries(kit.sounds).filter(([key]) => key !== ' ');
  expect(entries).toHaveLength(definitions[id].length);
  const buffers = [];
  for (const [key, sound] of entries) {
    sound.play();
    const source = sources[sources.length - 1];
    const definition = definitions[id].find(entry => entry.key === key);
    expect(source.buffer.url).toBe(`/samples/${definition.file}`);
    expect(sound.name).toBe(definition.name);
    expect(sound.sample().buffer).toBe(source.buffer);
    buffers.push(source.buffer);
  }
  expect(new Set(buffers).size).toBe(entries.length);
  expect(new Set(entries.map(([, sound]) => sound.name)).size).toBe(entries.length);
  const count = sources.length;
  kit.sounds[' '].play();
  expect(sources).toHaveLength(count);
});


test('hi-hat choking stays within each track even when both use the same kit', async () => {
  await acousticKit.preload();
  Object.values(acousticKit.sounds).find(s => s.name === 'Hi-hat · half open').play({channel: 'track-one'});
  const first = sources[sources.length - 1];
  Object.values(acousticKit.sounds).find(s => s.name === 'Hi-hat · half open').play({channel: 'track-two'});
  const second = sources[sources.length - 1];
  Object.values(acousticKit.sounds).find(s => s.name === 'Hi-hat · tight tip').play({channel: 'track-two'});
  expect(first.stop).not.toHaveBeenCalled();
  expect(second.stop).toHaveBeenCalledTimes(1);
});

