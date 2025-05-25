import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Phone, Video } from 'lucide-react';

interface ProfessionalSupportProps {
  onNavigate: (page: string) => void;
}

export const ProfessionalSupport: React.FC<ProfessionalSupportProps> = ({ onNavigate }) => {
  const therapists = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      specialties: ['Trauma', 'Anxiety'],
      availability: 'Next available: Today',
      type: 'Video'
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      specialties: ['Depression', 'PTSD'],
      availability: 'Next available: Tomorrow',
      type: 'In-person'
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

        {/* Therapist List */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4 space-y-4">
            {therapists.map(therapist => (
              <div key={therapist.id} className="p-4 border border-neutral-100 rounded-lg hover:bg-neutral-50 transition-colors">
                <h3 className="font-medium text-neutral-900">{therapist.name}</h3>
                <div className="flex gap-2 mt-2">
                  {therapist.specialties.map(specialty => (
                    <span key={specialty} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                      {specialty}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-neutral-600 mt-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {therapist.availability}
                </p>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" className="flex-1">
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Video className="w-4 h-4 mr-2" />
                    Video
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};