// Different sound packs for TypeDrummer
import { createDrumSound, createNoiseSound, drumMapping } from './drumSounds';

// Classic 808 Hip-Hop Pack
export const pack808 = {
  name: "808 Hip-Hop",
  description: "Classic 808 drum machine sounds",
  sounds: {
    'a': createDrumSound(60, 'sine', 0.4, 0.6), // 808 Kick
    'b': createDrumSound(80, 'sine', 0.3, 0.5),
    'c': createNoiseSound(12000, 0.05, 0.4), // 808 Hi-hat
    'd': createNoiseSound(8000, 0.15, 0.5), // 808 Snare
    'e': createDrumSound(100, 'triangle', 0.25, 0.4),
    'f': createNoiseSound(10000, 0.08, 0.3),
    'g': createDrumSound(150, 'sine', 0.3, 0.4),
    'h': createNoiseSound(15000, 0.03, 0.3), // Closed hat
    'i': createDrumSound(400, 'triangle', 0.12, 0.3),
    'j': createDrumSound(120, 'sine', 0.35, 0.5),
    'k': createDrumSound(50, 'sine', 0.5, 0.7), // Deep 808 kick
    'l': createDrumSound(300, 'sawtooth', 0.15, 0.4),
    'm': createDrumSound(90, 'triangle', 0.3, 0.4),
    'n': createDrumSound(250, 'sine', 0.18, 0.4),
    'o': createNoiseSound(8000, 0.12, 0.4), // Open hat
    'p': createDrumSound(180, 'triangle', 0.2, 0.4),
    'q': createDrumSound(110, 'sawtooth', 0.25, 0.4),
    'r': createNoiseSound(5000, 0.2, 0.4), // Ride
    's': createNoiseSound(9000, 0.1, 0.5), // Sharp snare
    't': createDrumSound(350, 'triangle', 0.12, 0.3), // Tom
    'u': createDrumSound(130, 'sine', 0.25, 0.4),
    'v': createDrumSound(220, 'sawtooth', 0.18, 0.4),
    'w': createDrumSound(160, 'triangle', 0.22, 0.4),
    'x': createNoiseSound(18000, 0.08, 0.5), // Crash
    'y': createDrumSound(280, 'sine', 0.15, 0.3),
    'z': createDrumSound(320, 'sawtooth', 0.12, 0.3),
    ' ': { name: 'Rest', play: () => {} }
  }
};

// Electronic/Techno Pack
export const packElectronic = {
  name: "Electronic",
  description: "Modern electronic drum sounds",
  sounds: {
    'a': createDrumSound(80, 'sine', 0.2, 0.5), // Electronic kick
    'b': createDrumSound(100, 'square', 0.15, 0.4),
    'c': createNoiseSound(16000, 0.03, 0.5), // Electronic hi-hat
    'd': createNoiseSound(12000, 0.08, 0.6), // Electronic snare
    'e': createDrumSound(150, 'sawtooth', 0.18, 0.4),
    'f': createNoiseSound(14000, 0.05, 0.3),
    'g': createDrumSound(200, 'square', 0.2, 0.4),
    'h': createNoiseSound(18000, 0.02, 0.4),
    'i': createDrumSound(500, 'triangle', 0.08, 0.3),
    'j': createDrumSound(140, 'sine', 0.25, 0.4),
    'k': createDrumSound(70, 'sine', 0.3, 0.6), // Deep electronic kick
    'l': createDrumSound(400, 'sawtooth', 0.1, 0.4),
    'm': createDrumSound(120, 'square', 0.2, 0.4),
    'n': createDrumSound(300, 'triangle', 0.12, 0.4),
    'o': createNoiseSound(10000, 0.1, 0.5),
    'p': createDrumSound(220, 'sawtooth', 0.15, 0.4),
    'q': createDrumSound(160, 'square', 0.18, 0.4),
    'r': createNoiseSound(6000, 0.15, 0.4),
    's': createNoiseSound(11000, 0.06, 0.6),
    't': createDrumSound(450, 'triangle', 0.08, 0.3),
    'u': createDrumSound(180, 'sine', 0.2, 0.4),
    'v': createDrumSound(280, 'sawtooth', 0.12, 0.4),
    'w': createDrumSound(200, 'square', 0.15, 0.4),
    'x': createNoiseSound(20000, 0.05, 0.6),
    'y': createDrumSound(350, 'triangle', 0.1, 0.3),
    'z': createDrumSound(400, 'sawtooth', 0.08, 0.3),
    ' ': { name: 'Rest', play: () => {} }
  }
};

