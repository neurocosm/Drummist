// Mock drum sounds implementation for TypeDrummer
// In a real implementation, these would be actual audio files

let globalAudioContext = null;

export const createAudioContext = () => {
  if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
    if (!globalAudioContext) {
      globalAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return globalAudioContext;
  }
  return null;
};

// Create synthetic drum sounds using Web Audio API
const createDrumSound = (frequency, type = 'sine', duration = 0.1, gain = 0.3) => {
  return {
    name: `${type} ${frequency}Hz`,
    play: () => {
      try {
        if (!globalAudioContext) {
          globalAudioContext = createAudioContext();
        }
        
        if (!globalAudioContext) return;
        
        const oscillator = globalAudioContext.createOscillator();
        const gainNode = globalAudioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(globalAudioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, globalAudioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(gain, globalAudioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, globalAudioContext.currentTime + duration);
        
        oscillator.start(globalAudioContext.currentTime);
        oscillator.stop(globalAudioContext.currentTime + duration);
      } catch (error) {
        console.log('Audio not available:', error);
      }
    }
  };
};

// Create noise-based drum sounds
const createNoiseSound = (filterFreq, duration = 0.1, gain = 0.2) => {
  return {
    name: `Noise ${filterFreq}Hz`,
    play: () => {
      try {
        if (!globalAudioContext) {
          globalAudioContext = createAudioContext();
        }
        
        if (!globalAudioContext) return;
        
        const bufferSize = globalAudioContext.sampleRate * duration;
        const buffer = globalAudioContext.createBuffer(1, bufferSize, globalAudioContext.sampleRate);
        const output = buffer.getChannelData(0);
        
        // Generate white noise
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        
        const noise = globalAudioContext.createBufferSource();
        noise.buffer = buffer;
        
        const filter = globalAudioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(filterFreq, globalAudioContext.currentTime);
        
        const gainNode = globalAudioContext.createGain();
        gainNode.gain.setValueAtTime(gain, globalAudioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, globalAudioContext.currentTime + duration);
        
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(globalAudioContext.destination);
        
        noise.start(globalAudioContext.currentTime);
        noise.stop(globalAudioContext.currentTime + duration);
      } catch (error) {
        console.log('Audio not available:', error);
      }
    }
  };
};

// Drum sound mappings for each character
export const drumMapping = {
  // Letters
  'a': createDrumSound(60, 'sine', 0.3, 0.4), // Kick drum
  'b': createDrumSound(80, 'sine', 0.2, 0.3),
  'c': createNoiseSound(8000, 0.1, 0.3), // Hi-hat
  'd': createDrumSound(200, 'triangle', 0.15, 0.3), // Snare
  'e': createDrumSound(100, 'sawtooth', 0.2, 0.3),
  'f': createNoiseSound(5000, 0.08, 0.2),
  'g': createDrumSound(150, 'sine', 0.25, 0.3),
  'h': createNoiseSound(12000, 0.05, 0.2), // Closed hi-hat
  'i': createDrumSound(400, 'triangle', 0.1, 0.25),
  'j': createDrumSound(120, 'sine', 0.3, 0.35),
  'k': createDrumSound(70, 'sine', 0.4, 0.4), // Deep kick
  'l': createDrumSound(300, 'sawtooth', 0.12, 0.3),
  'm': createDrumSound(90, 'triangle', 0.25, 0.3),
  'n': createDrumSound(250, 'sine', 0.15, 0.3),
  'o': createNoiseSound(6000, 0.12, 0.25), // Open hi-hat
  'p': createDrumSound(180, 'triangle', 0.18, 0.3),
  'q': createDrumSound(110, 'sawtooth', 0.2, 0.3),
  'r': createNoiseSound(4000, 0.15, 0.3), // Ride
  's': createNoiseSound(10000, 0.08, 0.3), // Sharp snare
  't': createDrumSound(350, 'triangle', 0.1, 0.25), // Tom
  'u': createDrumSound(130, 'sine', 0.22, 0.3),
  'v': createDrumSound(220, 'sawtooth', 0.15, 0.3),
  'w': createDrumSound(160, 'triangle', 0.2, 0.3),
  'x': createNoiseSound(15000, 0.05, 0.2), // Crash
  'y': createDrumSound(280, 'sine', 0.12, 0.25),
  'z': createDrumSound(320, 'sawtooth', 0.1, 0.25),
  
  // Numbers
  '0': createDrumSound(50, 'sine', 0.5, 0.4), // Sub kick
  '1': createDrumSound(65, 'sine', 0.35, 0.4),
  '2': createDrumSound(85, 'triangle', 0.25, 0.3),
  '3': createDrumSound(110, 'sawtooth', 0.2, 0.3),
  '4': createDrumSound(140, 'sine', 0.18, 0.3),
  '5': createDrumSound(170, 'triangle', 0.15, 0.3),
  '6': createDrumSound(210, 'sawtooth', 0.12, 0.3),
  '7': createDrumSound(260, 'sine', 0.1, 0.25),
  '8': createDrumSound(310, 'triangle', 0.08, 0.25),
  '9': createDrumSound(380, 'sawtooth', 0.06, 0.2),
  
  // Special characters
  ' ': { name: 'Rest', play: () => {} }, // Silence/rest
  '.': createDrumSound(500, 'triangle', 0.05, 0.2), // Tick
  ',': createDrumSound(450, 'sine', 0.06, 0.2),
  '!': createNoiseSound(20000, 0.03, 0.3), // Crash accent
  '?': createDrumSound(600, 'sawtooth', 0.08, 0.25),
  '-': createDrumSound(200, 'triangle', 0.1, 0.2), // Soft snare
  '_': createDrumSound(180, 'sine', 0.12, 0.2),
  '+': createNoiseSound(8000, 0.06, 0.25),
  '=': createDrumSound(240, 'sawtooth', 0.1, 0.25),
  '/': createNoiseSound(12000, 0.04, 0.2),
  '\\': createNoiseSound(6000, 0.08, 0.2),
  '|': createDrumSound(300, 'triangle', 0.05, 0.2),
  '[': createDrumSound(150, 'sine', 0.15, 0.25),
  ']': createDrumSound(170, 'triangle', 0.15, 0.25),
  '(': createDrumSound(120, 'sawtooth', 0.18, 0.25),
  ')': createDrumSound(140, 'sine', 0.18, 0.25),
  '*': createNoiseSound(16000, 0.02, 0.3), // Splash
  '&': createDrumSound(190, 'triangle', 0.12, 0.25),
  '%': createNoiseSound(9000, 0.07, 0.2),
  '$': createDrumSound(270, 'sawtooth', 0.09, 0.25),
  '#': createNoiseSound(11000, 0.05, 0.25),
  '@': createDrumSound(340, 'triangle', 0.07, 0.2)
};

// Fallback for any unmapped characters
export const getDefaultSound = () => createDrumSound(200, 'triangle', 0.1, 0.2);