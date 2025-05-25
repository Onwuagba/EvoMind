import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, PenTool, TrendingUp, Lightbulb, Clock, Settings, MessageCircle, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onNavigate }) => {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'journal', label: 'Journal', icon: PenTool },
    { id: 'companion', label: 'AI Chat', icon: MessageCircle },  // New
    { id: 'support', label: 'Support', icon: Heart },  // New
    { id: 'insights', label: 'Insights', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-neutral-100 p-2">
      <div className="max-w-md mx-auto">
        <div className="grid grid-cols-6 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "flex flex-col items-center gap-1.5 h-16 px-2 py-2 rounded-xl transition-all duration-300",
                  isActive
                    ? "bg-primary-light text-primary shadow-soft"
                    : "text-neutral-600 hover:text-primary hover:bg-primary-light/50",
                  "hover:shadow-hover"
                )}
              >
                <Icon 
                  className={cn(
                    "w-5 h-5 transition-all duration-200",
                    isActive ? "scale-110" : "scale-100",
                    "group-hover:scale-110"
                  )} 
                />
                <span 
                  className={cn(
                    "text-xs transition-all duration-200",
                    isActive ? "font-semibold" : "font-medium"
                  )}
                >
                  {item.label}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
