# Drummist PWA

Run `npm run build`, then `node scripts/preview.cjs` for the production PWA at http://127.0.0.1:3001. Development mode does not register a service worker, so live code changes remain immediate.

Deploy the build folder at the root of an HTTPS origin. Serve service-worker.js with Cache-Control: no-cache and the manifest as application/manifest+json. Use an index.html fallback for navigation, but return real 404 responses for missing assets. The build script generates a content-versioned offline cache containing HTML, JavaScript, styles, icons, and every drum sample. Source maps are excluded.

Wait for “Ready offline · All kits included” before disconnecting. Saved beats remain in localStorage on that browser and origin; changing ports or hosting domains does not transfer saved beats. Browser storage can be cleared or evicted, so export important beats as JSON/WAV.

The install button opens the browser install prompt when supported and otherwise explains browser-menu / iOS installation. Updates remain waiting until all old clients close or the user explicitly chooses the update button after saving their beat. No automatic reload occurs during playing.

Offline validation: load production preview, wait for offline readiness, stop the preview server, then reload the page. Verify both recorded kits load and WAV export completes. Restart the server afterward.
