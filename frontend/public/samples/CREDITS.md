# Drummist sample credits

Acoustic Studio uses 39 unmodified close-microphone recordings from **Big Rusty Drums**, by Karoryfer Samples:
https://github.com/sfzinstruments/karoryfer.big-rusty-drums
Revision: f07ce00df34a46b6b08375be56fe116cf15782bc

Vintage 808 uses 39 unmodified recordings from **Michael Fischer's TR-808 sound sample set**, distributed by TidalCycles:
https://github.com/tidalcycles/sounds-tr808-fischer
Revision: 85fbecf1bec32553395625ea659e2a56dfd7c0e1

Both source repositories distribute these recordings under **CC0 1.0 Universal**. Their license texts are included in each kit directory. See sources.json for the exact original file URLs and local filenames. Playback applies gain balancing; the bundled audio files are unchanged.

Each sound-map button has its own recording. Acoustic keys use different articulations and instruments; 808 keys use different instruments, tunings, tone, snappy and decay settings. Space and unsupported characters are rests; uppercase letters use their lowercase key. Existing saved beats use the updated mappings, so they may sound different.

The shared key/label/source definitions are in src/utils/sampleKitDefinitions.json. Run `node scripts/download-kits.cjs` from the frontend directory to reproduce the samples. The downloader rejects duplicate file hashes within a kit and records SHA-256 checksums in sources.json. Original license files remain in each kit folder.

