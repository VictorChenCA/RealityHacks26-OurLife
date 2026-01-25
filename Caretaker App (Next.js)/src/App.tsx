import { useState } from 'react';
import { Home } from './components/Home';
import { Reminders } from './components/Reminders';
import { Memories } from './components/Memories';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'reminders' | 'memories'>('home');

  return (
    <div className="size-full flex items-center justify-center bg-gray-100">
      <div className="w-[402px] h-[874px] bg-[#f7fbff] relative overflow-hidden rounded-[20px] shadow-2xl">
        {currentScreen === 'home' && <Home onNavigate={setCurrentScreen} />}
        {currentScreen === 'reminders' && <Reminders onNavigate={setCurrentScreen} />}
        {currentScreen === 'memories' && <Memories onNavigate={setCurrentScreen} />}
      </div>
    </div>
  );
}
