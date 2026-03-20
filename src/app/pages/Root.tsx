import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '../components/ui/sonner';
import { AuthProvider } from '../context/AuthContext';
import { IntroAnimation } from '../components/IntroAnimation';
import { Navbar } from '../components/Navbar';

export const Root: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    // Check if intro has been shown before
    const introShown = sessionStorage.getItem('introShown');
    if (introShown) {
      setShowIntro(false);
    }
  }, []);

  const handleIntroComplete = () => {
    sessionStorage.setItem('introShown', 'true');
    setShowIntro(false);
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="pt-20">
            <Outlet />
          </main>
          <Toaster />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
};
