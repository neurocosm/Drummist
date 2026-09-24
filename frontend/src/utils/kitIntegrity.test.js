import definitions from './sampleKitDefinitions.json';
import { soundPacks } from './soundPacks';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function audioFingerprint(bytes) {
  if (bytes.toString('ascii', 0, 4) === 'OggS' || bytes.toString('ascii', 0, 3) === 'ID3' || (bytes[0] === 255 && (bytes[1] & 224) === 224)) {
    // Compressed audition assets: byte-level identity; browser checks decoding.
    return crypto.createHash('sha256').update(bytes).digest('hex');
  }
  if (bytes.toString('ascii', 0, 4) === 'fLaC') {
    // FLAC STREAMINFO stores an MD5 of decoded PCM, independent of tags/encoding.
    const pcmHash = bytes.subarray(26, 42).toString('hex');
    if (pcmHash !== '0'.repeat(32)) return pcmHash;
    // FLAC permits an unset PCM checksum. Hash audio frames, excluding tags,
    // for these files so renamed/tagged copies still cannot pass as distinct.
    let offset = 4;
    let last = false;
    while (!last) {
      expect(offset + 4).toBeLessThanOrEqual(bytes.length);
      last = Boolean(bytes[offset] & 0x80);
      const length = bytes.readUIntBE(offset + 1, 3);
      offset += 4 + length;
    }
    expect(offset).toBeLessThan(bytes.length);
    return crypto.createHash('sha256').update(bytes.subarray(offset)).digest('hex');
  }
  // Compare the WAV audio payload rather than its file metadata.
  for (let offset = 12; offset + 8 <= bytes.length;) {
    const size = bytes.readUInt32LE(offset + 4);
    if (bytes.toString('ascii', offset, offset + 4) === 'data') {
      return crypto.createHash('sha256').update(bytes.subarray(offset + 8, offset + 8 + size)).digest('hex');
    }
    offset += 8 + size + size % 2;
  }
  throw Error('WAV has no audio payload');
}

test.each(Object.entries(definitions))('%s bundles distinct audio content, not renamed copies', (kit, entries) => {
  const root = path.join(process.cwd(), 'public/samples');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'sources.json')));
  const hashes = entries.map(entry => {
    const bytes = fs.readFileSync(path.join(root, entry.file));
    expect(['fLaC', 'RIFF', 'OggS'].includes(bytes.toString('ascii', 0, 4)) || bytes.toString('ascii', 0, 3) === 'ID3' || (bytes[0] === 255 && (bytes[1] & 224) === 224)).toBe(true);
    const hash = crypto.createHash('sha256').update(bytes).digest('hex');
    expect(manifest.find(item => item.kit === kit && item.key === entry.key)).toMatchObject({...entry, sha256: hash});
    return audioFingerprint(bytes);
  });
  expect(new Set(hashes).size).toBe(entries.length);
  expect(new Set(entries.map(entry => entry.key)).size).toBe(entries.length);
  expect(new Set(entries.map(entry => entry.source + (entry.originalFile || ''))).size).toBe(entries.length);
});

test('synth kits never reuse a sound recipe with only a volume change', () => {
  for (const kit of Object.values(soundPacks).filter(kit => !kit.sampleBased)) {
    const sounds = Object.values(kit.sounds).filter(sound => sound.synthesis);
    const recipes = sounds.map(({synthesis: {gain, ...recipe}}) => JSON.stringify(recipe));
    expect(new Set(recipes).size).toBe(sounds.length);
    expect(new Set(sounds.map(sound => sound.name)).size).toBe(sounds.length);
  }
});

test('rock palette has no brushes or mallets and retains splash attribution', () => {
  for (const sound of definitions.acoustic) {
    expect(`${sound.name} ${sound.source}`).not.toMatch(/brush|mallet/i);
  }
  const splash = definitions.acoustic.find(sound => sound.name === '8-inch splash cymbal');
  expect(splash).toMatchObject({name: '8-inch splash cymbal', role: 'crash', license: 'CC-BY-SA-3.0', author: 'Alexander Holm'});
  const credits = fs.readFileSync(path.join(process.cwd(), 'public/sample-credits.html'), 'utf8');
  expect(credits).toContain(splash.author);
  expect(credits).toContain(splash.licenseUrl);
});
