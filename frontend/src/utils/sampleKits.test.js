import { acousticKit, vintageKit, worldKit, loadSample } from './sampleKits';
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

test('kits preload distinct recordings; Q/W differ and hats choke', async () => {
  await acousticKit.preload();
  await vintageKit.preload();
  expect(fetch).toHaveBeenCalledTimes(78);
  acousticKit.sounds.q.play();
  acousticKit.sounds.w.play();
  vintageKit.sounds.q.play();
  vintageKit.sounds.w.play();
  expect(new Set(sources.map(source => source.buffer.url)).size).toBe(4);
  expect(acousticKit.sounds.w.name).toBe('Ride cymbal · bow');
  expect(vintageKit.sounds.w.name).toBe('Cowbell');
  expect(acousticKit.sounds.a.role).toBe(vintageKit.sounds.a.role);
  acousticKit.sounds.u.play();
  const openHat = sources[sources.length - 1];
  acousticKit.sounds.h.play();
  expect(openHat.stop).toHaveBeenCalledTimes(1);
  expect(trackSampleSource).toHaveBeenCalled();
  await acousticKit.preload();
  expect(fetch).toHaveBeenCalledTimes(78);
});

test('failed downloads can be retried instead of poisoning the cache', async () => {
  fetch.mockResolvedValueOnce({ ok: false, status: 503 });
  await expect(loadSample('/retry.wav')).rejects.toThrow('503');
  await expect(loadSample('/retry.wav')).resolves.toHaveProperty('buffer');
  expect(fetch).toHaveBeenCalledTimes(2);
});

test.each([['acoustic', acousticKit], ['808', vintageKit], ['world', worldKit]])('%s gives every pad a unique recording in playback and WAV export', async (id, kit) => {
  await kit.preload();
  const entries = Object.entries(kit.sounds).filter(([key]) => key !== ' ');
  expect(entries).toHaveLength(39);
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
