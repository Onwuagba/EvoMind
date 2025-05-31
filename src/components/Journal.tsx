import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save, ArrowLeft, Mic, MicOff, Shield, Loader2, History } from 'lucide-react';
import MoodSelector from './MoodSelector';
import { TraumaTracking } from './TraumaTracking';
import { ProfessionalSupport } from './ProfessionalSupport';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { createJournalEntry, analyzeJournalEntry } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/axios';

interface JournalProps {
  onNavigate: (page: string) => void;
}

const Journal: React.FC<JournalProps> = ({ onNavigate }) => {
  const [entry, setEntry] = useState('');
  const [beforeMood, setBeforeMood] = useState<number | null>(null);
  const [afterMood, setAfterMood] = useState<number | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>('');
  const [crisisSupport, setCrisisSupport] = useState(false);
  const [patterns, setPatterns] = useState<any[]>([]);
  const [recommendedExercises, setRecommendedExercises] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(null); // State to store the entry ID
  const [moodError, setMoodError] = useState<string | null>(null); // Add state for mood error

  const prompts = [
    "What's one thing that made you smile today?",
    "Describe a challenge you faced and how you handled it.",
    "What are you grateful for right now?",
    "How did you take care of yourself today?",
    "What would you tell a friend going through what you're experiencing?"
  ];

  const [currentPrompt] = useState(prompts[Math.floor(Math.random() * prompts.length)]);
  const { analyzeEntry } = useAIAnalysis();
  const { toast } = useToast();

  useEffect(() => {
    const words = entry.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [entry]);

  // Auto-save functionality
  useEffect(() => {
    // Don't auto-save if entry is too short or no before mood
    if (!entry || entry.length < 10 || !beforeMood) return;

    const timer = setTimeout(async () => {
      try {
        const saveData = {
          content: entry,
          before_mood: beforeMood,
          after_mood: afterMood || beforeMood
        };

        interface JournalResponse {
          data: {
            data: {
              id: string;
              content: string;
              before_mood: number;
              after_mood: number;
            }
          }
        }
        let response: JournalResponse;
        if (entryId) {
          // Update existing entry
          response = await api.put(`/journals/${entryId}/`, saveData);
        } else {
          // Create new entry
          response = await api.post('/journals/', saveData);
          // Store the new entry ID
          setEntryId(response.data.data.id);
        }

        setLastSaved(formatTime(new Date()));
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [entry, beforeMood, afterMood, entryId]);

  // Update the last saved time format
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).toLowerCase();
  };

  // Update the handleSave function
  const handleSave = async () => {
    // Clear any previous mood error
    setMoodError(null);

    if (!beforeMood) {
      setMoodError("Please select how you're feeling before writing");
      return;
    }

    if (!entry || entry.length < 10) {
      toast({
        title: "Entry Too Short",
        description: "Please write at least a few sentences",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const saveData = {
        content: entry,
        before_mood: beforeMood,
        after_mood: afterMood || beforeMood
      };

      let journalData;
      if (entryId) {
        // Update existing entry
        const response = await api.put(`/journals/${entryId}/`, saveData);
        journalData = response.data.data;
      } else {
        // Create new entry only if no entryId exists
        const response = await api.post('/journals/', saveData);
        journalData = response.data.data;
        setEntryId(journalData.id);
      }

      toast({
        title: "Journal Entry Saved",
        description: "Your thoughts have been recorded successfully.",
        duration: 3000,
      });

      // Use the existing entryId for analysis
      const analysis = await analyzeJournalEntry(entryId || journalData.id);

      if (analysis.risk_level === 'high') {
        setCrisisSupport(true);
      }

      setPatterns(analysis.emotional_patterns || []);
      setRecommendedExercises(analysis.coping_suggestions || []);
      onNavigate('dashboard');

    } catch (error) {
      console.error('Error saving journal:', error);
      toast({
        title: "Error Saving Entry",
        description: "There was a problem saving your journal entry. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    // Voice input functionality would be implemented here
    if (!isListening) {
      console.log('Starting voice input...');
    } else {
      console.log('Stopping voice input...');
    }
  };

  // Remove the simulated analysis since we're now using the real API
  const handleEntrySubmit = async () => {
    try {
      const analysis = await analyzeJournalEntry(entry);

      if (analysis.risk_level === 'high') {
        setCrisisSupport(true);
      }

      setPatterns(analysis.emotional_patterns || []);
      setRecommendedExercises(analysis.coping_suggestions || []);
    } catch (error) {
      console.error('Error analyzing entry:', error);
      toast({
        title: "Analysis Error",
        description: "Could not analyze your entry at this time.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 p-4 pb-20">
      {/* Change max-w-md to match other pages */}
      <div className="max-w-md mx-auto space-y-6 animate-fade-in">
        {/* Updated Header with History Button */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('dashboard')}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-600" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">Journal Entry</h1>
              <p className="text-sm text-neutral-600">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('journal-history')}
            className="flex items-center gap-2 bg-white/80 hover:bg-white"
          >
            <History className="w-4 h-4" />
            <span>History</span>
          </Button>
        </div>

        {/* Journal Entry Card */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">

          {/* Before Writing Mood */}
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-slate-800">
              How do you feel before writing?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MoodSelector
              selectedMood={beforeMood}
              onMoodSelect={(mood) => {
                setBeforeMood(mood);
                setMoodError(null); // Clear error when mood is selected
              }}
              label="Rate your current mood"
            />
            {moodError && (
              <p className="text-sm text-red-500 mt-2">{moodError}</p>
            )}
          </CardContent>

          {/* Writing Prompt */}
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">Today's prompt:</p>
              <p className="font-medium text-slate-800 italic">"{currentPrompt}"</p>
            </div>
          </CardContent>

          {/* Writing Area */}
          <CardContent>
            <Textarea
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              placeholder="Start writing your thoughts here... There's no judgment, just let your feelings flow."
              className="min-h-48 resize-none border border-neutral-200 bg-white rounded-lg p-4 focus:ring-1 focus:ring-primary focus:border-primary text-slate-700 text-base leading-relaxed placeholder:text-slate-400 transition-colors duration-200"
            />
            <div className="flex justify-between items-center mt-4 text-sm text-slate-500">
              <span>{wordCount} words</span>
              {lastSaved && <span>Last saved: {lastSaved}</span>}
            </div>
          </CardContent>

          {/* After Writing Mood */}
          {entry.length > 50 && (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm animate-slide-up">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-slate-800">
                  How do you feel after writing?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MoodSelector
                  selectedMood={afterMood}
                  onMoodSelect={setAfterMood}
                  label="Rate your mood now"
                />
              </CardContent>
            </Card>
          )}

          {/* Save Button */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm animate-slide-up">
            <CardContent>
              <Button
                onClick={handleSave}
                className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
                disabled={entry.length < 10 || isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Save className="w-5 h-5 mr-2" />
                )}
                {isSaving ? 'Saving...' : 'Save Entry'}
              </Button>
            </CardContent>
          </Card>
        </Card>

        {/* Trauma Tracking Section */}
        <TraumaTracking
          content={entry}
          onPatternDetected={(patterns) => setPatterns(patterns)}
        />

        {/* Professional Support Card */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg text-neutral-900">Need Professional Support?</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => onNavigate('support')}
              className="w-full"
            >
              Connect with a Therapist
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Journal;
