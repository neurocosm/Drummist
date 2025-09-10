// Audio recording and export functionality for TypeDrummer

let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;

export const startRecording = async () => {
  try {
    // Get the audio context that's already being used for playback
    const audioContext = window.globalAudioContext;
    if (!audioContext) {
      throw new Error('No audio context available');
    }

    // Create a MediaStreamDestination to capture audio
    const destination = audioContext.createMediaStreamDestination();
    
    // We'll need to connect our audio to this destination
    // This is a simplified approach - in a real implementation,
    // we'd need to route all our drum sounds through this destination
    
    const stream = destination.stream;
    
    mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus'
    });
    
    recordedChunks = [];
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      console.log('Recording stopped');
    };
    
    mediaRecorder.start();
    isRecording = true;
    
    return true;
  } catch (error) {
    console.error('Failed to start recording:', error);
    return false;
  }
};

export const stopRecording = () => {
  if (mediaRecorder && isRecording) {
    mediaRecorder.stop();
    isRecording = false;
    return true;
  }
  return false;
};

export const downloadRecording = (filename = 'typedrummer-beat') => {
  if (recordedChunks.length === 0) {
    console.error('No recording data available');
    return false;
  }
  
  const blob = new Blob(recordedChunks, {
    type: 'audio/webm'
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.webm`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  return true;
};

export const getIsRecording = () => isRecording;

// Simple beat export as JSON (for save/load functionality)
export const exportBeatAsJSON = (text, bpm, soundPack) => {
  const beatData = {
    text,
    bpm,
    soundPack,
    timestamp: new Date().toISOString(),
    version: '1.0'
  };
  
  return JSON.stringify(beatData, null, 2);
};

export const importBeatFromJSON = (jsonString) => {
  try {
    const beatData = JSON.parse(jsonString);
    
    // Validate required fields
    if (!beatData.text || !beatData.bpm || !beatData.soundPack) {
      throw new Error('Invalid beat data format');
    }
    
    return beatData;
  } catch (error) {
    console.error('Failed to import beat:', error);
    return null;
  }
};

// Save beat to localStorage
export const saveBeatToLocal = (name, text, bpm, soundPack) => {
  try {
    const beats = getSavedBeats();
    const beatData = {
      name,
      text,
      bpm,
      soundPack,
      timestamp: new Date().toISOString()
    };
    
    beats[name] = beatData;
    localStorage.setItem('typedrummer-beats', JSON.stringify(beats));
    return true;
  } catch (error) {
    console.error('Failed to save beat:', error);
    return false;
  }
};

// Load beat from localStorage
export const loadBeatFromLocal = (name) => {
  try {
    const beats = getSavedBeats();
    return beats[name] || null;
  } catch (error) {
    console.error('Failed to load beat:', error);
    return null;
  }
};

// Get all saved beats
export const getSavedBeats = () => {
  try {
    const saved = localStorage.getItem('typedrummer-beats');
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.error('Failed to get saved beats:', error);
    return {};
  }
};

// Delete saved beat
export const deleteSavedBeat = (name) => {
  try {
    const beats = getSavedBeats();
    delete beats[name];
    localStorage.setItem('typedrummer-beats', JSON.stringify(beats));
    return true;
  } catch (error) {
    console.error('Failed to delete beat:', error);
    return false;
  }
};