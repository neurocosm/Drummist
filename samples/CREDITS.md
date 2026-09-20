# Drummist sample credits

Acoustic Studio uses 37 unmodified close-microphone recordings from **Big Rusty Drums**, by Karoryfer Samples:
https://github.com/sfzinstruments/karoryfer.big-rusty-drums
Revision: f07ce00df34a46b6b08375be56fe116cf15782bc

Its open cowbell (key O) is an unmodified recording from the **Versilian Community Sample Library**, by Versilian Studios LLC, under **CC0 1.0**. The exact source is recorded in sources.json and the license is included in the acoustic directory.

Its 8-inch Paiste PST5 splash (key 7, acoustic/key-55.flac) is from **Salamander Drumkit**, by **Alexander Holm (Rytmenpinne)**, distributed under **CC BY-SA 3.0 Unported**:
https://github.com/studiorack/salamander-drumkit
Revision: 8b6faa8847b4c02f4b5dd42c1836c28ffbe89d33
Original file: Samples/splash1_OH_F_1.flac
License: https://creativecommons.org/licenses/by-sa/3.0/
The recording is unmodified and renamed locally; playback applies gain balancing. The recording remains under CC BY-SA 3.0. Its license and source README are bundled in the acoustic directory.

Vintage 808 uses 39 unmodified recordings from **Michael Fischer's TR-808 sound sample set**, distributed by TidalCycles:
https://github.com/tidalcycles/sounds-tr808-fischer
Revision: 85fbecf1bec32553395625ea659e2a56dfd7c0e1

World Percussion uses 24 unmodified recordings from **FreePats World Percussion** (Xavimart, Gonzalo, Roberto; conga and claves derived from VCSL), and 15 from the **Versilian Community Sample Library**, by Versilian Studios LLC:
https://github.com/freepats/world-percussion
https://github.com/sgossner/VCSL

All recordings except the Salamander splash are distributed under **CC0 1.0 Universal**. License texts are included in each kit directory. See sources.json for the pinned revisions, exact original file URLs and local filenames. Playback applies gain balancing; the bundled audio files are unchanged. FreePats' separately licensed photograph is not included.

Each sound-map button has its own recording. Acoustic keys use different articulations and instruments; 808 keys use different instruments, tunings, tone, snappy and decay settings. Space and unsupported characters are rests; uppercase letters use their lowercase key. Existing saved beats use the updated mappings, so they may sound different.

The shared key/label/source definitions are in src/utils/sampleKitDefinitions.json. Run `node scripts/download-kits.cjs` from the frontend directory to reproduce the samples. The downloader rejects duplicate file hashes within a kit and records SHA-256 checksums in sources.json. Original license files remain in each kit folder.

