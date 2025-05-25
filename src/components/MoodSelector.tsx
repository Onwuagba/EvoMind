
import React from 'react';
import { Button } from '@/components/ui/button';

interface MoodSelectorProps {
  selectedMood: number | null;
  onMoodSelect: (mood: number) => void;
  size?: 'small' | 'large';
  label?: string;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMood,
  onMoodSelect,
  size = 'small',
  label = 'How are you feeling?'
}) => {
  const moods = [
    { value: 1, emoji: '😢', label: 'Very Sad', color: 'bg-red-100 text-red-600 border-red-200' },
    { value: 2, emoji: '😔', label: 'Sad', color: 'bg-orange-100 text-orange-600 border-orange-200' },
    { value: 3, emoji: '😐', label: 'Neutral', color: 'bg-yellow-100 text-yellow-600 border-yellow-200' },
    { value: 4, emoji: '😊', label: 'Happy', color: 'bg-green-100 text-green-600 border-green-200' },
    { value: 5, emoji: '😄', label: 'Very Happy', color: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
  ];

  const buttonSize = size === 'large' ? 'w-12 h-12 text-2xl' : 'w-10 h-10 text-lg';

  return (
    <div className="space-y-4">
      <p className="text-center text-slate-700 font-medium">{label}</p>
      <div className="flex justify-center gap-2">
        {moods.map((mood) => (
          <Button
            key={mood.value}
            variant="outline"
            className={`
              ${buttonSize} rounded-full border-2 transition-all duration-300
              ${selectedMood === mood.value 
                ? `${mood.color} scale-110 shadow-lg` 
                : 'bg-white border-slate-200 hover:scale-105 hover:shadow-md'
              }
            `}
            onClick={() => onMoodSelect(mood.value)}
          >
            <span>{mood.emoji}</span>
          </Button>
        ))}
      </div>
      {selectedMood && (
        <p className="text-center text-sm text-slate-600 animate-fade-in">
          {moods.find(m => m.value === selectedMood)?.label}
        </p>
      )}
    </div>
  );
};

export default MoodSelector;
