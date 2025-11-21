import React, { useState, useEffect } from 'react';
import { useAppStore } from './store';
import LandingPage from './components/layout/LandingPage';
import Auth from './components/layout/Auth';
import Dashboard from './components/chat/Dashboard';

const App: React.FC = () => {
  const { currentUser, theme } = useAppStore();
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // If user hasn't clicked "Start" on landing page and isn't logged in
  if (!started && !currentUser) {
    return <LandingPage onStart={() => setStarted(true)} />;
  }

  // If user clicked start but isn't logged in
  if (!currentUser) {
    return <Auth />;
  }

  // Main App
  return <Dashboard />;
};

export default App;