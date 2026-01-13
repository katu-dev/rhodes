import { useState } from 'react';
import { GameProvider } from './context/GameContext';
import { AppLayout } from './components/layout/AppLayout';
import { LabScreen } from './components/game/LabScreen';
import { GachaScreen } from './components/game/GachaScreen';
import { CharacterList } from './components/game/CharacterList';
import { ArenaScreen } from './components/game/ArenaScreen';
import { BattleScreen } from './components/game/BattleScreen';
import { InventoryScreen } from './components/game/InventoryScreen';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginScreen } from './components/auth/LoginScreen';
import { RegisterScreen } from './components/auth/RegisterScreen';

import React from 'react';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-white bg-red-900 h-screen overflow-auto">
          <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
          <pre className="font-mono text-xs bg-black p-4 rounded">{this.state.error && this.state.error.toString()}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

function GameContent() {
  const { user, loading } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentTab, setCurrentTab] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return ['summon', 'roster', 'battle', 'arena', 'depot', 'lab'].includes(hash) ? hash : 'summon';
  });

  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['summon', 'roster', 'battle', 'arena', 'depot', 'lab'].includes(hash)) {
        setCurrentTab(hash);
      }
    };

    // Handle initial hash if present (in case of fresh load with hash)
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleTabChange = (tabId) => {
    window.location.hash = tabId;
    setCurrentTab(tabId);
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-zinc-950 font-mono text-tech-primary animate-pulse">
        INITIALIZING...
      </div>
    );
  }

  if (!user) {
    if (isRegistering) {
      return <RegisterScreen onLoginClick={() => setIsRegistering(false)} />;
    }
    return <LoginScreen onRegisterClick={() => setIsRegistering(true)} />;
  }

  return (
    <GameProvider>
      <AppLayout currentTab={currentTab} onTabChange={handleTabChange}>
        {/* Render Active Screen */}
        <div className="h-full w-full animate-in fade-in duration-300">
          {currentTab === 'summon' && <GachaScreen />}
          {currentTab === 'roster' && <CharacterList />}
          {currentTab === 'battle' && <BattleScreen />}
          {currentTab === 'arena' && <ArenaScreen />}
          {currentTab === 'depot' && <InventoryScreen />}
          {currentTab === 'lab' && <LabScreen />}
        </div>
      </AppLayout>
    </GameProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <GameContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
