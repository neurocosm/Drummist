import {normalizeBeat, audibleTracks} from './tracks';
import {exportBeatAsJSON, importBeatFromJSON, saveBeatToLocal, loadBeatFromLocal} from './audioRecorder';
const tracks = [{id: 9, text: '1 ', soundPack: 'studio-acoustic', volume: 37, muted: false, solo: true}, {id: 10, text: 'ab', soundPack: 'vintage-808', volume: 80, muted: true, solo: false}];
test('JSON and local saves retain track mix settings and old beats migrate', () => {
  const imported = importBeatFromJSON(exportBeatAsJSON('1 ab',85,'studio-acoustic',tracks));
  expect(imported.tracks.map(({id,...t})=>t)).toEqual(tracks.map(({id,...t})=>t));
  expect(saveBeatToLocal('test mix','1 ab',85,'studio-acoustic',tracks)).toBe(true);
  expect(loadBeatFromLocal('test mix').tracks).toEqual(tracks);
  expect(normalizeBeat({text:'a',soundPack:'classic',bpm:85}).tracks[0]).toMatchObject({volume:100,muted:false,solo:false});
  expect(audibleTracks(tracks)).toEqual([tracks[0]]);
});
test('invalid tracks cannot load or exceed the four-track limit', () => {
  expect(() => normalizeBeat({bpm:85,tracks:Array(5).fill(tracks[0])})).toThrow();
  expect(() => normalizeBeat({bpm:85,tracks:[{...tracks[0],soundPack:'missing'}]})).toThrow();
});
