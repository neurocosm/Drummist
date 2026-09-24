import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Slider } from './ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  Download, 
  Save, 
  FolderOpen, 
  Trash2, 
  Music,
} from 'lucide-react';
import { 
  saveBeatToLocal, 
  loadBeatFromLocal, 
  getSavedBeats, 
  deleteSavedBeat,
  exportBeatAsJSON 
} from '../utils/audioRecorder';
import { useToast } from '../hooks/use-toast';
import { loopLength } from '../utils/tracks';
import { renderBeatWav } from '../utils/wavExport';

const BeatControls = ({ 
  bpm, 
  setBpm, 
  soundPack, 
  text, 
  tracks,
  onLoadBeat 
}) => {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [beatName, setBeatName] = useState('');
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [loops, setLoops] = useState('4');
  const [savedBeats, setSavedBeats] = useState(getSavedBeats());
  const { toast } = useToast();

  const handleBpmChange = (value) => {
    setBpm(value[0]);
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

    const success = saveBeatToLocal(beatName.trim(), text, bpm, soundPack, tracks);
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

    const jsonData = exportBeatAsJSON(text, bpm, soundPack, tracks);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drummist-beat-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Beat Exported!",
      description: "Your beat has been downloaded as a JSON file",
    });
  };

  const handleExportAudio = async () => {
    setExporting(true);
    try {
      const blob = await renderBeatWav(text, bpm, soundPack, Number(loops), tracks);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `drummist-mix-${bpm}bpm-${loops}loops.wav`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      setExportOpen(false);
      toast({ title: 'WAV ready', description: 'Your download has started.' });
    } catch (error) {
      toast({ title: 'Export failed', description: error.message, variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card className="studio-beat-controls">
      <div className="studio-beat-inner">
        {/* BPM Control */}
        <div className="studio-tempo">
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            <Label className="text-sm font-medium">BPM: {bpm}</Label>
          </div>
          <Slider
            aria-label="Tempo in BPM"
            value={[bpm]}
            onValueChange={handleBpmChange}
            min={60}
            max={200}
            step={5}
            className="w-full"
          />

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
                          {beat.tracks ? `${beat.tracks.length} tracks` : `"${beat.text}"`} • {beat.bpm} BPM
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
          
          <Dialog open={exportOpen} onOpenChange={value => { if (!exporting) setExportOpen(value); }}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={!text.trim()}>
                <Download className="mr-2 h-4 w-4" />Export WAV
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby="wav-description">
              <DialogHeader><DialogTitle>Export WAV</DialogTitle></DialogHeader>
              <p id="wav-description" className="text-sm text-gray-600">
                {tracks?.length || 1} tracks · {bpm} BPM · Stereo, 44.1 kHz, 16-bit.
                Uses track volumes, mute and solo. Includes the final drum and cymbal decay.
              </p>
              <Label htmlFor="wav-loops">Number of loops</Label>
              <select id="wav-loops" value={loops} disabled={exporting} onChange={event => setLoops(event.target.value)} className="border rounded p-2">
                {[1, 2, 4, 8].map(count => <option key={count} value={count}>{count} {count === 1 ? 'loop' : 'loops'}</option>)}
              </select>
              <p className="text-sm text-gray-500">{((tracks ? loopLength(tracks) : text.length) * Number(loops) * 60 / bpm / 4).toFixed(1)} seconds + sound decay</p>
              <Button onClick={handleExportAudio} disabled={exporting || !text.trim()}>{exporting ? 'Rendering…' : 'Download WAV'}</Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Card>
  );
};

export default BeatControls;
