# Drummist sample credits

Acoustic Studio uses 23 unmodified close-microphone recordings from **Big Rusty Drums**, by Karoryfer Samples:
https://github.com/sfzinstruments/karoryfer.big-rusty-drums
Revision: f07ce00df34a46b6b08375be56fe116cf15782bc

Its open cowbell is an unmodified recording from the **Versilian Community Sample Library**, by Versilian Studios LLC, under **CC0 1.0**. The exact source is recorded in sources.json and the license is included in the acoustic directory.

Its 8-inch Paiste PST5 splash (acoustic/key-55.flac) is from **Salamander Drumkit**, by **Alexander Holm (Rytmenpinne)**, distributed under **CC BY-SA 3.0 Unported**:
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

Big Rusty Drums, Frankensnare, VCSL, FreePats and the TR-808 recordings are distributed under **CC0 1.0 Universal**. Naked Drums uses CC BY 4.0; AVL Drumkits and the Salamander splash use CC BY-SA 3.0. License texts are included in each kit directory. See sources.json for the pinned revisions, exact original file URLs and local filenames. Playback applies gain balancing; the bundled audio files are unchanged. FreePats' separately licensed photograph is not included.

Each sound-map button has its own recording. Acoustic keys use different articulations and instruments; 808 keys use different instruments, tunings, tone, snappy and decay settings. Space and unsupported characters are rests; uppercase letters use their lowercase key. Existing saved beats use the updated mappings, so they may sound different.

The shared key/label/source definitions are in src/utils/sampleKitDefinitions.json. Run `node scripts/download-kits.cjs` from the frontend directory to reproduce the samples. The downloader rejects duplicate file hashes within a kit and records SHA-256 checksums in sources.json. Original license files remain in each kit folder.


Six snare recordings are from Frankensnare by Karoryfer Samples (CC0), revision 9151c2d79fcbb73c65d63f78918d4ba7abc91a81. Exact sources are listed in samples/sources.json.

Four Yamaha tom recordings are from Naked Drums by Wilkinson Audio, SFZ/FLAC conversion by kinwie, under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Source: https://github.com/sfzinstruments/WilkinsonAudio.NakedDrums, revision 407732a548606ac715ad8f3fbac63d9f4df77c0d. The 18-inch Ludwig tom is from AVL Drumkits by Glen MacArthur, under CC BY-SA 3.0 (https://creativecommons.org/licenses/by-sa/3.0/). Source: https://github.com/studiorack/avl-drumkits, revision b06cb2c27359cbc68a830a82bddced05bd73d1a0. These recordings are unmodified except local filenames; playback applies gain balancing. Original licenses and READMEs are bundled in acoustic/. Exact source filenames appear in sources.json.

Six additional roto-tom recordings (high, mid and low, velocity layers 5 and 4) are from AVL Drumkits by Glen MacArthur, CC BY-SA 3.0 (https://creativecommons.org/licenses/by-sa/3.0/), revision b06cb2c27359cbc68a830a82bddced05bd73d1a0. Recordings are unmodified except local filenames; playback applies gain balancing. Exact sources are in sources.json and the AVL license is bundled in acoustic/.

Additional acoustic percussion: the Pearl 12-inch and 16-inch toms, Ludwig 14-inch tom, second cowbell, tambourine and AVL side stick are from AVL Drumkits by Glen MacArthur (CC BY-SA 3.0). High/low agogo bells and the fast rising mark-tree chime sweep are from Versilian Community Sample Library by Versilian Studios LLC (CC0 1.0). The snare cross-stick and rim-only tom click are from Big Rusty Drums by Karoryfer Samples (CC0 1.0). All recordings are unmodified except local filenames; playback applies gain balancing. Pinned original URLs and individual licenses are recorded in sources.json; license texts are bundled in acoustic/.

Industrial: 33 selected recordings. 16 from Versilian Community Sample Library by Versilian Studios LLC (https://github.com/sgossner/VCSL), and 17 from 100 CC0 metal and wood SFX by rubberduck (https://opengameart.org/content/100-cc0-metal-and-wood-sfx). Both libraries are CC0. Original recordings preserved, with playback gain balancing. FX: two CC0 laser MP3s by EZduzziteh (https://opengameart.org/content/laser-sound-effects), the CC0 public MP3 preview of record_scratch.wav by ludvique (https://freesound.org/people/ludvique/sounds/71853/), and seven newly synthesized Drummist WAV effects. The scratch is the preview encoding, not the original WAV. Synth recipes are in sources.json and generation-source.txt. Full audition provenance is bundled in each kit directory.
