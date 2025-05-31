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
import { Textarea } from './ui/textarea';
import { Clock, MapPin, Phone, User, Video } from 'lucide-react';

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
    const [description, setDescription] = useState<string>('');
    const [showRecommendation, setShowRecommendation] = useState<boolean>(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const getIntensityColor = (level: number) => {
        if (level <= 3) return 'bg-green-500';
        if (level <= 6) return 'bg-yellow-500';
        if (level <= 8) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const getIntensityLevel = (level: number) => {
        if (level <= 2) return 'Very Low';
        if (level <= 4) return 'Low';
        if (level <= 6) return 'Moderate';
        if (level <= 8) return 'High';
        return 'Very High';
    };

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        try {
            const response = await api.post('/analysis/trauma-pattern/', {
                description: description,
                intensity: intensity,
                triggers: triggers,
                date: new Date().toISOString().split('T')[0]
            });

            onPatternDetected(response.data);
        } catch (error) {
            console.error('Failed to analyze trauma patterns:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const recommendedTherapist = {
        name: 'Dr. Emily Rodriguez',
        specialties: ['Trauma', 'PTSD', 'Anxiety'],
        experience: '12 years',
        location: 'Downtown Practice',
        availability: 'Available today',
        rating: 4.9,
        type: 'Video & In-person'
    };

    return (
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-800">Pattern Recognition & Assessment</CardTitle>
                <p className="text-sm text-slate-600">
                    Track emotional triggers and their intensity to identify patterns. Based on your assessment, we'll recommend appropriate professional support.
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">
                        Description of Current Feelings/Situation
                    </Label>
                    <Textarea
                        placeholder="Describe what you're experiencing, your thoughts, or any specific situation you'd like to discuss..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="border-2 border-gray-300 focus:border-blue-500 placeholder:text-gray-500 text-black shadow-sm min-h-[100px]"
                    />
                </div>

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
                        <div className="flex flex-col items-center">
                            <span className="text-lg font-semibold text-slate-800 min-w-[2rem]">
                                {intensity}
                            </span>
                        </div>
                    </div>
                    <div className="text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium ${getIntensityColor(intensity)}`}>
                            {getIntensityLevel(intensity)}
                        </span>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">
                        Emotional Triggers (Press Enter to add)
                    </Label>
                    <Input
                        placeholder="Add words or phrases that trigger emotional responses"
                        className="border-2 border-gray-300 focus:border-blue-500 placeholder:text-gray-500  text-black shadow-sm"
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
                    {triggers.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {triggers.map((trigger, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm cursor-pointer hover:bg-blue-200"
                                    onClick={() => setTriggers(triggers.filter((_, i) => i !== index))}
                                >
                                    {trigger} ×
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <Button
                    onClick={handleAnalyze}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2"
                    disabled={!description.trim()}
                >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze & Get Professional Recommendation'}
                </Button>

                {showRecommendation && (
                    <div className="mt-6 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Recommended Professional
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <h4 className="font-medium text-slate-800">{recommendedTherapist.name}</h4>
                                <div className="flex gap-2 mt-1">
                                    {recommendedTherapist.specialties.map(specialty => (
                                        <span key={specialty} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                            {specialty}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {recommendedTherapist.location}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {recommendedTherapist.availability}
                                </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                                <Button className="flex-1 bg-green-500 hover:bg-green-600 text-white">
                                    <Phone className="w-4 h-4 mr-2" />
                                    Call Now
                                </Button>
                                <Button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white">
                                    <Video className="w-4 h-4 mr-2" />
                                    Video Call
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};