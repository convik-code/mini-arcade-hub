import { motion } from 'framer-motion';
import { X, Unlock, Lock, Sparkles, Palette } from 'lucide-react';
import { soundEngine } from '../core/SoundEngine';
import type { ThemeName } from '../core/useAppState';

const THEMES: { id: ThemeName, label: string, cost?: number, condition?: { type: 'level' | 'streak', value: number }, colors: string[] }[] = [
  { id: 'dark-pro', label: 'Dark Pro', cost: 0, colors: ['#1E1E1E', '#3B82F6'] },
  { id: 'neon', label: 'Neon Nights', cost: 500, colors: ['#060913', '#00f0ff'] },
  { id: 'candy', label: 'Cotton Candy', cost: 500, colors: ['#fdf2f8', '#ec4899'] },
  { id: 'crystal', label: 'Crystal Cave', cost: 800, colors: ['#e0f2fe', '#0284c7'] },
  { id: 'space', label: 'Deep Space', cost: 1000, colors: ['#0B0B1A', '#8B5CF6'] },
  { id: 'ice', label: 'Glacial Ice', condition: { type: 'streak', value: 7 }, colors: ['#0F172A', '#0EA5E9'] },
  { id: 'classic', label: 'Retro Light', cost: 1200, colors: ['#f3f4f6', '#2563eb'] },
  { id: 'lava', label: 'Molten Lava', condition: { type: 'level', value: 10 }, colors: ['#1A0F0F', '#ef4444'] },
  { id: 'gold-elite', label: 'Gold Elite', cost: 2500, colors: ['#171717', '#fbbf24'] },
];

interface ThemeShopModalProps {
  onClose: () => void;
  appState: any;
}

export function ThemeShopModal({ onClose, appState }: ThemeShopModalProps) {
  const { settings, setSettings, stats } = appState;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
      style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)',
        display: 'flex', flexDirection: 'column', zIndex: 350
      }}
    >
      {/* Header */}
      <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
           <div style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', padding: 10, borderRadius: 12 }}>
             <Palette size={24} color="#fff" />
           </div>
           <div>
              <h2 className="font-heading" style={{ fontSize: '1.6rem', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                Theme Shop <Sparkles size={18} color="var(--accent-warning)" />
              </h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 800 }}>CUSTOMIZE YOUR EXPERIENCE</div>
           </div>
        </div>
        <button onClick={() => { soundEngine.playClick(); onClose(); }} style={{ padding: 10, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', color: 'var(--text-main)', display: 'flex' }}>
          <X size={24} />
        </button>
      </div>

      {/* Body / Grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', paddingBottom: 100 }}>
         {/* Coins Readout */}
         <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 30, fontSize: '1.2rem', fontWeight: 900, color: 'var(--accent-warning)', border: '1px solid rgba(245, 158, 11, 0.4)', boxShadow: '0 0 20px rgba(245, 158, 11, 0.2)' }}>
              🪙 {stats.coins}
            </div>
         </div>

         <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
          {THEMES.map((t) => {
            const isUnlocked = stats.unlockedThemes.includes(t.id);
            const isSelected = settings.theme === t.id;
            
            const currentLevel = appState.getLevelInfo(stats.xp).level;
            const meetCondition = t.condition ? (t.condition.type === 'level' ? currentLevel >= t.condition.value : stats.loginTrack >= t.condition.value) : true;

            return (
              <motion.button
                key={t.id}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (navigator.vibrate && settings.vibrationOn) navigator.vibrate(50);
                  if (isUnlocked) {
                    if (isSelected) return; // already equipped
                    soundEngine.playClick();
                    setSettings({ ...settings, theme: t.id });
                    document.documentElement.setAttribute('data-theme', t.id);
                  } else {
                     if (t.cost !== undefined) {
                       if (appState.unlockTheme(t.id, t.cost)) {
                         soundEngine.playReward();
                         setSettings({ ...settings, theme: t.id });
                         document.documentElement.setAttribute('data-theme', t.id);
                       } else {
                         soundEngine.playError();
                       }
                     } else if (t.condition) {
                        if (meetCondition) {
                          soundEngine.playReward();
                          appState.unlockTheme(t.id, 0);
                          setSettings({ ...settings, theme: t.id });
                          document.documentElement.setAttribute('data-theme', t.id);
                        } else {
                          soundEngine.playError();
                        }
                     }
                  }
                }}
                className="glass-panel"
                style={{
                  padding: '16px', display: 'flex', alignItems: 'center', gap: 16,
                  background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
                  border: isSelected ? '2px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.05)',
                  boxShadow: isSelected ? '0 0 20px rgba(59, 130, 246, 0.2)' : '0 4px 15px rgba(0,0,0,0.2)',
                  position: 'relative', overflow: 'hidden'
                }}
              >
                 {/* Visual Preview Sphere */}
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})`, border: '2px solid rgba(255,255,255,0.2)', boxShadow: `0 0 20px ${t.colors[1]}60`, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                   <div style={{ position: 'absolute', top: -10, left: -10, right: 10, bottom: 20, background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)', borderRadius: '50%' }} />
                </div>
                
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                     <div style={{ fontSize: '1.2rem', fontWeight: 900, color: isSelected ? 'var(--text-main)' : 'var(--text-main)', letterSpacing: '0.5px' }}>{t.label}</div>
                     {isSelected ? (
                       <div style={{ background: 'var(--accent-primary)', padding: '4px 10px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 900, color: '#fff', boxShadow: '0 0 10px var(--accent-primary)' }}>EQUIPPED</div>
                     ) : isUnlocked ? (
                       <Unlock size={18} color="var(--accent-success)" />
                     ) : (
                       meetCondition && !isUnlocked && t.condition ? (
                          <div style={{ background: 'var(--accent-warning)', padding: '4px 8px', borderRadius: 8, fontSize: '0.7rem', fontWeight: 900, color: '#000' }}>UNLOCK</div>
                       ) : <Lock size={18} color="var(--text-muted)" />
                     )}
                  </div>
                  
                  {!isUnlocked && (
                     <div style={{ fontSize: '0.9rem', color: meetCondition ? 'var(--accent-warning)' : 'var(--accent-danger)', fontWeight: 800 }}>
                       {t.cost !== undefined ? `${t.cost} 🪙` : `REQ: ${t.condition?.type === 'level' ? 'LVL' : 'DAY'} ${t.condition?.value}`}
                     </div>
                  )}
                  {isUnlocked && !isSelected && (
                     <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 800 }}>Tap to Equip</div>
                  )}
                  
                  {!isUnlocked && t.condition && (
                     <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, marginTop: 10, overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)' }}>
                        <div style={{ 
                           width: `${Math.min(100, ((t.condition.type === 'level' ? currentLevel : stats.loginTrack) / t.condition.value) * 100)}%`, 
                           height: '100%', background: meetCondition ? 'var(--accent-warning)' : 'var(--accent-danger)',
                           boxShadow: meetCondition ? '0 0 10px var(--accent-warning)' : 'none'
                        }} />
                     </div>
                  )}
                </div>
              </motion.button>
            )
          })}
         </div>
      </div>
    </motion.div>
  );
}
