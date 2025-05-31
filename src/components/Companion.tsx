import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, ArrowLeft, Loader2 } from 'lucide-react';
import { api } from '@/lib/axios';
import { format } from 'date-fns';

interface CompanionProps {
  onNavigate: (page: string) => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatResponse {
  status: string;
  data: {
    message: {
      content: string;
      response: string;
    };
    suggestions: string[];
  };
}

interface ChatSession {
  id: number;
  title: string;
  last_message: string;
  created_at: string;
  messages: Array<{
    id: number;
    content: string;
    response: string;
    created_at: string;
  }>;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ChatSession[];
}

export const Companion: React.FC<CompanionProps> = ({ onNavigate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat history on component mount
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await api.get<PaginatedResponse>('/chat/');
        if (response.data.results) {
          // Transform chat history into messages format
          const historicalMessages = response.data.results.reverse().flatMap(session =>
            session.messages.map(msg => [
              {
                role: 'user' as const,
                content: msg.content,
                timestamp: new Date(msg.created_at)
              },
              {
                role: 'assistant' as const,
                content: msg.response,
                timestamp: new Date(msg.created_at)
              }
            ]).flat()
          );

          setMessages([
            {
              role: 'assistant',
              content: "Hi, I'm your AI companion. How are you feeling today?",
              timestamp: new Date()
            },
            ...historicalMessages
          ]);

          // Set pagination state
          setHasMore(!!response.data.next);
          setNextPage(response.data.next);
        }
      } catch (error) {
        console.error('Failed to fetch chat history:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchChatHistory();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    try {
      setIsLoading(true);
      setMessages(prev => [...prev, {
        role: 'user',
        content: inputMessage,
        timestamp: new Date()
      }]);
      setInputMessage('');

      const response = await api.post<ChatResponse>('/chat/send_message/', {
        message: inputMessage
      });

      if (response.data.status === 'success') {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: response.data.data.message.response,
            timestamp: new Date()
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm sorry, I'm having trouble responding right now. Please try again later.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Load more messages when scrolling to top
  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    if (scrollTop === 0 && hasMore && !isLoading) {
      try {
        setIsLoading(true);
        const response = await api.get<PaginatedResponse>(nextPage!);

        const moreMessages = response.data.results.reverse().flatMap(session =>
          session.messages.map(msg => [
            {
              role: 'user' as const,
              content: msg.content,
              timestamp: new Date(msg.created_at)
            },
            {
              role: 'assistant' as const,
              content: msg.response,
              timestamp: new Date(msg.created_at)
            }
          ]).flat()
        );

        setMessages(prev => [...prev, ...moreMessages]);
        setHasMore(!!response.data.next);
        setNextPage(response.data.next);
      } catch (error) {
        console.error('Failed to load more messages:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = format(message.timestamp, 'PP');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, ChatMessage[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6"> {/* Changed to max-w-md to match other pages */}
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('dashboard')}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">AI Companion</h1>
            <p className="text-sm text-slate-600">Chat with your supportive AI</p>
          </div>
        </div>

        {/* Chat Area */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            {isInitialLoading ? (
              <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div
                className="chat-messages space-y-6 max-h-[60vh] overflow-y-auto"
                onScroll={handleScroll}
              >
                {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                  <div key={date} className="space-y-4">
                    <div className="flex justify-center">
                      <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                        {date}
                      </span>
                    </div>
                    {dateMessages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`rounded-2xl p-4 max-w-[80%] space-y-1 ${msg.role === 'user'
                          ? 'bg-indigo-600 text-white shadow-indigo-100'
                          : 'bg-gray-100 text-gray-900 shadow-gray-100'
                          } shadow-lg`}>
                          <div>{msg.content}</div>
                          <div className={`text-xs ${msg.role === 'user' ? 'text-indigo-100' : 'text-gray-500'
                            }`}>
                            {format(msg.timestamp, 'p')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Input Area */}
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border-2 border-gray-200 focus:border-indigo-500 rounded-xl"
                disabled={isLoading}
              />
              <Button
                size="icon"
                className="bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200"
                onClick={handleSendMessage}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};