import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ArrowLeft, ArrowRight, Check, Shield, Target, User, Mail, KeyRound } from 'lucide-react';
import MoodSelector from './MoodSelector';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [goals, setGoals] = useState<string[]>([]);
  const [currentMood, setCurrentMood] = useState<number | null>(null);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);

  // Email validation function
  const isValidEmail = (email: string): boolean => {
    return /\S+@\S+\.\S+/.test(email);
  };

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
    // Background and card
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle>Welcome to Your Emotional Journey</CardTitle>
          <div className="flex justify-center items-center gap-1.5 mt-2">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full ${idx + 1 <= currentStep ? 'bg-teal-400 w-8' : 'bg-gray-200 w-6'
                  } transition-all duration-300`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <div className="space-y-6 py-4 animate-fade-in">
              <div className="space-y-2 text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">How are you feeling today?</h2>
                <p className="text-gray-600 text-sm">Let's start by understanding your current emotional state</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-3">
                  <MoodSelector
                    selectedMood={currentMood}
                    onMoodSelect={setCurrentMood}
                    size="large"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 py-4 animate-fade-in">
              <div className="space-y-2 text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Create your account</h2>
                <p className="text-gray-600 text-sm">Now, tell me about yourself.</p>
              </div>

              <div className="space-y-1.5">
                <p className="text-gray-500 text-xs mb-2">All fields are required</p>
                
                <div className="flex">
                  <div className="flex items-center justify-center px-3 bg-gradient-to-r from-blue-400 to-teal-400 text-white rounded-l-md border border-r-0 border-teal-400">
                    <User className="h-4 w-4" />
                  </div>
                  <Input
                    id="firstname"
                    placeholder="Your first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="border-gray-200 focus:border-teal-400 focus:ring-teal-400 bg-white text-gray-800 placeholder:text-gray-400 rounded-l-none"
                  />
                </div>
                
                <div className="flex">
                  <div className="flex items-center justify-center px-3 bg-gradient-to-r from-blue-400 to-teal-400 text-white rounded-l-md border border-r-0 border-teal-400">
                    <User className="h-4 w-4" />
                  </div>
                  <Input
                    id="lastname"
                    placeholder="Your last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="border-gray-200 focus:border-teal-400 focus:ring-teal-400 bg-white text-gray-800 placeholder:text-gray-400 rounded-l-none"
                  />
                </div>
                
                <div className="flex">
                  <div className="flex items-center justify-center px-3 bg-gradient-to-r from-blue-400 to-teal-400 text-white rounded-l-md border border-r-0 border-teal-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    type="email"
                    id="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    className="border-gray-200 focus:border-teal-400 focus:ring-teal-400 bg-white text-gray-800 placeholder:text-gray-400 rounded-l-none"
                  />
                </div>
                {emailTouched && email !== '' && !isValidEmail(email) && (
                  <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>
                )}
                
                <div className="flex">
                  <div className="flex items-center justify-center px-3 bg-gradient-to-r from-blue-400 to-teal-400 text-white rounded-l-md border border-r-0 border-teal-400">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <Input
                    type="password"
                    id="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setPasswordTouched(true)}
                    className="border-gray-200 focus:border-teal-400 focus:ring-teal-400 bg-white text-gray-800 placeholder:text-gray-400 rounded-l-none"
                  />
                </div>
                {passwordTouched && password.length < 6 && password !== '' && (
                  <p className="text-red-500 text-sm mt-1">Password must be at least 6 characters</p>
                )}
                
                <div className="flex">
                  <div className="flex items-center justify-center px-3 bg-gradient-to-r from-blue-400 to-teal-400 text-white rounded-l-md border border-r-0 border-teal-400">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <Input
                    type="password"
                    id="confirm-password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => setConfirmPasswordTouched(true)}
                    className="border-gray-200 focus:border-teal-400 focus:ring-teal-400 bg-white text-gray-800 placeholder:text-gray-400 rounded-l-none"
                  />
                </div>
                {confirmPasswordTouched && password !== confirmPassword && confirmPassword !== '' && (
                  <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
                )}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6 py-4 animate-fade-in">
              <div className="space-y-2 text-center mb-6">
                <div className="flex justify-center mb-3">
                  {/* Icons */}
                  <Target className="h-10 w-10 text-teal-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Set Your Goals</h2>
                <p className="text-blue-600/70 text-sm">What do you hope to achieve with this app?</p>
              </div>

              <div className="space-y-4">
                <Label className="text-gray-800">Select your goals (choose all that apply):</Label>
                <ToggleGroup
                  type="multiple"
                  variant="outline"
                  className="flex flex-wrap gap-2"
                  value={goals}
                  onValueChange={setGoals}
                >
                  <ToggleGroupItem
                    value="track"
                    className="flex-grow basis-[45%] text-gray-900 hover:bg-gray-100 hover:text-gray-900 data-[state=on]:bg-blue-100 data-[state=on]:text-blue-900 border-blue-200"
                  >
                    Track mood patterns
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="stress"
                    className="flex-grow basis-[45%] text-gray-900 hover:bg-gray-100 hover:text-gray-900 data-[state=on]:bg-blue-100 data-[state=on]:text-blue-900 border-blue-200"
                  >
                    Reduce stress & anxiety
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="mindfulness"
                    className="flex-grow basis-[45%] text-gray-900 hover:bg-gray-100 hover:text-gray-900 data-[state=on]:bg-blue-100 data-[state=on]:text-blue-900 border-blue-200"
                  >
                    Practice mindfulness
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="insights"
                    className="flex-grow basis-[45%] text-gray-900 hover:bg-gray-100 hover:text-gray-900 data-[state=on]:bg-blue-100 data-[state=on]:text-blue-900 border-blue-200"
                  >
                    Gain self-awareness
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="habits"
                    className="flex-grow basis-[45%] text-gray-900 hover:bg-gray-100 hover:text-gray-900 data-[state=on]:bg-blue-100 data-[state=on]:text-blue-900 border-blue-200"
                  >
                    Build healthy habits
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="therapy"
                    className="flex-grow basis-[45%] text-gray-900 hover:bg-gray-100 hover:text-gray-900 data-[state=on]:bg-blue-100 data-[state=on]:text-blue-900 border-blue-200"
                  >
                    Support my therapy
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6 py-4 animate-fade-in">
              <div className="space-y-2 text-center mb-6">
                <div className="flex justify-center mb-3">
                  {/* Icons */}
                  <Shield className="h-10 w-10 text-teal-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Privacy & Security</h2>
                <p className="text-slate-600 text-sm">Your data is yours - here's how we protect it</p>
              </div>

              <div className="space-y-4 text-sm text-blue-700">

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
                    <p className="text-xs text-blue-600/70">
                      Your data is encrypted and you can export or delete it at any time
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6 py-4 animate-fade-in">
              <div className="space-y-2 text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Optional Demographics</h2>
                <p className="text-blue-600/70 text-sm">This helps personalize your experience (completely optional)</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="age-range" className="text-gray-700">Age Range</Label>
                  <Select value={age} onValueChange={setAge}>
                    <SelectTrigger
                      id="age-range"
                      className="w-full border-gray-200 bg-white text-gray-900 hover:bg-gray-50 focus:ring-blue-400 focus:border-blue-400"
                    >
                      <SelectValue placeholder="Select age range" className="text-gray-600" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem
                        value="under-18"
                        className="text-gray-900 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900">
                        Under 18
                      </SelectItem>
                      <SelectItem
                        value="18-24"
                        className="text-gray-900 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900">
                        18-24
                      </SelectItem>
                      <SelectItem
                        value="25-34"
                        className="text-gray-900 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900">
                        25-34
                      </SelectItem>
                      <SelectItem
                        value="35-44"
                        className="text-gray-900 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900">
                        35-44
                      </SelectItem>
                      <SelectItem
                        value="45-54"
                        className="text-gray-900 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900">
                        45-54
                      </SelectItem>
                      <SelectItem
                        value="55-64"
                        className="text-gray-900 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900">
                        55-64
                      </SelectItem>
                      <SelectItem
                        value="65+"
                        className="text-gray-900 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900">
                        65+
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="gender" className="text-gray-700">Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger
                      id="gender"
                      className="w-full border-gray-200 bg-white text-gray-900 hover:bg-gray-50 focus:ring-blue-400 focus:border-blue-400"
                    >
                      <SelectValue placeholder="Select gender" className="text-gray-600" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem
                        value="Male"
                        className="text-gray-900 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900">
                        Male
                      </SelectItem>
                      <SelectItem
                        value="Female"
                        className="text-gray-900 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900">
                        Female
                      </SelectItem>
                      <SelectItem
                        value="Non-binary"
                        className="text-gray-900 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900">
                        Non-binary
                      </SelectItem>
                      <SelectItem
                        value="Other"
                        className="text-gray-900 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900">
                        Other
                      </SelectItem>
                      <SelectItem
                        value="Prefer not to say"
                        className="text-gray-900 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900">
                        Prefer not to say
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <p className="text-xs text-blue-600/70 pt-2">
                  This data is only used to improve your AI insights and is never shared with third parties.
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {/* Buttons */}
          <Button
            variant="outline"
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            className="text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Button
            onClick={handleNextStep}
            className="bg-teal-500 hover:bg-teal-600 text-white"
            disabled={
              (currentStep === 1 && currentMood === null) || 
              (currentStep === 2 && (firstName === '' || lastName === '' || email === '' || !isValidEmail(email) || password === '' || password.length < 6 || confirmPassword === '' || password !== confirmPassword)) ||
              (currentStep === 3 && goals.length === 0) || 
              (currentStep === 4 && !privacyConsent)
            }
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
