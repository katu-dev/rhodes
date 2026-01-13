import { useState } from 'react';
import { GameProvider } from './context/GameContext';
import { AppLayout } from './components/layout/AppLayout';
import { GachaScreen } from './components/game/GachaScreen';
import { CharacterList } from './components/game/CharacterList';
import { ArenaScreen } from './components/game/ArenaScreen';
import { BattleScreen } from './components/game/BattleScreen';
import { InventoryScreen } from './components/game/InventoryScreen';

import React from 'react';

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

function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState('summon');

  return (
    <ErrorBoundary>
      <GameProvider>
        <AppLayout currentTab={currentTab} onTabChange={setCurrentTab}>
          {/* Render Active Screen */}
          <div className="h-full w-full animate-in fade-in duration-300">
            {currentTab === 'summon' && <GachaScreen />}
            {currentTab === 'roster' && <CharacterList />}
            {currentTab === 'battle' && <BattleScreen />}
            {currentTab === 'arena' && <ArenaScreen />}
            {currentTab === 'depot' && <InventoryScreen />}
          </div>
        </AppLayout>
      </GameProvider>
    </ErrorBoundary>
  );
}

export default App;
