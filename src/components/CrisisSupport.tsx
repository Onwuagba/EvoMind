
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Phone, MessageCircle, Bookmark, Heart } from 'lucide-react';

interface CrisisSupportProps {
  open: boolean;
  onClose: () => void;
}

const CrisisSupport: React.FC<CrisisSupportProps> = ({ open, onClose }) => {
  const [selectedTab, setSelectedTab] = useState('hotlines');

  const emergencyResources = [
    {
      name: 'National Suicide Prevention Lifeline',
      phone: '1-800-273-8255',
      description: 'Free and confidential support for people in distress, 24/7',
      chat: 'https://suicidepreventionlifeline.org/chat/'
    },
    {
      name: 'Crisis Text Line',
      phone: 'Text HOME to 741741',
      description: 'Free 24/7 text support with trained crisis counselors',
      chat: 'https://www.crisistextline.org/'
    },
    {
      name: 'SAMHSA National Helpline',
      phone: '1-800-662-4357',
      description: 'Treatment referral and information service for substance abuse and mental health issues',
      chat: null
    }
  ];

  const copingTechniques = [
    {
      name: '5-4-3-2-1 Grounding Technique',
      description: 'Acknowledge 5 things you see, 4 things you can touch, 3 things you hear, 2 things you smell, and 1 thing you taste.'
    },
    {
      name: 'Deep Breathing',
      description: 'Breathe in for 4 counts, hold for 7 counts, exhale for 8 counts. Repeat 10 times or until you feel calmer.'
    },
    {
      name: 'Body Scan',
      description: 'Starting at your toes and moving up, notice any tension in each part of your body and consciously relax it.'
    },
    {
      name: 'Emotional First Aid',
      description: 'Acknowledge your feelings without judgment. Write them down. Remind yourself that emotions are temporary.'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-0 shadow-lg bg-white/90 backdrop-blur-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle>Crisis Support</DialogTitle>
          </div>
          <DialogDescription>
            It's important to reach out for help when you need it. You're not alone.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="hotlines">
              <Phone className="w-4 h-4 mr-2" />
              Hotlines
            </TabsTrigger>
            <TabsTrigger value="techniques">
              <Heart className="w-4 h-4 mr-2" />
              Coping Techniques
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hotlines" className="mt-4 space-y-3 max-h-[50vh] overflow-y-auto">
            {emergencyResources.map((resource, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <h3 className="font-medium text-slate-800">{resource.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Phone className="h-4 w-4 text-blue-500" />
                    <a href={`tel:${resource.phone.replace(/\D/g,'')}`} className="text-blue-600 font-medium">
                      {resource.phone}
                    </a>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">{resource.description}</p>
                  {resource.chat && (
                    <div className="mt-3">
                      <Button size="sm" variant="outline" className="w-full" asChild>
                        <a href={resource.chat} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Chat Online
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-2">
              <Bookmark className="w-4 h-4" />
              Find Professional Help Near Me
            </Button>
          </TabsContent>

          <TabsContent value="techniques" className="mt-4 space-y-3 max-h-[50vh] overflow-y-auto">
            {copingTechniques.map((technique, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <h3 className="font-medium text-slate-800">{technique.name}</h3>
                  <p className="text-sm text-slate-600 mt-2">{technique.description}</p>
                </CardContent>
              </Card>
            ))}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm text-slate-700">
              <p>Remember, these techniques are helpful for temporary relief, but don't replace professional support during a crisis.</p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex-col space-y-2 sm:space-y-0">
          <Button
            onClick={onClose}
            className="w-full bg-green-500 hover:bg-green-600"
          >
            I'm Safe Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CrisisSupport;
