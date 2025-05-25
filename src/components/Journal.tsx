import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save, ArrowLeft, Mic, MicOff, Shield } from 'lucide-react';
import MoodSelector from './MoodSelector';
import { TraumaTracking } from './TraumaTracking';
import { ProfessionalSupport } from './ProfessionalSupport';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';

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

  const prompts = [
    "What's one thing that made you smile today?",
    "Describe a challenge you faced and how you handled it.",
    "What are you grateful for right now?",
    "How did you take care of yourself today?",
    "What would you tell a friend going through what you're experiencing?"
  ];

  const [currentPrompt] = useState(prompts[Math.floor(Math.random() * prompts.length)]);
  const { analyzeEntry } = useAIAnalysis();

  useEffect(() => {
    const words = entry.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [entry]);

  // Auto-save functionality
  useEffect(() => {
    if (entry.length > 0) {
      const timer = setTimeout(() => {
        setLastSaved(new Date().toLocaleTimeString());
        console.log('Auto-saved entry:', entry);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [entry]);

  const handleSave = () => {
    setLastSaved(new Date().toLocaleTimeString());
    console.log('Saved entry:', { entry, beforeMood, afterMood });
    // Here you would typically save to a database
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

  const handleEntrySubmit = async () => {
    const analysis = await analyzeEntry(entry);
    
    if (analysis.riskLevel === 'high') {
      // Show crisis support options
      setCrisisSupport(true);
    }

    // Update emotional patterns
    setPatterns(prev => [...prev, analysis.emotionalPatterns]);
    
    // Suggest exercises based on analysis
    setRecommendedExercises(analysis.recommendedExercises);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6 animate-fade-in">
        {/* Journal Entry Card */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-center gap-4 pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('dashboard')}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Journal Entry</h1>
              <p className="text-sm text-slate-600">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

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
          <Button
            onClick={handleSave}
            className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
            disabled={entry.length < 10}
          >
            <Save className="w-5 h-5 mr-2" />
            Save Entry
          </Button>
        </Card>

        {/* Trauma Tracking Section */}
        <TraumaTracking />

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
