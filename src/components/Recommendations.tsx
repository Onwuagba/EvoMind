
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Heart, Lightbulb, Timer, Play, Pause, RotateCcw } from 'lucide-react';

interface RecommendationsProps {
  onNavigate: (page: string) => void;
}

const Recommendations: React.FC<RecommendationsProps> = ({ onNavigate }) => {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingTime, setBreathingTime] = useState(0);
  const [breathingCycle, setBreathingCycle] = useState(0);

  const affirmations = [
    "I am capable of handling whatever comes my way today.",
    "My feelings are valid and temporary.",
    "I choose to focus on what I can control.",
    "I am worthy of love and compassion.",
    "Every challenge is an opportunity to grow."
  ];

  const mindfulnessExercises = [
    {
      id: '5-4-3-2-1',
      title: '5-4-3-2-1 Grounding',
      description: 'Notice 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste',
      duration: '3-5 min',
      icon: '👁️'
    },
    {
      id: 'body-scan',
      title: 'Body Scan',
      description: 'Slowly focus on each part of your body from head to toe',
      duration: '10 min',
      icon: '🧘'
    },
    {
      id: 'gratitude',
      title: 'Gratitude Practice',
      description: 'Think of three things you\'re grateful for right now',
      duration: '2 min',
      icon: '🙏'
    }
  ];

  const copingStrategies = [
    {
      title: 'Deep Breathing',
      description: 'When feeling overwhelmed, try the 4-7-8 breathing technique',
      action: 'Start Exercise',
      type: 'breathing'
    },
    {
      title: 'Progressive Muscle Relaxation',
      description: 'Tense and release muscle groups to reduce physical tension',
      action: 'Learn More',
      type: 'relaxation'
    },
    {
      title: 'Mindful Walking',
      description: 'Take a short walk while focusing on your surroundings',
      action: 'Get Started',
      type: 'movement'
    }
  ];

  const [currentAffirmation] = useState(
    affirmations[Math.floor(Math.random() * affirmations.length)]
  );

  // Breathing exercise logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isBreathingActive) {
      interval = setInterval(() => {
        setBreathingTime(prev => prev + 1);
        
        if (breathingPhase === 'inhale' && breathingTime >= 4) {
          setBreathingPhase('hold');
          setBreathingTime(0);
        } else if (breathingPhase === 'hold' && breathingTime >= 7) {
          setBreathingPhase('exhale');
          setBreathingTime(0);
        } else if (breathingPhase === 'exhale' && breathingTime >= 8) {
          setBreathingPhase('inhale');
          setBreathingTime(0);
          setBreathingCycle(prev => prev + 1);
        }
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isBreathingActive, breathingPhase, breathingTime]);

  const startBreathingExercise = () => {
    setIsBreathingActive(true);
    setBreathingTime(0);
    setBreathingCycle(0);
    setBreathingPhase('inhale');
  };

  const stopBreathingExercise = () => {
    setIsBreathingActive(false);
    setBreathingTime(0);
    setBreathingCycle(0);
    setBreathingPhase('inhale');
  };

  const getBreathingInstruction = () => {
    switch (breathingPhase) {
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
      default: return 'Breathe In';
    }
  };

  const getBreathingProgress = () => {
    const maxTime = breathingPhase === 'inhale' ? 4 : breathingPhase === 'hold' ? 7 : 8;
    return (breathingTime / maxTime) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6 animate-fade-in">
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
            <h1 className="text-xl font-bold text-slate-800">Recommendations</h1>
            <p className="text-sm text-slate-600">Personalized for your wellbeing</p>
          </div>
        </div>

        {/* Daily Affirmation */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-purple-400/10 to-pink-400/10 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              Today's Affirmation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 font-medium italic text-center leading-relaxed">
              "{currentAffirmation}"
            </p>
          </CardContent>
        </Card>

        {/* Breathing Exercise */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Timer className="w-5 h-5 text-blue-500" />
              4-7-8 Breathing Exercise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isBreathingActive ? (
              <div className="text-center space-y-4">
                <p className="text-slate-600">
                  A simple breathing technique to help reduce stress and anxiety
                </p>
                <Button
                  onClick={startBreathingExercise}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Exercise
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-6">
                <div className="relative">
                  <div 
                    className={`w-32 h-32 mx-auto rounded-full transition-all duration-1000 ${
                      breathingPhase === 'inhale' ? 'bg-blue-200 scale-110' :
                      breathingPhase === 'hold' ? 'bg-purple-200 scale-110' :
                      'bg-green-200 scale-90'
                    }`}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xl font-bold text-slate-800">
                        {getBreathingInstruction()}
                      </div>
                      <div className="text-sm text-slate-600">
                        {breathingTime + 1}s
                      </div>
                    </div>
                  </div>
                </div>
                
                <Progress value={getBreathingProgress()} className="w-full" />
                
                <div className="flex items-center justify-center gap-4">
                  <span className="text-sm text-slate-600">
                    Cycle: {breathingCycle}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={stopBreathingExercise}
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Stop
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mindfulness Exercises */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              Mindfulness Exercises
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mindfulnessExercises.map((exercise) => (
              <div
                key={exercise.id}
                className="p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                onClick={() => setSelectedExercise(exercise.id)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{exercise.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-800">{exercise.title}</h3>
                      <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded">
                        {exercise.duration}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{exercise.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Coping Strategies */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-slate-800">
              Recommended Coping Strategies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {copingStrategies.map((strategy, index) => (
              <div key={index} className="p-4 rounded-lg border border-slate-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 mb-2">{strategy.title}</h3>
                    <p className="text-sm text-slate-600 mb-3">{strategy.description}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    if (strategy.type === 'breathing') {
                      startBreathingExercise();
                    }
                  }}
                >
                  {strategy.action}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Emergency Resources */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-red-400/10 to-orange-400/10 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="text-center space-y-3">
              <h3 className="font-semibold text-slate-800">Need immediate support?</h3>
              <p className="text-sm text-slate-600">
                If you're experiencing a crisis, please reach out for help
              </p>
              <Button
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
                onClick={() => {
                  console.log('Opening crisis resources');
                  // This would open a modal with crisis resources
                }}
              >
                Crisis Resources
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Recommendations;
