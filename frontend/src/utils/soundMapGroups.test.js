import { acousticKit, vintageKit, worldKit, industrialKit, fxKit } from './sampleKits';
import { groupSoundMap } from './soundMapGroups';

test.each([acousticKit, vintageKit, worldKit, industrialKit, fxKit])('$name presents every playable key in sequential family order', kit => {
  const entries = groupSoundMap(kit.sounds).flatMap(group => group.entries);
  expect(entries.pop()[0]).toBe(' ');
  expect(entries.map(([key]) => key).join('')).toBe("0123456789abcdefghijklmnopqrstuvwxyz,.;/[]\\'-=!?@#$".slice(0, entries.length));
  expect(new Set(entries.map(([key]) => key)).size).toBe(entries.length);
});

test('acoustic toms retain brand groups and descending diameters', () => {
  const toms = groupSoundMap(acousticKit.sounds).find(group => group.name === 'Toms').entries.map(([, sound]) => sound.name);
  expect(toms.slice(0, 8)).toEqual([
    '16-inch Yamaha floor tom', '14-inch Yamaha tom', '12-inch Yamaha tom', '10-inch Yamaha tom',
    '16-inch Pearl floor tom', '12-inch Pearl tom', '18-inch Ludwig floor tom', '14-inch Ludwig tom',
  ]);
  expect(toms.slice(8).map(name => name.split(' ')[0])).toEqual(['Low', 'Low', 'Mid', 'Mid', 'High', 'High']);
});
