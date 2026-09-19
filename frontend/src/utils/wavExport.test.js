import { encodeWav, renderBeatWav } from './wavExport';

jest.mock('./soundPacks', () => ({ soundPacks: {
  test: { sounds: { a: { synthesis: { type: 'sine', frequency: 60, gain: 0.4, duration: 0.2 } }, ' ': { play() {} } } },
} }));

test('encodes stereo PCM with correct header, interleaving and peak protection', () => {
  const channels = [new Float32Array([2, -2]), new Float32Array([1, -1])];
  const bytes = encodeWav({ numberOfChannels: 2, sampleRate: 44100, length: 2, getChannelData: i => channels[i] });
  const view = new DataView(bytes);
  expect(String.fromCharCode(...new Uint8Array(bytes, 0, 4))).toBe('RIFF');
  expect(view.getUint16(22, true)).toBe(2);
  expect(view.getUint32(24, true)).toBe(44100);
  expect(view.getUint16(34, true)).toBe(16);
  expect(view.getUint32(40, true)).toBe(8);
  expect([44,46,48,50].map(i => view.getInt16(i,true))).toEqual([32767,16384,-32768,-16384]);
});

test('renders repeated beats at the BPM spacing while retaining rests and decay', async () => {
  const starts = [];
  global.OfflineAudioContext = jest.fn().mockImplementation((channels, length, sampleRate) => ({
    destination: {},
    createGain: () => ({ connect() {}, gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} } }),
    createOscillator: () => ({ connect() {}, frequency: {}, start: time => starts.push(time), stop() {} }),
    startRendering: async () => ({ numberOfChannels: channels, sampleRate, length, getChannelData: () => new Float32Array(length) }),
  }));
  const blob = await renderBeatWav('a ',120,'test',2);
  expect(starts).toEqual([0,0.25]);
  expect(OfflineAudioContext).toHaveBeenCalledWith(2,30870,44100);
  expect(blob.type).toBe('audio/wav');
});

test('rejects empty beats and invalid export lengths', async () => {
  await expect(renderBeatWav(' ',120,'test',4)).rejects.toThrow();
  await expect(renderBeatWav('a',120,'test',100)).rejects.toThrow();
});
