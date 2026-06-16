import { useState, useEffect } from 'react';
import { useGameStore } from './store/useGameStore';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { BeachScene } from './scenes/BeachScene';
import { ClinicScene } from './scenes/ClinicScene';
import { WarehouseScene } from './scenes/WarehouseScene';
import { AlbumScene } from './scenes/AlbumScene';
import { TasksScene } from './scenes/TasksScene';
import { WelcomeModal } from './components/WelcomeModal';

function App() {
  const { currentScene, day } = useGameStore();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const hasPlayed = localStorage.getItem('island-rescue-played');
    if (!hasPlayed && day === 1) {
      setShowWelcome(true);
    }
  }, [day]);

  const handleStart = () => {
    localStorage.setItem('island-rescue-played', 'true');
    setShowWelcome(false);
  };

  const renderScene = () => {
    switch (currentScene) {
      case 'beach':
        return <BeachScene />;
      case 'clinic':
        return <ClinicScene />;
      case 'warehouse':
        return <WarehouseScene />;
      case 'album':
        return <AlbumScene />;
      case 'tasks':
        return <TasksScene />;
      default:
        return <BeachScene />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {showWelcome && <WelcomeModal onStart={handleStart} />}
      <TopBar />
      <main className="flex-1 overflow-hidden">
        {renderScene()}
      </main>
      <BottomNav />
    </div>
  );
}

export default App;
