# Drummist

By [BostonyFX](https://www.instagram.com/tony_bostony/).

Make looping beats by typing into up to four tracks, each with its own kit, volume, mute and solo controls. Shorter tracks rest until the shared loop repeats. Save beats in your browser and export JSON or mixed stereo 16-bit/44.1 kHz WAV files.

Five kits: Acoustic Studio (51 sounds), Vintage 808 (39), World Percussion (39), Industrial (33), and FX (10). Sound maps follow 0–9, A–Z, then punctuation. Legacy Synth remains available for older saved beats. Remapped keys can change how older patterns sound.

Sample attribution, exact sources, checksums and bundled licenses are in `frontend/public/samples/` and the app’s Sound credits page. Libraries include CC0, CC BY 4.0 and CC BY-SA 3.0 material; seven FX sounds are original Drummist synthesis.

## Run locally

Use Node.js 24 and npm. From `frontend`:

```sh
npm ci
npm start
```

The npm configuration retains compatibility with the existing React dependency peer ranges. The frontend runs independently; the original backend scaffold is not needed for music playback.

## Verify and build

```sh
npm test -- --watchAll=false --runInBand
npm run build
node scripts/preview.cjs
```

Production preview: http://127.0.0.1:3001. The production build includes the install manifest, icons, and an offline service worker. Wait for “Ready offline” before disconnecting. Development mode does not cache the app. See `frontend/PWA.md` for deployment, installation, storage, and update details.

Serve `frontend/build` at the root of an HTTPS origin to publish. GitHub commits alone do not deploy the app. Saved beats are browser-local; export important work before clearing site data or changing origins.

## Release versions

The app footer and saved/exported JSON identify the release using `v1.MMDDYYYY.HHmm`, with a four-digit year and 24-hour time in America/New_York. The current stamp is in `frontend/src/release.json`. From `frontend`, run `npm run release:stamp` once when preparing a new release, then commit that file and build. Rebuilding the same release keeps its label stable.

Beat-file schema versions (`1.0`/`2.0`) remain separate from `appVersion`. Offline cache versions remain content hashes so asset changes reliably trigger an update.
