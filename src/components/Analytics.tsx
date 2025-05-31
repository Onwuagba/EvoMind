import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Clock, Heart, Award } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/axios';

interface AnalyticsProps {
  onNavigate: (page: string) => void;
}

interface AnalyticsData {
  average_mood: number;
  streak: number;
  timeline: Array<{
    date: string;
    mood: number;
  }>;
  writing_times: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
  emotional_words: Record<string, number>;
  insights: {
    pattern_detected: string;
    growth_area: string;
    suggestion: string;
  };
}

const Analytics: React.FC<AnalyticsProps> = ({ onNavigate }) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/users/analytics/?period=${timeRange}`);
        setAnalyticsData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 p-4 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Transform API data for charts
  const timelineData = analyticsData?.timeline.map(entry => ({
    day: entry.date,
    mood: entry.mood
  })) || [];

  const timePatterns = [
    { time: 'Morning', count: analyticsData?.writing_times.morning || 0, color: '#fbbf24' },
    { time: 'Afternoon', count: analyticsData?.writing_times.afternoon || 0, color: '#60a5fa' },
    { time: 'Evening', count: analyticsData?.writing_times.evening || 0, color: '#a78bfa' },
    { time: 'Night', count: analyticsData?.writing_times.night || 0, color: '#34d399' }
  ];

  const emotionalWords = Object.entries(analyticsData?.emotional_words || {}).map(([word, count]) => ({
    word,
    count,
    size: Math.max(14, Math.min(24, 14 + (count * 2))) // Scale size between 14-24px
  }));

  const averageMood = analyticsData?.average_mood || 0;

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
              <div className="text-2xl font-bold text-blue-600">
                {averageMood.toFixed(1)}/5
              </div>
              <div className="text-sm text-slate-600">Average Mood</div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0 bg-gradient-to-r from-emerald-400/10 to-emerald-500/10">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {analyticsData?.streak || 0}
              </div>
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
                <LineChart data={timelineData}>
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
              {timeRange === 'week' ? 'Weekly' : 'Monthly'} Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-white/50 rounded-lg">
              <p className="text-sm text-slate-700">
                <strong>Pattern detected:</strong> {analyticsData?.insights.pattern_detected}
              </p>
            </div>
            <div className="p-3 bg-white/50 rounded-lg">
              <p className="text-sm text-slate-700">
                <strong>Growth area:</strong> {analyticsData?.insights.growth_area}
              </p>
            </div>
            <div className="p-3 bg-white/50 rounded-lg">
              <p className="text-sm text-slate-700">
                <strong>Suggestion:</strong> {analyticsData?.insights.suggestion}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
