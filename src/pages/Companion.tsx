import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface CompanionProps {
  onNavigate: (page: string) => void;
}

export const Companion: React.FC<CompanionProps> = ({ onNavigate }) => {
  const [messages, setMessages] = React.useState<Array<{
    role: 'user' | 'assistant';
    content: string;
  }>>([
    {
      role: 'assistant',
      content: "Hi, I'm your AI companion. How are you feeling today?"
    }
  ]);

  return (
    <div className="min-h-screen p-4 pb-20">
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg text-neutral-900">AI Companion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Message display area */}
          <div className="chat-messages space-y-4 max-h-[60vh] overflow-y-auto">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-lg p-3 max-w-[80%] ${
                  msg.role === 'user' ? 'bg-primary text-white' : 'bg-neutral-100'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
          
          {/* Input area */}
          <div className="flex gap-2">
            <Input 
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};