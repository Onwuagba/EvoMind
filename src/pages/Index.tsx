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
import { ProfessionalSupport } from '@/components/ProfessionalSupport';
import { Companion } from '../components/Companion';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store';

const Index = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [pendingOnboarding, setPendingOnboarding] = useState(false);

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setPendingOnboarding(false);
    setCurrentPage('dashboard');
  };

  // Handle authentication completion
  const handleAuthComplete = (isNewUser: boolean = false) => {
    if (isNewUser) {
      // New user from signup - show onboarding
      setPendingOnboarding(true);
      setShowOnboarding(true);
    } else {
      // Existing user from signin - go to dashboard
      setCurrentPage('dashboard');
    }
  };

  // Check if user needs onboarding when authenticated
  // useEffect(() => {
  //   if (isAuthenticated && user && !user.onboardingComplete) {
  //     setShowOnboarding(true);
  //   }
  // }, [isAuthenticated, user]);

  // For unauthenticated users: show Authentication component unless pending onboarding
  if (!isAuthenticated && !pendingOnboarding) {
    return <Authentication onComplete={handleAuthComplete} />;
  }

  // For users pending onboarding (new signups) or authenticated users who haven't completed onboarding
  if (showOnboarding) {
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
      case 'insights':
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
          onClick={() => setShowCrisisModal(true)}
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