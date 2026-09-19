# Drummist

By BostonyFX. Inspired by TypeDrummer by Kyle Stetz.

Make looping beats by typing, audition instruments with the sound map, save beats in your browser, and export JSON or stereo 16-bit/44.1 kHz WAV files. Includes Acoustic Studio and Vintage 808 recorded sample kits, plus Legacy Synth. Sample sources and CC0 licenses are in `frontend/public/samples/`.

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
