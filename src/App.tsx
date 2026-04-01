import { useState, useEffect } from 'react';
import { useAppState } from './core/useAppState';
import { soundEngine } from './core/SoundEngine';
import { HubScreen } from './hub/HubScreen';
import { BlockBlastScreen } from './games/block-blast/BlockBlastScreen';
import { Merge2048Screen } from './games/merge-2048/Merge2048Screen';
import { Match3Screen } from './games/match-3/Match3Screen';
import { LevelUpOverlay } from './hub/LevelUpOverlay';
import { SettingsModal } from './hub/SettingsModal';
import { AchievementToast } from './hub/AchievementToast';
import { AnimatePresence } from 'framer-motion';
import { ErrorBoundary } from './core/ErrorBoundary';
import './index.css';

function App() {
  const appState = useAppState();
  const [currentScreen, setCurrentScreen] = useState<string>('hub');
  const [notifiedLevel, setNotifiedLevel] = useState(appState.stats.highestLevelReached || 1);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Apply theme to HTML root element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', appState.settings.theme);
  }, [appState.settings.theme]);

  // Initialize Web Audio Engine rigorously on all user gestures to prevent iOS suspension
  useEffect(() => {
    const handleInteraction = () => {
      soundEngine.init();
    };
    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  // Stop active sounds when navigating between screens
  useEffect(() => {
    soundEngine.stopAll();
  }, [currentScreen]);

  // Hydrate settings bindings gracefully into the singleton
  useEffect(() => {
    soundEngine.setPreferences(appState.settings.soundOn, appState.settings.musicOn);
  }, [appState.settings.soundOn, appState.settings.musicOn]);

  // Prevent context menus globally to fake native app feel
  useEffect(() => {
    const handleContextMenu = (e: Event) => e.preventDefault();
    window.addEventListener('contextmenu', handleContextMenu);
    return () => window.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  // Route fallback guard
  useEffect(() => {
    const validScreens = ['hub', 'block-blast', 'merge-2048', 'match-3'];
    if (!validScreens.includes(currentScreen)) {
       setCurrentScreen('hub');
    }
  }, [currentScreen]);

  const showLevelUp = appState.stats.highestLevelReached > notifiedLevel;
  const activeScreen = ['hub', 'block-blast', 'merge-2048', 'match-3'].includes(currentScreen) ? currentScreen : 'hub';

  return (
    <ErrorBoundary onReset={() => setCurrentScreen('hub')}>
      <div className="app-container">
      <AnimatePresence>
        {appState.recentAchievements.length > 0 && (
          <AchievementToast 
            key={appState.recentAchievements[0]} 
            achievementId={appState.recentAchievements[0]} 
            onDismiss={() => appState.clearRecentAchievement(appState.recentAchievements[0])} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLevelUp && (
          <LevelUpOverlay 
            level={appState.stats.highestLevelReached} 
            rank={appState.getLevelInfo(appState.stats.xp).rank} 
            coinsReward={(appState.stats.highestLevelReached - notifiedLevel) * 100}
            onDismiss={() => setNotifiedLevel(appState.stats.highestLevelReached)} 
          />
        )}
        {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} appState={appState} />}
      </AnimatePresence>

      {activeScreen === 'hub' && (
        <HubScreen onLaunchGame={setCurrentScreen as any} appState={appState} openSettings={() => setIsSettingsOpen(true)} />
      )}
      {activeScreen === 'block-blast' && (
        <BlockBlastScreen onBack={() => setCurrentScreen('hub')} appState={appState} openSettings={() => setIsSettingsOpen(true)} />
      )}
      {activeScreen === 'merge-2048' && (
        <Merge2048Screen onBack={() => setCurrentScreen('hub')} appState={appState} openSettings={() => setIsSettingsOpen(true)} />
      )}
      {activeScreen === 'match-3' && (
        <Match3Screen onBack={() => setCurrentScreen('hub')} appState={appState} openSettings={() => setIsSettingsOpen(true)} />
      )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