// Acoustic Drum Pack
export const packAcoustic = {
  name: "Acoustic",
  description: "Natural acoustic drum sounds",
  sounds: {
    'a': createDrumSound(65, 'sine', 0.5, 0.5), // Acoustic kick
    'b': createDrumSound(85, 'triangle', 0.3, 0.4),
    'c': createNoiseSound(8000, 0.1, 0.3), // Acoustic hi-hat
    'd': createNoiseSound(5000, 0.2, 0.4), // Acoustic snare
    'e': createDrumSound(110, 'sine', 0.25, 0.4),
    'f': createNoiseSound(6000, 0.12, 0.3),
    'g': createDrumSound(140, 'triangle', 0.3, 0.4),
    'h': createNoiseSound(9000, 0.08, 0.3),
    'i': createDrumSound(380, 'sine', 0.15, 0.3),
    'j': createDrumSound(130, 'triangle', 0.35, 0.4),
    'k': createDrumSound(55, 'sine', 0.6, 0.6), // Deep acoustic kick
    'l': createDrumSound(280, 'triangle', 0.18, 0.4),
    'm': createDrumSound(95, 'sine', 0.3, 0.4),
    'n': createDrumSound(240, 'triangle', 0.2, 0.4),
    'o': createNoiseSound(7000, 0.15, 0.4),
    'p': createDrumSound(170, 'sine', 0.22, 0.4),
    'q': createDrumSound(115, 'triangle', 0.25, 0.4),
    'r': createNoiseSound(4000, 0.25, 0.3),
    's': createNoiseSound(6500, 0.12, 0.5),
    't': createDrumSound(320, 'sine', 0.15, 0.3), // Tom
    'u': createDrumSound(125, 'triangle', 0.28, 0.4),
    'v': createDrumSound(210, 'sine', 0.2, 0.4),
    'w': createDrumSound(155, 'triangle', 0.25, 0.4),
    'x': createNoiseSound(12000, 0.08, 0.5),
    'y': createDrumSound(270, 'sine', 0.18, 0.3),
    'z': createDrumSound(310, 'triangle', 0.15, 0.3),
    ' ': { name: 'Rest', play: () => {} }
  }
};

// Trap Pack
export const packTrap = {
  name: "Trap",
  description: "Modern trap and hip-hop sounds",
  sounds: {
    'a': createDrumSound(45, 'sine', 0.6, 0.7), // Sub kick
    'b': createDrumSound(75, 'triangle', 0.4, 0.5),
    'c': createNoiseSound(15000, 0.02, 0.6), // Trap hi-hat
    'd': createNoiseSound(7000, 0.18, 0.7), // Trap snare
    'e': createDrumSound(95, 'sawtooth', 0.3, 0.5),
    'f': createNoiseSound(13000, 0.04, 0.4),
    'g': createDrumSound(135, 'triangle', 0.35, 0.5),
    'h': createNoiseSound(17000, 0.015, 0.5),
    'i': createDrumSound(420, 'sawtooth', 0.1, 0.4),
    'j': createDrumSound(115, 'sine', 0.4, 0.6),
    'k': createDrumSound(40, 'sine', 0.7, 0.8), // Deep trap kick
    'l': createDrumSound(350, 'triangle', 0.12, 0.4),
    'm': createDrumSound(85, 'sawtooth', 0.35, 0.5),
    'n': createDrumSound(260, 'triangle', 0.15, 0.4),
    'o': createNoiseSound(8500, 0.08, 0.6),
    'p': createDrumSound(190, 'sawtooth', 0.2, 0.5),
    'q': createDrumSound(105, 'triangle', 0.3, 0.5),
    'r': createNoiseSound(4500, 0.2, 0.5),
    's': createNoiseSound(8000, 0.1, 0.7),
    't': createDrumSound(380, 'sawtooth', 0.1, 0.4),
    'u': createDrumSound(125, 'triangle', 0.25, 0.5),
    'v': createDrumSound(240, 'sawtooth', 0.15, 0.5),
    'w': createDrumSound(170, 'triangle', 0.2, 0.5),
    'x': createNoiseSound(19000, 0.06, 0.7),
    'y': createDrumSound(300, 'sawtooth', 0.12, 0.4),
    'z': createDrumSound(360, 'triangle', 0.1, 0.4),
    ' ': { name: 'Rest', play: () => {} }
  }
};

export const soundPacks = {
  classic: {
    name: "Classic",
    description: "Original TypeDrummer sounds",
    sounds: {} // Will be filled with original drumMapping
  },
  '808': pack808,
  electronic: packElectronic,
  acoustic: packAcoustic,
  trap: packTrap
};

export const defaultSoundPack = 'classic';