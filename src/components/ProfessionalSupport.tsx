import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProfessionalSupportProps {
  onNavigate: (page: string) => void;
}

export const ProfessionalSupport: React.FC<ProfessionalSupportProps> = ({ onNavigate }) => {
  const therapists = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      specialties: ['Trauma', 'Anxiety'],
      availability: ['Mon', 'Wed', 'Fri'],
    },
    // Add more therapists as needed
  ];

  return (
    <div className="min-h-screen p-4 pb-20">
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg text-neutral-900">Professional Support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {therapists.map(therapist => (
            <div key={therapist.id} className="p-4 border-b">
              <h3 className="font-medium text-neutral-900">{therapist.name}</h3>
              <div className="flex gap-2 mt-2">
                {therapist.specialties.map(specialty => (
                  <span key={specialty} className="px-2 py-1 bg-primary/10 rounded-full text-sm">
                    {specialty}
                  </span>
                ))}
              </div>
              <Button
                variant="outline"
                className="mt-3 w-full"
                onClick={() => console.log(`Booking with ${therapist.name}`)}
              >
                Schedule Consultation
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};