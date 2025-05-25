
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Heart, Share2, Calendar, TrendingUp } from 'lucide-react';

interface JournalEntry {
  id: string;
  date: string;
  content: string;
  beforeMood: number;
  afterMood: number;
  wordCount: number;
  isFavorite: boolean;
}

interface JournalHistoryProps {
  onNavigate: (page: string) => void;
}

const JournalHistory: React.FC<JournalHistoryProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  // Mock data - replace with real data from Supabase
  const [journalEntries] = useState<JournalEntry[]>([
    {
      id: '1',
      date: '2024-01-15',
      content: 'Today was challenging but I managed to stay positive. Work was stressful but I took breaks and practiced breathing exercises.',
      beforeMood: 2,
      afterMood: 4,
      wordCount: 87,
      isFavorite: true
    },
    {
      id: '2',
      date: '2024-01-14',
      content: 'Had a great day with friends. Feeling grateful for the connections in my life.',
      beforeMood: 4,
      afterMood: 5,
      wordCount: 45,
      isFavorite: false
    }
  ]);

  const filteredEntries = journalEntries.filter(entry =>
    entry.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMoodEmoji = (mood: number) => {
    const emojis = ['😢', '😔', '😐', '😊', '😄'];
    return emojis[mood - 1] || '😐';
  };

  const getMoodImprovement = (before: number, after: number) => {
    const diff = after - before;
    if (diff > 0) return { text: `+${diff}`, color: 'text-green-600', icon: TrendingUp };
    if (diff < 0) return { text: `${diff}`, color: 'text-red-600', icon: TrendingUp };
    return { text: '0', color: 'text-slate-600', icon: TrendingUp };
  };

  if (selectedEntry) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 p-4 pb-20">
        <div className="max-w-md mx-auto space-y-6 animate-fade-in">
          <div className="flex items-center gap-4 pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedEntry(null)}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Journal Entry</h1>
              <p className="text-sm text-slate-600">
                {new Date(selectedEntry.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Entry Details</CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Heart className={`w-4 h-4 ${selectedEntry.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-slate-700 leading-relaxed">{selectedEntry.content}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">Before Writing</p>
                  <div className="text-2xl mb-1">{getMoodEmoji(selectedEntry.beforeMood)}</div>
                  <p className="text-sm font-medium">Mood: {selectedEntry.beforeMood}/5</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">After Writing</p>
                  <div className="text-2xl mb-1">{getMoodEmoji(selectedEntry.afterMood)}</div>
                  <p className="text-sm font-medium">Mood: {selectedEntry.afterMood}/5</p>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm text-slate-600">
                <span>{selectedEntry.wordCount} words</span>
                {(() => {
                  const improvement = getMoodImprovement(selectedEntry.beforeMood, selectedEntry.afterMood);
                  return (
                    <span className={`flex items-center gap-1 ${improvement.color}`}>
                      <improvement.icon className="w-4 h-4" />
                      {improvement.text}
                    </span>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6 animate-fade-in">
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
            <h1 className="text-xl font-bold text-slate-800">Journal History</h1>
            <p className="text-sm text-slate-600">{journalEntries.length} entries</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
          <Input 
            placeholder="Search your journal entries..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {filteredEntries.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-slate-600">No journal entries found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEntries.map((entry) => (
              <Card key={entry.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4" onClick={() => setSelectedEntry(entry)}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span className="text-sm text-slate-600">
                        {new Date(entry.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {entry.isFavorite && (
                        <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                      )}
                      <div className="flex gap-1 items-center">
                        <span className="text-slate-600">{getMoodEmoji(entry.beforeMood)}</span>
                        <span className="text-xs">→</span>
                        <span className="text-slate-600">{getMoodEmoji(entry.afterMood)}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 line-clamp-2">
                    {entry.content}
                  </p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-slate-500">{entry.wordCount} words</span>
                    {(() => {
                      const improvement = getMoodImprovement(entry.beforeMood, entry.afterMood);
                      return (
                        <Badge variant="outline" className={improvement.color}>
                          <improvement.icon className="w-3 h-3 mr-1" />
                          {improvement.text} mood
                        </Badge>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Button 
          onClick={() => onNavigate('journal')}
          className="w-full bg-blue-500 hover:bg-blue-600"
        >
          Write New Entry
        </Button>
      </div>
    </div>
  );
};

export default JournalHistory;
