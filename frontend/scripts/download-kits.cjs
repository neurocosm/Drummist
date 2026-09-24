// Reproduce bundled recordings from the pinned, credited upstream sources.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const definitions = require('../src/utils/sampleKitDefinitions.json');
const root = path.resolve(__dirname, '../public/samples');

(async () => {
  const manifest = [];
  for (const [kit, entries] of Object.entries(definitions)) {
    const hashes = new Set();
    for (const entry of entries) {
      if (entry.bundled) {
        const bytes = fs.readFileSync(path.join(root, entry.file));
        const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
        const previous = JSON.parse(fs.readFileSync(path.join(root, 'sources.json'))).find(item => item.file === entry.file);
        if (!previous || previous.sha256 !== sha256) throw Error(`Bundled asset mismatch: ${entry.file}`);
        if (hashes.has(sha256)) throw Error(`Duplicate recording: ${entry.file}`);
        hashes.add(sha256);
        manifest.push({kit, ...entry, bytes: bytes.length, sha256});
        continue;
      }
      let response = await fetch(entry.source);
      if (!response.ok) throw Error(`${response.status}: ${entry.source}`);
      let bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.toString('utf8', 0, 50).startsWith('version https://git-lfs')) {
        response = await fetch(entry.source.replace('raw.githubusercontent.com/', 'media.githubusercontent.com/media/'));
        if (!response.ok) throw Error(`LFS download failed: ${entry.source}`);
        bytes = Buffer.from(await response.arrayBuffer());
      }
      if (!['RIFF', 'fLaC'].includes(bytes.toString('ascii', 0, 4))) throw Error(`Invalid audio: ${entry.file}`);
      const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
      if (hashes.has(sha256)) throw Error(`Duplicate recording in ${kit}: ${entry.file}`);
      hashes.add(sha256);
      const target = path.resolve(root, entry.file);
      if (!target.startsWith(root + path.sep)) throw Error('Invalid sample path');
      fs.writeFileSync(target, bytes);
      manifest.push({kit, ...entry, bytes: bytes.length, sha256});
    }
    console.log(`${kit}: ${entries.length} unique recordings`);
  }
  // Remove only audio files tracked by the previous manifest and now replaced.
  const previous = JSON.parse(fs.readFileSync(path.join(root, 'sources.json')));
  for (const entry of previous) {
    if (manifest.some(item => item.file === entry.file)) continue;
    const target = path.resolve(root, entry.file);
    if (!target.startsWith(root + path.sep) || !/\.(wav|flac)$/.test(target)) throw Error('Invalid previous sample path');
    if (fs.existsSync(target)) fs.unlinkSync(target);
  }
  fs.writeFileSync(path.join(root, 'sources.json'), JSON.stringify(manifest, null, 2) + '\n');
})().catch(error => { console.error(error); process.exitCode = 1; });
