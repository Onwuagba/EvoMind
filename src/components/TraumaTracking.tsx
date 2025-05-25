import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';

interface TraumaEvent {
    date: Date;
    trigger: string;
    intensity: number;
    copingMechanisms: string[];
    supportNeeded: boolean;
}

export const TraumaTracking: React.FC = () => {
    const [events, setEvents] = useState<TraumaEvent[]>([]);
    const { analyzeTrauma } = useAIAnalysis();

    const handleEventAdd = async (event: TraumaEvent) => {
        const analysis = await analyzeTrauma(event);
        setEvents(prev => [...prev, { ...event, analysis }]);
    };

    return (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-lg text-neutral-900">Trauma Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="trauma-timeline">
                    {events.map((event, index) => (
                        <div key={index} className="trauma-event">
                            <Calendar selected={event.date} />
                            <div className="intensity-meter">
                                <Slider
                                    value={[event.intensity]}
                                    max={10}
                                    step={1}
                                />
                            </div>
                            {event.supportNeeded && (
                                <Button
                                    variant="outline"
                                    className="text-primary hover:bg-primary/10"
                                >
                                    Connect with Therapist
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};