import React, { useState, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import Journal from '@/components/Journal';
import Analytics from '@/components/Analytics';
import Recommendations from '@/components/Recommendations';
import BottomNav from '@/components/BottomNav';
import JournalHistory from '@/components/JournalHistory';
import Settings from '@/components/Settings';
import CrisisSupport from '@/components/CrisisSupport';
import ThemeToggle from '@/components/ThemeToggle';
import Authentication from '@/components/Authentication';
import Onboarding from '@/components/Onboarding';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
// import { Companion } from '@/components/Companion';
import { ProfessionalSupport } from '@/components/ProfessionalSupport';
import { Companion } from './Companion';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  // For demo purposes - in a real app this would be managed by Supabase auth
  // and proper database storage
  useEffect(() => {
    // Check if user is authenticated (local storage in this mockup)
    const savedAuth = localStorage.getItem('demo-auth');
    const savedOnboarding = localStorage.getItem('demo-onboarding');
    
    if (savedAuth) {
      setIsAuthenticated(true);
    }
    
    if (savedOnboarding) {
      setIsOnboardingComplete(true);
    }
  }, []);

  const handleAuthComplete = () => {
    localStorage.setItem('demo-auth', 'true');
    setIsAuthenticated(true);
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('demo-onboarding', 'true');
    setIsOnboardingComplete(true);
  };

  // Show the crisis support modal (could be triggered by AI or user)
  const handleShowCrisisSupport = () => {
    setShowCrisisModal(true);
  };

  // Render appropriate page based on auth and onboarding status
  if (!isAuthenticated) {
    return <Authentication onComplete={handleAuthComplete} />;
  }

  if (isAuthenticated && !isOnboardingComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'journal':
        return <Journal onNavigate={setCurrentPage} />;
      case 'journal-history':
        return <JournalHistory onNavigate={setCurrentPage} />;
      case 'analytics':
        return <Analytics onNavigate={setCurrentPage} />;
      case 'companion':
        return <Companion onNavigate={setCurrentPage} />;
      case 'support':
        return <ProfessionalSupport onNavigate={setCurrentPage} />;
      case 'recommendations':
        return <Recommendations onNavigate={setCurrentPage} />;
      case 'settings':
        return <Settings onNavigate={setCurrentPage} />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-slate-900 dark:to-gray-800 dark:text-slate-200">
      {/* Theme Toggle - Float in top corner */}
      <div className="fixed top-4 right-4 z-40">
        <ThemeToggle />
      </div>
      
      {/* Crisis Support Button - Float in corner */}
      <div className="fixed bottom-20 right-4 z-40">
        <Button 
          onClick={handleShowCrisisSupport}
          className="rounded-full h-12 w-12 bg-red-500 hover:bg-red-600 p-0 shadow-lg"
        >
          <AlertTriangle className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Content */}
      {renderCurrentPage()}
      
      {/* Bottom Navigation */}
      <BottomNav 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
      />
      
      {/* Crisis Support Modal */}
      <CrisisSupport 
        open={showCrisisModal} 
        onClose={() => setShowCrisisModal(false)} 
      />
    </div>
  );
};

export default Index;
