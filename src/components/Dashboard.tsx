import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, PenTool, TrendingUp, Calendar, Award } from 'lucide-react';
import MoodSelector from './MoodSelector';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [userName, setUserName] = useState('User');
  const [streak, setStreak] = useState(7);
  const [todayMood, setTodayMood] = useState<number | null>(null);

  useEffect(() => {
    const storedName = localStorage.getItem('firstName');
    if (storedName) {
      setUserName(toTitleCase(storedName));
    }
  }, []);

  // Sample data for the mini chart
  const weeklyData = [
    { day: 'Mon', mood: 4 },
    { day: 'Tue', mood: 3 },
    { day: 'Wed', mood: 4 },
    { day: 'Thu', mood: 5 },
    { day: 'Fri', mood: 3 },
    { day: 'Sat', mood: 4 },
    { day: 'Sun', mood: todayMood || 0 },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleMoodSelect = (mood: number) => {
    setTodayMood(mood);
    console.log('Mood selected:', mood);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6 animate-fade-in">
        {/* Welcome Header */}
        <div className="text-center mb-8 pt-4">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            {getGreeting()}, {userName}! 👋
          </h1>
          <p className="text-slate-600">How are you feeling today?</p>
        </div>

        {/* Quick Mood Check-in */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm animate-slide-up">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-400" />
              Daily Check-in
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MoodSelector
              selectedMood={todayMood}
              onMoodSelect={handleMoodSelect}
              size="large"
            />
            {todayMood && (
              <p className="text-center text-slate-600 mt-3 animate-scale-in">
                Thanks for sharing! Your mood has been recorded.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => onNavigate('journal')}
            className="h-24 flex flex-col gap-2 bg-blue-500 hover:bg-blue-600 text-white shadow-lg rounded-xl transition-all duration-300 hover:scale-105"
          >
            <PenTool className="w-6 h-6" />
            <span className="text-sm font-medium">Write Entry</span>
          </Button>

          <Button
            onClick={() => onNavigate('insights')}
            variant="outline"
            className="h-24 flex flex-col gap-2 border-2 border-emerald-200 hover:bg-emerald-50 text-emerald-700 shadow-lg rounded-xl transition-all duration-300 hover:scale-105"
          >
            <TrendingUp className="w-6 h-6" />
            <span className="text-sm font-medium">View Insights</span>
          </Button>
        </div>

        {/* Today's Snapshot */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-400/10 to-emerald-400/10 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Today's Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 rounded-lg bg-white/50">
                <div className="text-2xl font-bold text-blue-600">{todayMood || '?'}/5</div>
                <div className="text-sm text-slate-600">Current Mood</div>
              </div>
              <div className="p-3 rounded-lg bg-white/50">
                <div className="text-2xl font-bold text-emerald-600">{streak}</div>
                <div className="text-sm text-slate-600">Day Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Trend */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-800">
              Weekly Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} className="text-xs" />
                  <YAxis hide domain={[1, 5]} />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#1d4ed8' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Achievement Badge */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-amber-400/10 to-orange-400/10 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-amber-100">
                <Award className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-800">Week Warrior!</div>
                <div className="text-sm text-slate-600">7 days of consistent journaling</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
