
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Clock, Heart, Award } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsProps {
  onNavigate: (page: string) => void;
}

const Analytics: React.FC<AnalyticsProps> = ({ onNavigate }) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  // Sample data
  const weeklyMoodData = [
    { day: 'Mon', mood: 4, entries: 1 },
    { day: 'Tue', mood: 3, entries: 1 },
    { day: 'Wed', mood: 4, entries: 2 },
    { day: 'Thu', mood: 5, entries: 1 },
    { day: 'Fri', mood: 3, entries: 1 },
    { day: 'Sat', mood: 4, entries: 1 },
    { day: 'Sun', mood: 4, entries: 1 },
  ];

  const monthlyMoodData = [
    { week: 'Week 1', mood: 3.8 },
    { week: 'Week 2', mood: 4.2 },
    { week: 'Week 3', mood: 3.5 },
    { week: 'Week 4', mood: 4.0 },
  ];

  const timePatterns = [
    { time: 'Morning', count: 12, color: '#fbbf24' },
    { time: 'Afternoon', count: 8, color: '#60a5fa' },
    { time: 'Evening', count: 15, color: '#a78bfa' },
    { time: 'Night', count: 5, color: '#34d399' },
  ];

  const emotionalWords = [
    { word: 'grateful', count: 15, size: 24 },
    { word: 'anxious', count: 8, size: 16 },
    { word: 'peaceful', count: 12, size: 20 },
    { word: 'excited', count: 10, size: 18 },
    { word: 'tired', count: 6, size: 14 },
    { word: 'hopeful', count: 14, size: 22 },
  ];

  const currentData = timeRange === 'week' ? weeklyMoodData : monthlyMoodData;
  const averageMood = currentData.reduce((sum, item) => sum + item.mood, 0) / currentData.length;

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
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Analytics & Insights</h1>
            <p className="text-sm text-slate-600">Your emotional journey</p>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          <Button
            variant={timeRange === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('week')}
            className="flex-1"
          >
            This Week
          </Button>
          <Button
            variant={timeRange === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('month')}
            className="flex-1"
          >
            This Month
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-400/10 to-blue-500/10">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{averageMood.toFixed(1)}/5</div>
              <div className="text-sm text-slate-600">Average Mood</div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0 bg-gradient-to-r from-emerald-400/10 to-emerald-500/10">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">7</div>
              <div className="text-sm text-slate-600">Day Streak</div>
            </CardContent>
          </Card>
        </div>

        {/* Mood Timeline */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Emotional Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentData}>
                  <XAxis 
                    dataKey={timeRange === 'week' ? 'day' : 'week'} 
                    axisLine={false} 
                    tickLine={false} 
                    className="text-xs"
                  />
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

        {/* Time Patterns */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-500" />
              Best Writing Times
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {timePatterns.map((pattern) => (
                <div key={pattern.time} className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium">{pattern.time}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-slate-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${(pattern.count / 15) * 100}%`,
                          backgroundColor: pattern.color,
                        }}
                      />
                    </div>
                    <span className="text-sm text-slate-600 w-8">{pattern.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Emotional Words Cloud */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-400" />
              Emotional Words
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 justify-center">
              {emotionalWords.map((word) => (
                <span
                  key={word.word}
                  className="inline-block px-3 py-1 bg-gradient-to-r from-blue-100 to-emerald-100 text-slate-700 rounded-full font-medium transition-all duration-300 hover:scale-105"
                  style={{ fontSize: `${word.size}px` }}
                >
                  {word.word}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Insights Summary */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-amber-400/10 to-orange-400/10 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              Weekly Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-white/50 rounded-lg">
              <p className="text-sm text-slate-700">
                <strong>Pattern detected:</strong> You tend to feel most positive in the evenings, particularly after journaling.
              </p>
            </div>
            <div className="p-3 bg-white/50 rounded-lg">
              <p className="text-sm text-slate-700">
                <strong>Growth area:</strong> Your mood improved by 15% this week compared to last week!
              </p>
            </div>
            <div className="p-3 bg-white/50 rounded-lg">
              <p className="text-sm text-slate-700">
                <strong>Suggestion:</strong> Consider continuing your evening writing routine for optimal wellbeing.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
