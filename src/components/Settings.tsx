import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Download, Bell, Lock, Globe, FileText } from 'lucide-react';

interface SettingsProps {
  onNavigate: (page: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ onNavigate }) => {
  // Profile state
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    bio: '',
  });

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    journalReminders: true,
    weeklyInsights: true,
    crisisAlerts: true,
    tips: false,
  });

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    shareAnonymousData: false,
    allowAiAnalysis: true,
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    language: 'english',
    therapeuticApproach: 'cbt',
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleToggleChange = (setting: string, section: 'notifications' | 'privacySettings') => {
    if (section === 'notifications') {
      setNotifications(prev => ({
        ...prev,
        [setting]: !prev[setting as keyof typeof notifications]
      }));
    } else {
      setPrivacySettings(prev => ({
        ...prev,
        [setting]: !prev[setting as keyof typeof privacySettings]
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6 animate-fade-in">
        {/* Header Section */}
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
            <h1 className="text-xl font-bold text-neutral-900">Settings & Profile</h1>
            <p className="text-sm text-neutral-600">Customize your experience</p>
          </div>
        </div>

        {/* Wrap tabs components with Tabs */}
        <Tabs defaultValue="profile">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Alerts</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-neutral-900">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-neutral-900" htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    disabled
                  />
                  <p className="text-xs text-neutral-500">Email cannot be changed (managed by your social login)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">About Me</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={profile.bio}
                    onChange={handleProfileChange}
                    placeholder="Share a little about yourself..."
                    className="min-h-[100px] resize-none"
                  />
                </div>

                {/* Data Export */}
                <div className="pt-4">
                  <h3 className="text-sm font-medium mb-2">Data Export</h3>
                  <Button variant="outline" className="w-full" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export My Journal Data
                  </Button>
                  <p className="text-xs text-neutral-500 mt-1">
                    Download all your journal entries and insights as a JSON file
                  </p>
                </div>

                {/* Account Deletion */}
                <div className="pt-4">
                  <Button variant="destructive" className="w-full" size="sm">
                    Delete My Account
                  </Button>
                  <p className="text-xs text-neutral-500 mt-1">
                    This will permanently delete all your data
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-neutral-900">Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-neutral-900">Journal Reminders</Label>
                    <p className="text-xs text-neutral-500">
                      Daily reminders to write in your journal
                    </p>
                  </div>
                  <Switch
                    checked={notifications.journalReminders}
                    onCheckedChange={() => handleToggleChange('journalReminders', 'notifications')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-neutral-900">Weekly Insights</Label>
                    <p className="text-xs text-neutral-500">
                      Get a summary of your emotional patterns
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.weeklyInsights}
                    onCheckedChange={() => handleToggleChange('weeklyInsights', 'notifications')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-neutral-900">Crisis Alerts</Label>
                    <p className="text-xs text-neutral-500">
                      Important alerts when concerning patterns are detected
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.crisisAlerts}
                    onCheckedChange={() => handleToggleChange('crisisAlerts', 'notifications')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-neutral-900">Wellness Tips</Label>
                    <p className="text-xs text-neutral-500">
                      Occasional tips to improve emotional wellbeing
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.tips}
                    onCheckedChange={() => handleToggleChange('tips', 'notifications')}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-neutral-900">Privacy Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Share Anonymous Data</Label>
                    <p className="text-xs text-neutral-500">
                      Help improve our AI by sharing anonymized data
                    </p>
                  </div>
                  <Switch 
                    checked={privacySettings.shareAnonymousData}
                    onCheckedChange={() => handleToggleChange('shareAnonymousData', 'privacySettings')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>AI Analysis</Label>
                    <p className="text-xs text-neutral-500">
                      Allow AI to analyze your entries for personalized insights
                    </p>
                  </div>
                  <Switch 
                    checked={privacySettings.allowAiAnalysis}
                    onCheckedChange={() => handleToggleChange('allowAiAnalysis', 'privacySettings')}
                  />
                </div>

                <div className="pt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-neutral-500" />
                    <h3 className="text-sm font-medium text-neutral-900">Data Security</h3>
                  </div>
                  <p className="text-xs text-neutral-600">
                    Your journal entries are encrypted and stored securely. We don't share your personal information with third parties.
                  </p>
                </div>

                <div className="pt-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    View Privacy Policy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-neutral-900">Application Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-neutral-500" />
                    <Label htmlFor="language">Language</Label>
                  </div>
                  <Select 
                    value={preferences.language}
                    onValueChange={(value) => setPreferences(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger className="text-neutral-900" id="language">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem className="text-neutral-900" value="english">English</SelectItem>
                      <SelectItem className="text-neutral-900" value="spanish">Spanish</SelectItem>
                      <SelectItem className="text-neutral-900" value="french">French</SelectItem>
                      <SelectItem className="text-neutral-900" value="german">German</SelectItem>
                      <SelectItem className="text-neutral-900" value="chinese">Chinese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="therapeutic-approach">Therapeutic Approach</Label>
                  <Select 
                    value={preferences.therapeuticApproach}
                    onValueChange={(value) => setPreferences(prev => ({ ...prev, therapeuticApproach: value }))}
                  >
                    <SelectTrigger id="therapeutic-approach">
                      <SelectValue placeholder="Select Approach" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem className="text-neutral-900" value="cbt">Cognitive Behavioral Therapy (CBT)</SelectItem>
                      <SelectItem className="text-neutral-900" value="mindfulness">Mindfulness</SelectItem>
                      <SelectItem className="text-neutral-900" value="dbt">Dialectical Behavior Therapy</SelectItem>
                      <SelectItem className="text-neutral-900" value="psychodynamic">Psychodynamic</SelectItem>
                      <SelectItem className="text-neutral-900" value="humanistic">Humanistic</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-neutral-500">
                    This helps tailor recommendations to your preferred approach
                  </p>
                </div>

                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => {
                      // This would be handled by the ThemeProvider toggle
                      console.log('Toggle theme clicked');
                    }}
                  >
                    Toggle Dark/Light Mode
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
