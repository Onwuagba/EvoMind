import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Phone, Video, AlertTriangle, Brain, Shield } from 'lucide-react';
import { TraumaTracking } from './TraumaTracking';
import { Badge } from '@/components/ui/badge';

interface AnalysisResponse {
  pattern_identification: {
    triggers: string[];
    emotional_responses: string[];
    behavioral_patterns: string[];
  };
  risk_assessment: {
    level: string;
    factors: string[];
    intensity_interpretation: string;
  };
  recommendations: {
    coping_strategies: string[];
    support_resources: string[];
    professional_help: boolean;
    immediate_actions: string[];
  };
  summary: string;
  date: string;
}

interface ProfessionalSupportProps {
  onNavigate: (page: string) => void;
}

export const ProfessionalSupport: React.FC<ProfessionalSupportProps> = ({ onNavigate }) => {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);

  // Update the handlePatternDetected function
  const handlePatternDetected = (response: any) => {
    // Format current date as YYYY-MM-DD
    const currentDate = new Date().toISOString().split('T')[0];

    // If response is coming directly from API
    if (response.data) {
      setAnalysis({
        ...response.data,
        date: currentDate
      });
      return;
    }

    // For mock data or testing
    const mockAnalysis: AnalysisResponse = {
      pattern_identification: {
        triggers: response,
        emotional_responses: [],
        behavioral_patterns: []
      },
      risk_assessment: {
        level: 'low',
        factors: [],
        intensity_interpretation: ''
      },
      recommendations: {
        coping_strategies: [],
        support_resources: [],
        professional_help: false,
        immediate_actions: []
      },
      summary: '',
      date: currentDate
    };
    setAnalysis(mockAnalysis);
  };

  // Add a new function to handle AI chat navigation
  const handleAIChatOption = () => {
    onNavigate('companion');
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const matchedTherapists = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      specialties: ['Trauma', 'Anxiety', 'PTSD'],
      availability: 'Next available: Today',
      type: 'Video & In-person',
      experience: '15 years',
      rating: 4.9
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      specialties: ['Trauma-informed Care', 'Emotional Regulation'],
      availability: 'Next available: Tomorrow',
      type: 'Video',
      experience: '12 years',
      rating: 4.8
    }
  ];

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
            <ArrowLeft className="w-5 h-5 text-neutral-600" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Professional Support</h1>
            <p className="text-sm text-neutral-600">Connect with licensed therapists</p>
          </div>
        </div>

        {/* Trauma Tracking Component */}
        <TraumaTracking
          content=""
          onPatternDetected={handlePatternDetected}
        />

        {analysis && (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-neutral-900">Analysis Summary</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getRiskLevelColor(analysis.risk_assessment.level)}>
                  {analysis.risk_assessment.level.toUpperCase()} RISK
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Summary */}
              <p className="text-sm text-slate-700 leading-relaxed">
                {analysis.summary}
              </p>

              {/* Key Patterns */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-900">Key Patterns</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.pattern_identification.emotional_responses.map((response, i) => (
                    <Badge key={i} variant="outline" className="bg-blue-50 text-blue-500">
                      {response}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Immediate Actions */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-900">Recommended Actions</h4>
                <ul className="text-sm text-slate-700 space-y-1">
                  {analysis.recommendations.immediate_actions.slice(0, 2).map((action, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-primary mt-0.5" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Chat Option */}
        {analysis && !analysis.recommendations.professional_help && (
          <Card className="mt-6 bg-blue-50/50">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-sm text-slate-700">
                  Based on your responses, would you like to talk to our AI assistant?
                  It can provide additional support and other coping strategies.
                </p>
                <Button
                  onClick={handleAIChatOption}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Chat with AI Assistant
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Only show therapists if professional help is recommended */}
        {analysis && analysis.recommendations.professional_help && (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-neutral-900">Recommended Therapists</CardTitle>
              <CardDescription>Matched based on your needs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {matchedTherapists.map(therapist => (
                <div key={therapist.id} className="p-4 border border-neutral-100 rounded-lg hover:bg-neutral-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-neutral-900">{therapist.name}</h3>
                      <p className="text-sm text-neutral-600">{therapist.experience} experience</p>
                    </div>
                    <Badge variant="secondary">★ {therapist.rating}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {therapist.specialties.map(specialty => (
                      <Badge key={specialty} variant="outline" className="bg-primary/5 text-blue-500">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-neutral-600 mt-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {therapist.availability}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button variant="default" className="flex-1 bg-primary">
                      <Phone className="w-4 h-4 mr-2" />
                      Schedule Call
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Video className="w-4 h-4 mr-2" />
                      Video Chat
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};