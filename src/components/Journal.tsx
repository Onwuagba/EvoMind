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
    if (!entry || entry.length < 10) return;

    const timer = setTimeout(async () => {
      try {
        const saveData = {
          content: entry,
          mood_score: beforeMood
        };

        // Update existing entry if we have an ID
        if (entryId) {
          await api.put(`/journals/${entryId}/`, saveData);
        } else {
          // Create new entry and store ID
          const response = await api.post('/journals/', saveData);
          setEntryId(response.data.id);
        }

        setLastSaved(new Date().toLocaleTimeString());
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [entry, beforeMood, entryId]);

  // Update handleSave to use the API
  const handleSave = async () => {
    if (!beforeMood && !afterMood) {
      toast({
        title: "Mood Required",
        description: "Please select your current mood before saving",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true); // Set saving state to true
    try {
      // Save the journal entry
      const journalData = await createJournalEntry({
        content: entry,
        mood_score: afterMood || beforeMood // Use after mood if available, else before mood
      });

      // Analyze the content
      const analysis = await analyzeJournalEntry(entry);

      // Show success message
      toast({
        title: "Journal Entry Saved",
        description: "Your thoughts have been recorded successfully.",
        duration: 3000,
      });

      // Update last saved time
      setLastSaved(new Date().toLocaleTimeString());

      // Show crisis support if risk level is high
      if (analysis.risk_level === 'high') {
        setCrisisSupport(true);
      }

      // Update patterns and recommendations
      setPatterns(analysis.emotional_patterns || []);
      setRecommendedExercises(analysis.coping_suggestions || []);

      // Navigate back to dashboard after successful save
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
      setIsSaving(false); // Reset saving state
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
              onMoodSelect={setBeforeMood}
              label="Rate your current mood"
            />
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
