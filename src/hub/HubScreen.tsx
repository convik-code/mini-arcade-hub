import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Gift, Trophy, Lock, Play, Sparkles, Star, CheckCircle, Target, PackageOpen, Palette } from 'lucide-react';
import { DailyRewardModal } from './DailyRewardModal';
import { ComebackModal } from './ComebackModal';
import { LuckySpinModal } from './LuckySpinModal';
import { AchievementsModal } from './AchievementsModal';
import { ThemeShopModal } from './ThemeShopModal';
import { PlayerProfileModal } from './PlayerProfileModal';
import { soundEngine } from '../core/SoundEngine';
import type { Quest } from '../core/useAppState';

interface HubScreenProps {
  onLaunchGame: (gameId: string) => void;
  appState: any;
  openSettings: () => void;
}

const AmbientBackground = () => {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const p = Array.from({ length: 15 }).map(() => ({
      left: `${Math.random() * 100}%`,
      width: Math.random() * 60 + 20,
      duration: Math.random() * 8 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(p);
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {particles.map((p, i) => (
        <div
          key={i}
          className="ambient-particle"
          style={{
            left: p.left,
            width: p.width,
            height: p.width,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export function HubScreen({ onLaunchGame, appState, openSettings }: HubScreenProps) {
  const [showDaily, setShowDaily] = useState(false);
  const [showLuckySpin, setShowLuckySpin] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showThemeShop, setShowThemeShop] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  // Triggers once visibly on boot
  useEffect(() => {
    appState.checkLoginTriggers();
  }, []);

  const dailyReady = appState.canClaimDaily();
  const spinReady = appState.canSpinLuckyWheel();
  const levelInfo = appState.getLevelInfo(appState.stats.xp);
  
  const isComeback = appState.stats.comebackEligible;

  return (
    <div style={{ position: 'relative', height: '100%', overflowY: 'auto' }}>
      <AmbientBackground />
      
      <div style={{ position: 'relative', zIndex: 10, padding: '24px 20px 100px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="font-heading premium-gradient-text" style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.5px', textShadow: '0 4px 20px rgba(59, 130, 246, 0.4)' }}>
              AntiGravity
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <motion.div 
              key={appState.stats.coins}
              initial={{ scale: 1.5, rotate: -10, filter: 'brightness(2)' }}
              animate={{ scale: 1, rotate: 0, filter: 'brightness(1)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              whileHover={{ scale: 1.05 }}
              className="glass-panel" 
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: '1.2rem', fontWeight: 900, color: 'var(--accent-warning)', border: '1px solid rgba(245, 158, 11, 0.4)', boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)' }}
            >
              🪙 {appState.stats.coins}
            </motion.div>
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => { soundEngine.playClick(); openSettings(); }} 
              style={{ padding: 10, background: 'rgba(255,255,255,0.05)', borderRadius: '50%', color: 'var(--text-main)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <Settings size={22} />
            </motion.button>
          </div>
        </div>

        {/* Player Profile Strip CTA */}
        <motion.button 
           whileHover={{ scale: 1.02 }}
           whileTap={{ scale: 0.98 }}
           onClick={() => { soundEngine.playClick(); setShowProfile(true); }}
           className="glass-panel" 
           style={{ width: '100%', padding: '4px', borderRadius: 40, display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', textAlign: 'left' }}>
           <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 900, fontSize: '1.2rem', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.4)', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
             {levelInfo.level}
           </div>
           
           <div style={{ flex: 1, padding: '0 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                 <span className="premium-gradient-text" style={{ fontWeight: 900, fontSize: '1rem', letterSpacing: '1px' }}>{levelInfo.rank}</span>
                 <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800 }}>{appState.stats.xp} / {levelInfo.nextLevelXp} XP</span>
              </div>
              <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${levelInfo.progressPercent}%` }}
                   transition={{ duration: 1.5, ease: 'easeOut' }}
                   style={{ height: '100%', background: 'var(--accent-primary)', borderRadius: 3, boxShadow: '0 0 10px var(--accent-primary)' }}
                 />
              </div>
           </div>
           
           <div style={{ padding: '0 16px', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Best</div>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--accent-warning)', display: 'flex', alignItems: 'center', gap: 4 }}>
                 <Trophy size={12} /> {(appState.stats.blockBlastBestScore || 0).toLocaleString()}
              </div>
           </div>
        </motion.button>

        {/* Massive Premium Play CTA Wrapper */}
        <motion.div 
           whileHover={{ scale: 1.02 }}
           whileTap={{ scale: 0.96 }}
           onClick={() => { soundEngine.playCardSelect();
            appState.incrementGamesPlayed();
            appState.progressAchievement('gen_play_1', 1);
            appState.progressAchievement('gen_play_5', 1);
            appState.progressAchievement('gen_play_25', 1);
            onLaunchGame('block-blast');
          }} style={{ marginTop: 20 }}
        >
          <button
            className="cta-pulse"
            style={{
              width: '100%',
              padding: '36px 20px',
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
              borderRadius: 32,
              border: 'none',
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
          >
             <div className="shimmer-sweep" />
             
             {/* Background Pattern */}
             <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />
             
             <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
                  <Play size={48} fill="#fff" style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))', marginBottom: 8 }} />
                </motion.div>
                <h2 className="font-heading" style={{ fontSize: '3rem', margin: 0, lineHeight: 1, textShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>PLAY NOW</h2>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '6px 16px', borderRadius: 20, marginTop: 12, fontWeight: 800, letterSpacing: '2px', fontSize: '0.9rem', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: 6 }}>
                   <Sparkles size={14} color="var(--accent-warning)" /> BLOCK BLAST
                </div>
             </div>
          </button>
        </motion.div>

        {/* Daily Reward Banner */}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { soundEngine.playClick(); setShowDaily(true); }}
          className="glass-panel"
          style={{ 
            width: '100%', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            border: dailyReady ? '1px solid var(--accent-warning)' : '1px solid rgba(255,255,255,0.05)',
            background: dailyReady ? 'linear-gradient(90deg, rgba(245,158,11,0.15) 0%, rgba(245,158,11,0.05) 100%)' : 'rgba(0,0,0,0.2)',
            boxShadow: dailyReady ? '0 0 20px rgba(245, 158, 11, 0.15)' : 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <motion.div
               animate={dailyReady ? { rotate: [0, -10, 10, -10, 0] } : {}}
               transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
               style={{ background: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 16 }}
            >
               <Gift size={24} color={dailyReady ? 'var(--accent-warning)' : 'var(--text-muted)'} />
            </motion.div>
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: dailyReady ? 'var(--accent-warning)' : 'var(--text-main)', margin: 0 }}>Daily Reward</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, margin: '2px 0 0' }}>
                {dailyReady ? '7-Day Bonus Ready to Claim!' : `Progress: Day ${appState.stats.loginTrack}`}
              </p>
            </div>
          </div>
          {dailyReady && (
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
              transition={{ repeat: Infinity, duration: 1.5 }}
              style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--accent-warning)', boxShadow: '0 0 15px var(--accent-warning)' }} 
            />
          )}
        </motion.button>

        {/* Lucky Spin and Achievements Buttons */}
        <div style={{ display: 'flex', gap: 16, marginTop: -8 }}>
           {/* Lucky Spin Button */}
           <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { soundEngine.playClick(); setShowLuckySpin(true); }}
              style={{
                 flex: 1, padding: '16px', borderRadius: 24, border: 'none',
                 background: 'var(--surface-light)', position: 'relative', overflow: 'hidden',
                 display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
                 boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05), 0 4px 15px rgba(0,0,0,0.2)'
              }}
           >
              <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: 12, borderRadius: 16 }}>
                 <Star color="var(--accent-primary)" size={24} />
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>LUCKY SPIN</div>
              {spinReady && <div style={{ position: 'absolute', top: 12, right: 12, width: 10, height: 10, borderRadius: 5, background: 'var(--accent-danger)', boxShadow: '0 0 10px var(--accent-danger)' }} />}
           </motion.button>
           
           {/* Achievements Button */}
           <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { soundEngine.playClick(); setShowAchievements(true); }}
              style={{
                 flex: 1, padding: '16px', borderRadius: 24, border: 'none',
                 background: 'var(--surface-light)', position: 'relative', overflow: 'hidden',
                 display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
                 boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05), 0 4px 15px rgba(0,0,0,0.2)'
              }}
           >
              <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: 12, borderRadius: 16 }}>
                 <Trophy color="var(--accent-info)" size={24} />
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>ACHIEVEMENTS</div>
              {/* Optional notification badge check if something is unclaimed */}
           </motion.button>
        </div>

        {/* 2048 Merge Play CTA Wrapper */}
        <div style={{ marginTop: 2, marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 className="font-heading" style={{ fontSize: '1.4rem', color: 'var(--text-main)', margin: 0 }}>Puzzle Collection</h2>
          </div>
          <motion.button 
             whileHover={{ scale: 1.02 }}
             whileTap={{ scale: 0.96 }}
             onClick={() => { soundEngine.playCardSelect();
             appState.incrementGamesPlayed();
             appState.progressAchievement('gen_play_1', 1);
             appState.progressAchievement('gen_play_5', 1);
             appState.progressAchievement('gen_play_25', 1);
             onLaunchGame('merge-2048');
          }}   className="glass-panel"
             style={{
                width: '100%', padding: '20px', display: 'flex', alignItems: 'center', gap: 16,
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.02) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 24, cursor: 'pointer', overflow: 'hidden', position: 'relative'
             }}
          >
             <div style={{ width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg, var(--accent-warning), #f67c5f)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.8rem', fontWeight: 900, color: '#fff', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)' }}>
                4K
             </div>
             <div style={{ flex: 1, textAlign: 'left' }}>
                <h3 className="font-heading" style={{ fontSize: '1.4rem', color: '#fff', margin: '0 0 4px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>2048 MERGE</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 800 }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Trophy size={14} color="var(--accent-warning)" /> {appState.stats.merge2048BestScore}</div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Star size={14} color="var(--accent-primary)" /> {appState.stats.merge2048HighestTile || 0}</div>
                </div>
             </div>
             <div style={{ background: 'var(--accent-warning)', padding: 12, borderRadius: '50%', color: '#fff', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Play size={20} fill="#fff" />
             </div>
          </motion.button>
        </div>

        {/* Quest Chain Panel */}
        <div style={{ marginTop: 12 }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
             <h2 className="font-heading" style={{ fontSize: '1.4rem', color: 'var(--text-main)', margin: 0 }}>Daily Quests</h2>
             <div style={{ display: 'flex', gap: 4 }}>
                {[1, 2, 3].map(step => (
                   <div key={step} style={{ width: 12, height: 12, borderRadius: '50%', background: step <= (appState.stats.questChainProgress || 0) ? 'var(--accent-success)' : 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }} />
                ))}
             </div>
           </div>
           
           <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12, background: 'rgba(0,0,0,0.2)' }}>
              {(appState.stats.activeQuests || []).map((q: Quest) => (
                 <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: 16, border: q.isDone ? '1px solid var(--accent-success)' : '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ background: q.isDone ? 'var(--accent-success)' : 'rgba(255,255,255,0.1)', borderRadius: '50%', padding: 8, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                       {q.isDone ? <CheckCircle size={20} color="#000" /> : <Target size={20} color="var(--text-muted)" />}
                    </div>
                    <div style={{ flex: 1 }}>
                       <div style={{ fontSize: '1rem', fontWeight: 800, color: q.isDone ? 'var(--text-muted)' : 'var(--text-main)', textDecoration: q.isDone ? 'line-through' : 'none' }}>{q.desc}</div>
                       <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (q.progress / q.target) * 100)}%` }} 
                            style={{ height: '100%', background: 'var(--accent-primary)' }} 
                          />
                       </div>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: 50 }}>
                       {q.isDone ? (
                          <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--accent-success)' }}>DONE</div>
                       ) : (
                          <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--accent-warning)' }}>{q.progress} / {q.target}</div>
                       )}
                    </div>
                 </div>
              ))}
              
              <button 
                onClick={() => {
                   if (appState.claimQuestChainChest()) {
                      if (appState.stats.comebackEligible) {
        soundEngine.playMilestone();
      }                alert('CHEST CLAIMED! +500 Coins, +1000 XP, +Items!');
                   } else {
                      soundEngine.playError();
                   }
                }}
                disabled={(appState.stats.questChainProgress || 0) < 3}
                style={{
                   width: '100%', padding: '16px', marginTop: 8,
                   background: (appState.stats.questChainProgress || 0) >= 3 ? 'var(--accent-warning)' : 'rgba(255,255,255,0.05)',
                   borderRadius: 16, border: 'none', color: (appState.stats.questChainProgress || 0) >= 3 ? '#000' : 'var(--text-muted)',
                   fontWeight: 900, fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
                   cursor: (appState.stats.questChainProgress || 0) >= 3 ? 'pointer' : 'not-allowed',
                   boxShadow: (appState.stats.questChainProgress || 0) >= 3 ? '0 4px 15px rgba(245, 158, 11, 0.4)' : 'none'
                }}
              >
                 <PackageOpen size={20} />
                 {(appState.stats.questChainProgress || 0) >= 3 ? 'OPEN CHAIN CHEST!' : 'COMPLETE 3 QUESTS TO OPEN'}
              </button>
           </div>
        </div>

        {/* Match-3 Play CTA Wrapper */}
        <div style={{ marginTop: 2, marginBottom: 8 }}>
          <motion.button 
             whileHover={{ scale: 1.02 }}
             whileTap={{ scale: 0.96 }}
             onClick={() => { soundEngine.playCardSelect();
             appState.incrementGamesPlayed();
             appState.progressAchievement('gen_play_1', 1);
             appState.progressAchievement('gen_play_5', 1);
             appState.progressAchievement('gen_play_25', 1);
             onLaunchGame('match-3');
          }}   className="glass-panel"
             style={{
                width: '100%', padding: '20px', display: 'flex', alignItems: 'center', gap: 16,
                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(236, 72, 153, 0.02) 100%)',
                border: '1px solid rgba(236, 72, 153, 0.3)', borderRadius: 24, cursor: 'pointer', overflow: 'hidden', position: 'relative'
             }}
          >
             <div style={{ width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.8rem', fontWeight: 900, color: '#fff', boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4)' }}>
                🍬
             </div>
             <div style={{ flex: 1, textAlign: 'left' }}>
                <h3 className="font-heading" style={{ fontSize: '1.4rem', color: '#fff', margin: '0 0 4px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>CANDY SWAP</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 800 }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Trophy size={14} color="#ec4899" /> {appState.stats.match3BestScore || 0}</div>
                </div>
             </div>
             <div style={{ background: '#ec4899', padding: 12, borderRadius: '50%', color: '#fff', boxShadow: '0 4px 15px rgba(236, 72, 153, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Play size={20} fill="#fff" />
             </div>
          </motion.button>
        </div>

        {/* Theme Shop Banner */}
        <div style={{ marginTop: 12 }}>
           <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => { soundEngine.playClick(); setShowThemeShop(true); }}
              className="glass-panel"
              style={{
                 width: '100%', padding: '20px', display: 'flex', alignItems: 'center', gap: 16,
                 background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(14, 165, 233, 0.02) 100%)',
                 border: '1px solid rgba(14, 165, 233, 0.3)', borderRadius: 24, cursor: 'pointer', overflow: 'hidden'
              }}
           >
              <div style={{ width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 15px rgba(14, 165, 233, 0.4)' }}>
                 <Palette size={28} color="#fff" />
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                 <h3 className="font-heading" style={{ fontSize: '1.4rem', color: '#fff', margin: '0 0 4px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>THEME SHOP</h3>
                 <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 800 }}>Customize Your Look</div>
              </div>
              <div style={{ background: '#0ea5e9', padding: '8px 16px', borderRadius: 20, color: '#fff', fontSize: '0.8rem', fontWeight: 900, boxShadow: '0 4px 15px rgba(14, 165, 233, 0.5)' }}>
                 OPEN
              </div>
           </motion.button>
        </div>

        {/* Coming Soon Grid */}
        <div style={{ marginTop: 12 }}>
           <h3 className="font-heading" style={{ fontSize: '1.2rem', marginBottom: 16, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
             <Lock size={16} /> Locked Escapes
           </h3>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
             <LockedGameCard title="Runner" icon="🏃" color="var(--block-5)" />
             <LockedGameCard title="Memory" icon="🎴" color="var(--block-3)" />
           </div>
        </div>

      </div>

      <AnimatePresence>
        {showDaily && <DailyRewardModal onClose={() => setShowDaily(false)} appState={appState} />}
      </AnimatePresence>
      <AnimatePresence>
        {showLuckySpin && <LuckySpinModal onClose={() => setShowLuckySpin(false)} appState={appState} />}
      </AnimatePresence>
      <AnimatePresence>
        {showAchievements && <AchievementsModal onClose={() => setShowAchievements(false)} appState={appState} />}
      </AnimatePresence>
      <AnimatePresence>
        {showThemeShop && <ThemeShopModal onClose={() => setShowThemeShop(false)} appState={appState} />}
      </AnimatePresence>
      <AnimatePresence>
        {showProfile && <PlayerProfileModal onClose={() => setShowProfile(false)} appState={appState} />}
      </AnimatePresence>
      <AnimatePresence>
        {appState.stats.comebackEligible && <ComebackModal onClose={() => {}} appState={appState} />}
      </AnimatePresence>
    </div>
  );
}

function LockedGameCard({ title, icon, color }: { title: string, icon: string, color: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="glass-panel" 
      style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: 0.8, border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}
    >
       <div style={{ fontSize: '2rem', filter: 'grayscale(0.5)' }}>{icon}</div>
       <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)', textAlign: 'center' }}>{title}</div>
       <div style={{ position: 'absolute', top: -10, left: -10, width: 40, height: 40, background: color, filter: 'blur(20px)', opacity: 0.3 }} />
       <div style={{ position: 'absolute', bottom: -10, right: -10, width: 40, height: 40, background: color, filter: 'blur(20px)', opacity: 0.3 }} />
    </motion.div>
  )
}
