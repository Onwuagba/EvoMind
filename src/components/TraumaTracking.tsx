import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/axios';
import { TagInput } from './ui/tag-input';

interface TraumaEvent {
    date: Date;
    trigger: string;
    intensity: number;
    copingMechanisms: string[];
    supportNeeded: boolean;
}

interface TraumaTrackingProps {
    content: string;
    onPatternDetected: (patterns: string[]) => void;
}

export const TraumaTracking: React.FC<TraumaTrackingProps> = ({ content, onPatternDetected }) => {
    const [triggers, setTriggers] = useState<string[]>([]);
    const [intensity, setIntensity] = useState<number>(1);

    const handleAnalyze = async () => {
        try {
            const response = await api.post('/analysis/trauma-pattern/', {
                description: content,
                intensity: intensity,
                date: new Date().toISOString().split('T')[0],
                triggers: triggers
            });

            if (response.data.emotional_patterns) {
                onPatternDetected(response.data.emotional_patterns);
            }
        } catch (error) {
            console.error('Failed to analyze trauma patterns:', error);
        }
    };

    return (
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-800">Pattern Recognition</CardTitle>
                <p className="text-sm text-slate-600">
                    Track emotional triggers and their intensity to identify patterns in your journal entries.
                    This helps build self-awareness and develop better coping strategies.
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">
                        Emotional Intensity (1-10)
                    </Label>
                    <div className="flex items-center gap-4">
                        <Slider
                            value={[intensity]}
                            min={1}
                            max={10}
                            step={1}
                            onValueChange={(value) => setIntensity(value[0])}
                            className="flex-1 [&>[role='slider']]:bg-white [&>[role='slider']]:border-blue-600 [&_[data-orientation='horizontal']]:bg-blue-500"
                        />
                        <span className="text-lg font-semibold text-blue-600 min-w-[2rem]">
                            {intensity}
                        </span>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">
                        Emotional Triggers
                    </Label>
                    <Input
                        placeholder="Add words or phrases that trigger emotional responses"
                        className="border-2 border-gray-400 focus:border-gray-600 placeholder:text-gray-500 shadow-sm"
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                const value = e.currentTarget.value.trim();
                                if (value && !triggers.includes(value)) {
                                    setTriggers([...triggers, value]);
                                    e.currentTarget.value = '';
                                }
                            }
                        }}
                    />
                </div>

                <Button
                    onClick={handleAnalyze}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                    Analyze Entry Patterns
                </Button>
            </CardContent>
        </Card>
    );
};