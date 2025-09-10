import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Play, Pause, Square, RotateCcw, Volume2 } from 'lucide-react';
import { drumMapping, getAudioContext } from '../utils/drumSounds';

const TypeDrummer = () => {
  const [text, setText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [loop, setLoop] = useState(true);
  const audioContextRef = useRef(null);
  const intervalRef = useRef(null);
  const beatsPerMinute = 120;
  const beatInterval = (60 / beatsPerMinute / 4) * 1000; // 16th notes

  // Initialize audio context
  useEffect(() => {
    // Just initialize, don't close it
    getAudioContext();
  }, []);

  const playDrumSound = useCallback(async (char) => {
    const drumSound = drumMapping[char.toLowerCase()] || drumMapping[' '];
    if (drumSound && drumSound.play) {
      try {
        // Get fresh audio context
        const audioContext = getAudioContext();
        if (audioContext && audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        drumSound.play();
      } catch (error) {
        console.log('Audio playback error:', error);
      }
    }
  }, []);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    
    // Play sound for the newly typed character
    if (newText.length > text.length) {
      const newChar = newText[newText.length - 1];
      playDrumSound(newChar);
    }
    
    // Auto-start playback when text is entered and not already playing
    if (newText.length > 0 && !isPlaying) {
      // Small delay to let the current character sound finish
      setTimeout(() => {
        if (newText.length > 0) { // Check again in case text was cleared
          startPlayback();
        }
      }, 300);
    }
    
    // Stop playback if text is cleared
    if (newText.length === 0 && isPlaying) {
      stopPlayback();
    }
  };

  const startPlayback = useCallback(() => {
    if (!text || isPlaying) return;
    
    setIsPlaying(true);
    setCurrentIndex(0);
    
    // Play the first character immediately
    if (text.length > 0) {
      playDrumSound(text[0]);
    }
    
    let currentIdx = 0;
    intervalRef.current = setInterval(() => {
      currentIdx = (currentIdx + 1) % text.length;
      setCurrentIndex(currentIdx);
      playDrumSound(text[currentIdx]);
    }, beatInterval);
  }, [text, playDrumSound, beatInterval, isPlaying]);

  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(-1);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resetText = () => {
    setText('');
    stopPlayback();
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  // Update the text to restart playback when text changes during playback
  useEffect(() => {
    if (isPlaying && text.length > 0) {
      // Restart the playback with new text
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setCurrentIndex(0);
      
      // Play first character of new text
      playDrumSound(text[0]);
      
      let currentIdx = 0;
      intervalRef.current = setInterval(() => {
        currentIdx = (currentIdx + 1) % text.length;
        setCurrentIndex(currentIdx);
        playDrumSound(text[currentIdx]);
      }, beatInterval);
    }
  }, [text, beatInterval, playDrumSound]); // Removed isPlaying to avoid infinite loop

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const renderCharacter = (char, index) => {
    const isActive = currentIndex === index;
    const drumInfo = drumMapping[char.toLowerCase()] || drumMapping[' '];
    
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <header className="text-center py-12 px-4">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">
          typedrummer
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Make music by typing. Each letter triggers a different drum sound. 
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

        {/* Controls */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={togglePlayback}
            disabled={!text}
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
            disabled={!isPlaying}
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

        {/* Loop Toggle - Always enabled now */}
        <div className="flex items-center gap-2 mb-8">
          <div className="flex items-center gap-2 text-green-600">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-700 font-medium">Auto-loop enabled</span>
          </div>
        </div>

        {/* Drum Map Reference */}
        <Card className="w-full max-w-4xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Volume2 className="mr-2 h-5 w-5" />
            Sound Map
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
            {Object.entries(drumMapping).map(([key, sound]) => (
              <div
                key={key}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => playDrumSound(key)}
              >
                <span className="font-mono text-lg font-bold text-blue-600">
                  {key === ' ' ? 'space' : key}
                </span>
                <span className="text-gray-600">{sound.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 px-4 text-gray-500">
        <p>Created by Kyle Stetz • TypeDrummer Clone</p>
      </footer>
    </div>
  );
};

export default TypeDrummer;