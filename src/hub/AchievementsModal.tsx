import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, X, CheckCircle, Lock, Coins, Star } from 'lucide-react';
import { ACHIEVEMENTS_DB } from '../core/achievementsDb';
import type { AchievementCategory } from '../core/achievementsDb';
import { soundEngine } from '../core/SoundEngine';

export function AchievementsModal({ onClose, appState }: { onClose: () => void, appState: any }) {
  const [activeTab, setActiveTab] = useState<AchievementCategory>('General');
  const categories: AchievementCategory[] = ['General', 'Block Blast', '2048', 'Match-3'];

  const filteredDB = ACHIEVEMENTS_DB.filter(a => a.category === activeTab);

  const handleClaim = (id: string) => {
    if (appState.claimAchievement(id)) {
      soundEngine.playReward();
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)', zIndex: 1000,
      display: 'flex', flexDirection: 'column',
      backdropFilter: 'blur(10px)'
    }}>
      <motion.div 
         initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
         transition={{ type: 'spring', damping: 25, stiffness: 200 }}
         style={{
            flex: 1, marginTop: 40, background: 'var(--surface)',
            borderTopLeftRadius: 32, borderTopRightRadius: 32,
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
            borderTop: '1px solid rgba(255,255,255,0.05)'
         }}
      >
        <div style={{ padding: '24px 24px 16px', position: 'relative', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <button onClick={() => { soundEngine.playClick(); onClose(); }} style={{
            position: 'absolute', right: 24, top: 24, background: 'var(--surface-light)',
            border: 'none', borderRadius: '50%', width: 40, height: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)'
          }}>
            <X size={20} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div className="premium-icon-box" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.05))', borderRadius: 16, padding: 12 }}>
              <Trophy color="var(--accent-warning)" size={28} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>Achievements</h2>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Earn rewards for your skills</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { soundEngine.playClick(); setActiveTab(cat); }}
                style={{
                  padding: '8px 16px', borderRadius: 20, border: 'none', fontWeight: 700, fontSize: '0.85rem',
                  whiteSpace: 'nowrap', transition: 'all 0.2s',
                  background: activeTab === cat ? 'var(--accent-primary)' : 'var(--surface-light)',
                  color: activeTab === cat ? '#fff' : 'var(--text-muted)',
                  boxShadow: activeTab === cat ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredDB.map(ach => {
             const state = appState.stats.achievements?.[ach.id] || { progress: 0, isUnlocked: false, isClaimed: false };
             const progressClamped = Math.min(state.progress, ach.target);
             const progressPercent = (progressClamped / ach.target) * 100;
             const isReady = state.isUnlocked && !state.isClaimed;

             return (
               <motion.div key={ach.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                 style={{
                   background: state.isClaimed ? 'rgba(255,255,255,0.02)' : 'var(--surface-light)',
                   borderRadius: 20, padding: 16, border: '1px solid rgba(255,255,255,0.05)',
                   position: 'relative', overflow: 'hidden', opacity: state.isClaimed ? 0.6 : 1
                 }}
               >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                     <div style={{ flex: 1, paddingRight: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                           {state.isClaimed ? <CheckCircle size={16} color="var(--accent-success)" /> : <Lock size={16} color={state.isUnlocked ? 'var(--accent-warning)' : 'var(--text-muted)'} />}
                           <div style={{ fontWeight: 800, fontSize: '1rem', color: state.isClaimed ? 'var(--text-muted)' : 'var(--text-main)' }}>{ach.title}</div>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4, fontWeight: 500 }}>{ach.desc}</div>
                     </div>
                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(245, 158, 11, 0.1)', padding: '4px 8px', borderRadius: 12 }}>
                           <Coins size={12} color="var(--accent-warning)" />
                           <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-warning)' }}>{ach.rewardCoins}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(56, 189, 248, 0.1)', padding: '4px 8px', borderRadius: 12 }}>
                           <Star size={12} color="var(--accent-info)" />
                           <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-info)' }}>{ach.rewardXp}</span>
                        </div>
                     </div>
                  </div>

                  {isReady ? (
                     <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleClaim(ach.id)}
                        style={{
                           width: '100%', padding: '12px', borderRadius: 12, border: 'none',
                           background: 'linear-gradient(135deg, var(--accent-warning), #d97706)',
                           color: '#fff', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '1px',
                           boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)', cursor: 'pointer'
                        }}
                     >
                        CLAIM REWARD
                     </motion.button>
                  ) : state.isClaimed ? (
                     <div style={{ width: '100%', padding: '10px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.85rem' }}>
                        COMPLETED
                     </div>
                  ) : (
                     <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                           <span>PROGRESS</span>
                           <span>{progressClamped} / {ach.target}</span>
                        </div>
                        <div style={{ width: '100%', height: 6, background: 'rgba(0,0,0,0.2)', borderRadius: 3, overflow: 'hidden' }}>
                           <motion.div 
                              initial={{ width: 0 }} 
                              animate={{ width: `${progressPercent}%` }} 
                              transition={{ duration: 0.5 }}
                              style={{ height: '100%', background: 'var(--accent-primary)', borderRadius: 3 }} 
                           />
                        </div>
                     </div>
                  )}
               </motion.div>
             );
          })}
        </div>
      </motion.div>
    </div>
  );
}
