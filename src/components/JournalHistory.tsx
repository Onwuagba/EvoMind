import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Search,
  Heart,
  Share2,
  Calendar,
  TrendingUp,
  Sparkles,
  BookOpen,
  AlignLeft // Add this import
} from 'lucide-react';
import { api } from '@/lib/axios';

interface JournalEntry {
  id: number;
  content: string;
  before_mood: number | null;
  after_mood: number | null;
  created_at: string;
  updated_at: string;
  user: number;
  isFavorite?: boolean;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface JournalHistoryProps {
  onNavigate: (page: string) => void;
}

const JournalHistory: React.FC<JournalHistoryProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  // Fetch journal entries
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/journals/history/');
        if (response.data.status === 'success') {
          setEntries(response.data.data);
          setPagination(response.data.meta.pagination);
        }
      } catch (err) {
        setError('Failed to load journal entries');
        console.error('Error fetching entries:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, []);

  const filteredEntries = entries.filter(entry =>
    entry.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMoodEmoji = (mood: number | null) => {
    if (!mood) return '😐';
    const emojis = ['😢', '😔', '😐', '😊', '😄'];
    return emojis[Math.floor((mood / 2) - 1)] || '😐';
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
        <div className="max-w-sm mx-auto space-y-6 animate-fade-in">
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
                {new Date(selectedEntry.created_at).toLocaleDateString('en-US', {
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
                  <div className="text-2xl mb-1">{getMoodEmoji(selectedEntry.before_mood)}</div>
                  <p className="text-sm font-medium">Mood: {selectedEntry.before_mood}/5</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">After Writing</p>
                  <div className="text-2xl mb-1">{getMoodEmoji(selectedEntry.after_mood)}</div>
                  <p className="text-sm font-medium">Mood: {selectedEntry.after_mood}/5</p>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm text-slate-600">
                <span>{selectedEntry.content.split(' ').length} words</span>
                {(() => {
                  const improvement = getMoodImprovement(
                    selectedEntry.before_mood ?? 0,
                    selectedEntry.after_mood ?? 0
                  );
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 p-4 flex items-center justify-center">
        <div className="animate-spin">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 p-4 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6 animate-fade-in">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('journal')}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Reflection Journal</h1>
              <p className="text-sm text-slate-600">Your journey of self-discovery</p>
            </div>
          </div>
          <Button
            onClick={() => onNavigate('journal')}
            className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            New Entry
          </Button>
        </div>

        {/* Enhanced Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
          <Input
            placeholder="Search your journal entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 border border-slate-200 rounded-xl shadow-sm placeholder:text-slate-400 text-slate-700 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Journal Entries List */}
        {filteredEntries.length === 0 ? (
          <div className="text-center p-12 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-100">
            <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-600 font-medium">No journal entries found</p>
            <p className="text-slate-400 text-sm mt-1">Start writing to begin your journey</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <Card
                key={entry.id}
                className="border-0 shadow-sm hover:shadow-md transition-all duration-200 hover:translate-y-[-2px] cursor-pointer bg-white/80 backdrop-blur-sm"
              >
                <CardContent className="p-5" onClick={() => setSelectedEntry(entry)}>
                  {/* Date and Mood */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Calendar className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {new Date(entry.created_at).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(entry.created_at).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 items-center bg-slate-50 px-3 py-1 rounded-full">
                      {entry.before_mood && <span>{getMoodEmoji(entry.before_mood)}</span>}
                      {entry.before_mood && entry.after_mood && (
                        <ArrowLeft className="w-3 h-3 text-slate-400 mx-1" />
                      )}
                      {entry.after_mood && <span>{getMoodEmoji(entry.after_mood)}</span>}
                    </div>
                  </div>

                  {/* Content Preview */}
                  <p className="text-slate-700 line-clamp-2 mb-3">
                    {entry.content}
                  </p>

                  {/* Footer */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <AlignLeft className="w-3 h-3" />
                      {entry.content.split(' ').length} words
                    </span>
                    <div className="flex gap-2">
                      {entry.before_mood && entry.after_mood && (
                        <Badge
                          variant="outline"
                          className={`${entry.after_mood > entry.before_mood
                            ? 'text-green-600 bg-green-50'
                            : 'text-blue-600 bg-blue-50'
                            }`}
                        >
                          {entry.after_mood > entry.before_mood ? '+' : ''}
                          {entry.after_mood - entry.before_mood} mood change
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: pagination.totalPages }, (_, i) => (
              <Button
                key={i}
                variant={pagination.page === i + 1 ? 'default' : 'outline'}
                size="sm"
                className="w-10 h-10"
              >
                {i + 1}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalHistory;
