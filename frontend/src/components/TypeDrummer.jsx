import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Play, Pause, Square, RotateCcw, Volume2 } from 'lucide-react';
import { drumMapping, getAudioContext, stopDrumSounds } from '../utils/drumSounds';
import { soundPacks, defaultSoundPack } from '../utils/soundPacks';
import BeatControls from './BeatControls';

const TypeDrummer = () => {
  const [text, setText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [bpm, setBpm] = useState(85);
  const [soundPack, setSoundPack] = useState(defaultSoundPack);
  const [readyPack, setReadyPack] = useState(soundPacks[defaultSoundPack]?.preload ? null : defaultSoundPack);
  const [sampleError, setSampleError] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const kitReady = readyPack === soundPack;
  const nextIndexRef = useRef(0);
  const playbackGeneration = useRef(0);
  
  // Calculate beat interval based on BPM
  const beatInterval = (60 / bpm / 4) * 1000; // 16th notes

  useEffect(() => {
    let cancelled = false;
    setSampleError('');
    const pack = soundPacks[soundPack];
    if (!pack?.preload) {
      setReadyPack(soundPack);
      return;
    }
    setReadyPack(null);
    pack.preload().then(() => {
      if (!cancelled) setReadyPack(soundPack);
    }).catch(() => {
      if (!cancelled) setSampleError('Could not load this kit. Check your connection and try again.');
    });
    return () => { cancelled = true; };
  }, [soundPack, loadAttempt]);

  // Get current sound mapping based on selected pack
  const getCurrentSounds = useCallback(() => {
    if (soundPack === 'classic') {
      return drumMapping;
    }
    return soundPacks[soundPack]?.sounds || drumMapping;
  }, [soundPack]);

  const playDrumSound = useCallback(async (char) => {
    if (!kitReady) return;
    const generation = playbackGeneration.current;
    const currentSounds = getCurrentSounds();
    const drumSound = currentSounds[char.toLowerCase()] || currentSounds[' '];
    if (drumSound && drumSound.play) {
      try {
        // Get fresh audio context
        const audioContext = getAudioContext();
        if (audioContext && audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        if (generation === playbackGeneration.current) drumSound.play();
      } catch (error) {
        console.log('Audio playback error:', error);
      }
    }
  }, [getCurrentSounds, kitReady]);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    
    nextIndexRef.current = 0;
    if (newText.length === 0) {
      stopPlayback();
    } else {
      // Unlock audio in the typing gesture; the effect owns the only loop.
      getAudioContext()?.resume().catch(console.error);
      setIsPlaying(true);
    }
  };

  const startPlayback = useCallback(() => {
    if (!text || isPlaying) return;
    
    getAudioContext()?.resume().catch(console.error);
    setIsPlaying(true);
  }, [text, isPlaying]);

  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(-1);
    nextIndexRef.current = 0;
    playbackGeneration.current += 1;
    stopDrumSounds();
  }, []);

  const resetText = () => {
    setText('');
    stopPlayback();
  };

  const togglePlayback = () => {
    if (isPlaying) {
      setIsPlaying(false);
      playbackGeneration.current += 1;
      stopDrumSounds();
    } else {
      startPlayback();
    }
  };

  // One owner for playback: every state change cleans up the previous loop.
  useEffect(() => {
    if (!isPlaying || !text || !kitReady) return;
    const tick = () => {
      const index = nextIndexRef.current % text.length;
      setCurrentIndex(index);
      playDrumSound(text[index]);
      nextIndexRef.current = (index + 1) % text.length;
    };
    tick();
    const interval = setInterval(tick, beatInterval);
    return () => {
      clearInterval(interval);
      playbackGeneration.current += 1;
      stopDrumSounds();
    };
  }, [isPlaying, text, beatInterval, playDrumSound, kitReady]);

  const renderCharacter = (char, index) => {
    const isActive = currentIndex === index;
    const currentSounds = getCurrentSounds();
    const drumInfo = currentSounds[char.toLowerCase()] || currentSounds[' '];
    
    return (
      <span
        key={index}
        className={`inline-block px-1 py-2 text-4xl font-mono transition-all duration-200 ${
          isActive 
            ? 'bg-blue-500 text-white scale-110 shadow-lg rounded' 
            : 'hover:bg-gray-100 rounded'
        }`}
        title={drumInfo?.name || 'Unknown sound'}
      >
        {char === ' ' ? '·' : char}
      </span>
    );
  };

  const handleLoadBeat = (beatData) => {
    stopPlayback();
    setText(beatData.text);
    setBpm(beatData.bpm);
    setSoundPack(beatData.soundPack);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <header className="text-center py-12 px-4">
        <h1 className="text-6xl sm:text-7xl font-black tracking-tight text-gray-900 mb-3">
          Drummist<span className="text-blue-600">.</span>
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          <span className="font-semibold text-gray-700">By BostonyFX</span>
        </p>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Make a drum beat by typing. Each letter triggers a different drum sound. 
          Start typing and your beat will automatically loop!
        </p>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-4 pb-12">
        {/* Text Input */}
        <Card className="w-full max-w-4xl p-8 mb-8 shadow-lg">
          <textarea
            value={text}
            onChange={handleTextChange}
            placeholder="start typing to make beats..."
            className="w-full h-32 text-2xl font-mono border-none outline-none resize-none bg-transparent placeholder-gray-400"
            maxLength={200}
          />
          <div className="text-right text-sm text-gray-500 mt-2">
            {text.length}/200 characters
          </div>
        </Card>

        {/* Visual Display */}
        {text && (
          <Card className="w-full max-w-4xl p-8 mb-8 shadow-lg">
            <div className="flex flex-wrap items-center justify-center gap-1 min-h-[4rem]">
              {text.split('').map((char, index) => renderCharacter(char, index))}
            </div>
          </Card>
        )}

        {/* Beat Controls */}
        <BeatControls
          bpm={bpm}
          setBpm={setBpm}
          soundPack={soundPack}
          setSoundPack={setSoundPack}
          text={text}
          setText={setText}
          onLoadBeat={handleLoadBeat}
        />

        <div className="w-full max-w-4xl text-sm text-gray-600 py-4" aria-live="polite">
          {sampleError ? (
            <p role="alert">{sampleError} <button className="text-blue-600 underline" onClick={() => setLoadAttempt(value => value + 1)}>Retry loading</button></p>
          ) : !kitReady ? (
            <p>Loading {soundPacks[soundPack]?.name}…</p>
          ) : soundPacks[soundPack]?.sampleBased ? (
            <p>39 distinct recordings · One sound per key · {soundPacks[soundPack].keyHint || 'A = kick · S = snare · H = closed hat · O = open hat · Space = rest'}</p>
          ) : <p>Legacy synthesized sounds</p>}
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={togglePlayback}
            disabled={!text || (!kitReady && !isPlaying)}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
          >
            {isPlaying ? (
              <>
                <Pause className="mr-2 h-5 w-5" />
                Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-5 w-5" />
                Play
              </>
            )}
          </Button>
          
          <Button
            onClick={stopPlayback}
            disabled={!isPlaying && currentIndex === -1}
            variant="outline"
            size="lg"
            className="px-6 py-4"
          >
            <Square className="mr-2 h-4 w-4" />
            Stop
          </Button>
          
          <Button
            onClick={resetText}
            variant="outline"
            size="lg"
            className="px-6 py-4"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>

        {/* Auto-loop Status */}
        <div className="flex items-center gap-2 mb-8">
          <div className="flex items-center gap-2" role="status">
            <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-gray-700 font-medium">{sampleError ? 'Kit unavailable' : !kitReady ? 'Loading kit' : isPlaying ? 'Playing' : currentIndex >= 0 ? 'Paused' : 'Stopped'} • {bpm} BPM</span>
          </div>
        </div>

        {/* Sound Map Reference */}
        <Card className="w-full max-w-4xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Volume2 className="mr-2 h-5 w-5" />
            Sound Map - {soundPacks[soundPack]?.name || 'Classic'}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
            {Object.entries(getCurrentSounds()).map(([key, sound]) => (
              <button
                type="button"
                disabled={!kitReady}
                key={key}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => playDrumSound(key)}
              >
                <span className="font-mono text-lg font-bold text-blue-600">
                  {key === ' ' ? 'space' : key}
                </span>
                <span className="text-gray-600">{sound.name}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 px-4 text-gray-500">
        <p className="text-xs tracking-wide">Drummist · <a href="https://www.instagram.com/tony_bostony/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-blue-600">BostonyFX</a></p>
        <a href={`${process.env.PUBLIC_URL || ''}/sample-credits.html`} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-xs underline underline-offset-4 hover:text-blue-600">Sound credits</a>
      </footer>
    </div>
  );
};

export default TypeDrummer;
