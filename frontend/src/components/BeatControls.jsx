import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  Download, 
  Upload, 
  Save, 
  FolderOpen, 
  Trash2, 
  Music,
  Settings,
  Volume2
} from 'lucide-react';
import { soundPacks } from '../utils/soundPacks';
import { 
  saveBeatToLocal, 
  loadBeatFromLocal, 
  getSavedBeats, 
  deleteSavedBeat,
  downloadRecording,
  exportBeatAsJSON 
} from '../utils/audioRecorder';
import { useToast } from '../hooks/use-toast';

const BeatControls = ({ 
  bpm, 
  setBpm, 
  soundPack, 
  setSoundPack, 
  text, 
  setText,
  onLoadBeat 
}) => {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [beatName, setBeatName] = useState('');
  const [savedBeats, setSavedBeats] = useState(getSavedBeats());
  const { toast } = useToast();

  const handleBpmChange = (value) => {
    setBpm(value[0]);
  };

  const handleSoundPackChange = (pack) => {
    setSoundPack(pack);
    toast({
      title: "Sound Pack Changed",
      description: `Switched to ${soundPacks[pack].name} sound pack`,
    });
  };

  const handleSaveBeat = () => {
    if (!beatName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for your beat",
        variant: "destructive"
      });
      return;
    }

    if (!text.trim()) {
      toast({
        title: "Error", 
        description: "Please create a beat first",
        variant: "destructive"
      });
      return;
    }

    const success = saveBeatToLocal(beatName.trim(), text, bpm, soundPack);
    if (success) {
      toast({
        title: "Beat Saved!",
        description: `"${beatName}" has been saved to your library`,
      });
      setSavedBeats(getSavedBeats());
      setBeatName('');
      setSaveDialogOpen(false);
    } else {
      toast({
        title: "Save Failed",
        description: "Could not save your beat. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleLoadBeat = (name) => {
    const beat = loadBeatFromLocal(name);
    if (beat) {
      onLoadBeat(beat);
      toast({
        title: "Beat Loaded!",
        description: `"${name}" has been loaded`,
      });
      setLoadDialogOpen(false);
    } else {
      toast({
        title: "Load Failed",
        description: "Could not load the selected beat",
        variant: "destructive"
      });
    }
  };

  const handleDeleteBeat = (name) => {
    const success = deleteSavedBeat(name);
    if (success) {
      setSavedBeats(getSavedBeats());
      toast({
        title: "Beat Deleted",
        description: `"${name}" has been removed from your library`,
      });
    }
  };

  const handleExportJSON = () => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please create a beat first",
        variant: "destructive"
      });
      return;
    }

    const jsonData = exportBeatAsJSON(text, bpm, soundPack);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `typedrummer-beat-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Beat Exported!",
      description: "Your beat has been downloaded as a JSON file",
    });
  };

  const handleExportAudio = () => {
    toast({
      title: "Feature Coming Soon!",
      description: "Audio export functionality is in development",
    });
  };

  return (
    <Card className="w-full max-w-4xl p-6 shadow-lg">
      <div className="space-y-6">
        {/* BPM Control */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            <Label className="text-sm font-medium">BPM: {bpm}</Label>
          </div>
          <Slider
            value={[bpm]}
            onValueChange={handleBpmChange}
            min={60}
            max={200}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>60 BPM</span>
            <span>200 BPM</span>
          </div>
        </div>

        {/* Sound Pack Selection */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            <Label className="text-sm font-medium">Sound Pack</Label>
          </div>
          <Select value={soundPack} onValueChange={handleSoundPackChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(soundPacks).map(([key, pack]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex flex-col">
                    <span className="font-medium">{pack.name}</span>
                    <span className="text-xs text-gray-500">{pack.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {/* Save Beat */}
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Save className="mr-2 h-4 w-4" />
                Save Beat
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Beat</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="beatName">Beat Name</Label>
                  <Input
                    id="beatName"
                    value={beatName}
                    onChange={(e) => setBeatName(e.target.value)}
                    placeholder="Enter beat name..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveBeat}>Save</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Load Beat */}
          <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FolderOpen className="mr-2 h-4 w-4" />
                Load Beat
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Load Beat</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {Object.keys(savedBeats).length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No saved beats found</p>
                ) : (
                  Object.entries(savedBeats).map(([name, beat]) => (
                    <div key={name} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <h4 className="font-medium">{name}</h4>
                        <p className="text-sm text-gray-500">
                          "{beat.text}" • {beat.bpm} BPM • {soundPacks[beat.soundPack]?.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(beat.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleLoadBeat(name)}
                        >
                          Load
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteBeat(name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Export Options */}
          <Button variant="outline" size="sm" onClick={handleExportJSON}>
            <Download className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleExportAudio}>
            <Download className="mr-2 h-4 w-4" />
            Export Audio
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default BeatControls;