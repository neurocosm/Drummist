import { acousticKit, vintageKit, loadSample } from './sampleKits';
import { getAudioContext, trackSampleSource } from './drumSounds';

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
  expect(fetch).toHaveBeenCalledTimes(20);
  acousticKit.sounds.q.play();
  acousticKit.sounds.w.play();
  vintageKit.sounds.q.play();
  vintageKit.sounds.w.play();
  expect(new Set(sources.map(source => source.buffer.url)).size).toBe(4);
  expect(acousticKit.sounds.w.name).toBe('Ride cymbal');
  expect(vintageKit.sounds.w.name).toBe('Cowbell');
  expect(acousticKit.sounds.a.name).toBe(vintageKit.sounds.a.name);
  acousticKit.sounds.o.play();
  const openHat = sources[sources.length - 1];
  acousticKit.sounds.h.play();
  expect(openHat.stop).toHaveBeenCalledTimes(1);
  expect(trackSampleSource).toHaveBeenCalled();
  await acousticKit.preload();
  expect(fetch).toHaveBeenCalledTimes(20);
});

test('failed downloads can be retried instead of poisoning the cache', async () => {
  fetch.mockResolvedValueOnce({ ok: false, status: 503 });
  await expect(loadSample('/retry.wav')).rejects.toThrow('503');
  await expect(loadSample('/retry.wav')).resolves.toHaveProperty('buffer');
  expect(fetch).toHaveBeenCalledTimes(2);
});
