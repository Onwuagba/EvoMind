import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, ArrowLeft } from 'lucide-react';

interface CompanionProps {
  onNavigate: (page: string) => void;
}

export const Companion: React.FC<CompanionProps> = ({ onNavigate }) => {
  const [messages, setMessages] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
  }>>([
    {
      role: 'assistant',
      content: "Hi, I'm your AI companion. How are you feeling today?"
    }
  ]);

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
            <ArrowLeft className="w-5 h-5 text-neutral-600" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">AI Companion</h1>
            <p className="text-sm text-neutral-600">Chat with your supportive AI</p>
          </div>
        </div>

        {/* Chat Area */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4 space-y-4">
            <div className="chat-messages space-y-4 max-h-[60vh] overflow-y-auto">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`rounded-lg p-3 max-w-[80%] ${msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-neutral-100 text-neutral-900'
                    }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Input Area */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                className="flex-1 border-neutral-200 focus:border-primary"
              />
              <Button size="icon" className="bg-primary hover:bg-primary/90">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};