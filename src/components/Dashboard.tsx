import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, PenTool, TrendingUp, Calendar, Award, Loader2, Quote } from 'lucide-react';
import MoodSelector from './MoodSelector';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { getDashboardData, saveMoodEntry, type DashboardResponse } from '@/lib/api';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );
}

interface DashboardData {
  user: {
    firstName: string;
    onboardingComplete: boolean;
  };
  todayMood: number | null;
  streak: {
    count: number;
    achievement: string | null;
    description: string | null;
    nextMilestone: number | null;
  };
  weeklyTrend: Array<{
    day: string;
    mood: number | null;
  }>;
  stats: {
    journalCount: number;
    moodCheckIns: number;
  };
  dailyQuote?: {
    text: string | null;
    author: string | null;
    context: string | null;
  };
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [userName, setUserName] = useState('User');
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [todayMood, setTodayMood] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await getDashboardData();
        if (response.status === 'success') {
          const transformedData: DashboardData = {
            ...response.data,
            weeklyTrend: transformWeeklyTrend(response.data.weeklyTrend),
            user: response.data.user
          };
          setDashboardData(transformedData);
          // Update userName from the dashboard data
          if (transformedData.user?.firstName) {
            setUserName(toTitleCase(transformedData.user.firstName));
          }
        }
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleMoodSelect = async (mood: number) => {
    try {
      setTodayMood(mood);
      await saveMoodEntry(mood);

      // Show success message
      setShowSuccess(true);

      // Hide after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);

      // Refetch dashboard data
      const response = await getDashboardData();
      if (response.status === 'success') {
        setDashboardData(response.data);
      }
    } catch (err) {
      setError('Failed to save mood');
      console.error('Mood save error:', err);
    }
  };

  const transformWeeklyTrend = (data: Array<{ day: string; mood: number | null }>) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Go to Sunday

    return days.map((day) => {
      const existingData = data.find(d => d.day === day);
      return {
        day,
        mood: existingData?.mood || 0 // Replace null with 0
      };
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 p-4 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-2">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              selectedMood={dashboardData?.todayMood || null}
              onMoodSelect={handleMoodSelect}
              size="large"
            />
            {showSuccess && (
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
                <div className="text-2xl font-bold text-blue-600">
                  {dashboardData?.todayMood || '?'}/5
                </div>
                <div className="text-sm text-slate-600">Current Mood</div>
              </div>
              <div className="p-3 rounded-lg bg-white/50">
                <div className="text-2xl font-bold text-emerald-600">
                  {dashboardData?.streak.count || 0}
                </div>
                <div className="text-sm text-slate-600">Day Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Quote Card - Moved up */}
        {dashboardData?.dailyQuote?.text && (
          <Card className="shadow-lg border-0 bg-gradient-to-r from-purple-400/10 to-blue-400/10 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-blue-100 shrink-0">
                    <Quote className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <blockquote className="text-slate-800 font-medium italic leading-relaxed">
                      "{dashboardData.dailyQuote.text}"
                    </blockquote>
                    {dashboardData.dailyQuote.author && (
                      <cite className="block text-sm text-slate-600 mt-2 not-italic">
                        — {dashboardData.dailyQuote.author}
                      </cite>
                    )}
                  </div>
                </div>
                {dashboardData.dailyQuote.context && (
                  <div className="text-sm text-slate-600 bg-white/50 rounded-lg p-3 mt-2">
                    <p>{dashboardData.dailyQuote.context}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

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
                <LineChart data={dashboardData?.weeklyTrend || []}>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    className="text-xs"
                  />
                  <YAxis hide domain={[1, 5]} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-2 shadow-lg rounded-lg border border-neutral-200">
                            <p className="text-sm font-medium text-neutral-900">
                              {label}
                            </p>
                            <p className="text-sm text-neutral-600">
                              Mood: {payload[0].value}/5
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
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

        {/* Achievement Badge - Only show when there's an achievement */}
        {dashboardData?.streak.achievement && (
          <Card className="shadow-lg border-0 bg-gradient-to-r from-amber-400/10 to-orange-400/10 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-amber-100">
                  <Award className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">
                    {dashboardData.streak.achievement}
                  </div>
                  <div className="text-sm text-slate-600">
                    {dashboardData.streak.description}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
