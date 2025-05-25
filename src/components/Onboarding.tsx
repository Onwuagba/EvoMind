
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ArrowLeft, ArrowRight, Check, Shield, Target } from 'lucide-react';
import MoodSelector from './MoodSelector';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Form state
  const [name, setName] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [currentMood, setCurrentMood] = useState<number | null>(null);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);
  
  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle>Welcome to Your Emotional Journey</CardTitle>
          <div className="flex justify-center items-center gap-1.5 mt-2">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div 
                key={idx}
                className={`h-1.5 rounded-full ${
                  idx + 1 <= currentStep ? 'bg-blue-500 w-8' : 'bg-slate-200 w-6'
                } transition-all duration-300`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <div className="space-y-6 py-4 animate-fade-in">
              <div className="space-y-2 text-center mb-6">
                <h2 className="text-xl font-semibold">Let's get to know you</h2>
                <p className="text-slate-600 text-sm">We'll personalize your experience based on your input</p>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name">What should we call you?</Label>
                  <Input 
                    id="name" 
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-3 pt-4">
                  <div className="space-y-1.5">
                    <Label>How are you feeling right now?</Label>
                    <MoodSelector
                      selectedMood={currentMood}
                      onMoodSelect={setCurrentMood}
                      size="large"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 py-4 animate-fade-in">
              <div className="space-y-2 text-center mb-6">
                <div className="flex justify-center mb-3">
                  <Target className="h-10 w-10 text-blue-500" />
                </div>
                <h2 className="text-xl font-semibold">Set Your Goals</h2>
                <p className="text-slate-600 text-sm">What do you hope to achieve with this app?</p>
              </div>
              
              <div className="space-y-4">
                <Label>Select your goals (choose all that apply):</Label>
                <ToggleGroup type="multiple" variant="outline" className="flex flex-wrap gap-2" value={goals} onValueChange={setGoals}>
                  <ToggleGroupItem value="track" className="flex-grow basis-[45%]">Track mood patterns</ToggleGroupItem>
                  <ToggleGroupItem value="stress" className="flex-grow basis-[45%]">Reduce stress & anxiety</ToggleGroupItem>
                  <ToggleGroupItem value="mindfulness" className="flex-grow basis-[45%]">Practice mindfulness</ToggleGroupItem>
                  <ToggleGroupItem value="insights" className="flex-grow basis-[45%]">Gain self-awareness</ToggleGroupItem>
                  <ToggleGroupItem value="habits" className="flex-grow basis-[45%]">Build healthy habits</ToggleGroupItem>
                  <ToggleGroupItem value="therapy" className="flex-grow basis-[45%]">Support my therapy</ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6 py-4 animate-fade-in">
              <div className="space-y-2 text-center mb-6">
                <div className="flex justify-center mb-3">
                  <Shield className="h-10 w-10 text-blue-500" />
                </div>
                <h2 className="text-xl font-semibold">Privacy & Security</h2>
                <p className="text-slate-600 text-sm">Your data is yours - here's how we protect it</p>
              </div>
              
              <div className="space-y-4 text-sm text-slate-700">
                <p>Your journal entries are encrypted and stored securely. We take your privacy seriously.</p>
                
                <div className="flex items-start space-x-2 pt-2">
                  <Checkbox 
                    id="privacy-consent" 
                    checked={privacyConsent}
                    onCheckedChange={(checked) => setPrivacyConsent(checked === true)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="privacy-consent"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to the privacy policy
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Your data is encrypted and you can export or delete it at any time
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6 py-4 animate-fade-in">
              <div className="space-y-2 text-center mb-6">
                <h2 className="text-xl font-semibold">Optional Demographics</h2>
                <p className="text-slate-600 text-sm">This helps personalize your experience (completely optional)</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="age-range">Age Range</Label>
                  <Select value={age} onValueChange={setAge}>
                    <SelectTrigger id="age-range">
                      <SelectValue placeholder="Select age range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under-18">Under 18</SelectItem>
                      <SelectItem value="18-24">18-24</SelectItem>
                      <SelectItem value="25-34">25-34</SelectItem>
                      <SelectItem value="35-44">35-44</SelectItem>
                      <SelectItem value="45-54">45-54</SelectItem>
                      <SelectItem value="55-64">55-64</SelectItem>
                      <SelectItem value="65+">65+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <p className="text-xs text-slate-500 pt-2">
                  This data is only used to improve your AI insights and is never shared with third parties.
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="ghost"
            onClick={handlePrevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Button 
            onClick={handleNextStep}
            className="bg-blue-500 hover:bg-blue-600"
            disabled={currentStep === 3 && !privacyConsent}
          >
            {currentStep < totalSteps ? (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Get Started
                <Check className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Onboarding;
