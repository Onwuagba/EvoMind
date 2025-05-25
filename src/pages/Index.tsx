
import React, { useState } from 'react';
import Dashboard from '@/components/Dashboard';
import Journal from '@/components/Journal';
import Analytics from '@/components/Analytics';
import Recommendations from '@/components/Recommendations';
import BottomNav from '@/components/BottomNav';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'journal':
        return <Journal onNavigate={setCurrentPage} />;
      case 'analytics':
        return <Analytics onNavigate={setCurrentPage} />;
      case 'recommendations':
        return <Recommendations onNavigate={setCurrentPage} />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50">
      {renderCurrentPage()}
      <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
    </div>
  );
};

export default Index;
