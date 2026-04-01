import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, CheckCircle, Flame, Star, Hammer, Bomb, Shuffle, Coins } from 'lucide-react';
import { soundEngine } from '../core/SoundEngine';

interface DailyRewardModalProps {
  onClose: () => void;
  appState: any;
}

export function DailyRewardModal({ onClose, appState }: DailyRewardModalProps) {
  const canClaim = appState.canClaimDaily();
  const loginTrack = appState.stats.loginTrack;
  const [looted, setLooted] = useState<{coins: number, xp: number, item: string | null, day: number} | null>(null);

  const handleClaim = () => {
    if (canClaim) {
      soundEngine.playReward();
      const payload = appState.claimDailyReward();
      setLooted(payload);
      setTimeout(onClose, 3000); // Wait longer to show off loot!
    }
  };

  const days = [1, 2, 3, 4, 5, 6, 7];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        padding: 20, zIndex: 100
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass-panel"
        style={{ width: '100%', maxWidth: 400, padding: '32px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}
      >
        {/* Decorative background glow */}
        {canClaim && !looted && (
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 200, height: 200, background: 'var(--accent-warning)', filter: 'blur(100px)', opacity: 0.3, pointerEvents: 'none' }} />
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <motion.div animate={canClaim && !looted ? { rotate: [0, -10, 10, -10, 0] } : {}} transition={{ repeat: Infinity, duration: 2 }}>
             <Gift size={64} color={looted ? 'var(--accent-success)' : 'var(--accent-warning)'} />
          </motion.div>
        </div>

        <h2 className="font-heading" style={{ fontSize: '2rem', marginBottom: 8, color: 'var(--text-main)' }}>
           {looted ? 'REWARD CLAIMED!' : 'Daily Reward'}
        </h2>
        
        {!looted && (
          <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '1rem', fontWeight: 600 }}>
            {canClaim ? 'Claim your daily bonus to keep the streak alive!' : 'Come back tomorrow for your next reward!'}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 24, padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: 16 }}>
           <Flame color="var(--accent-danger)" fill="var(--accent-danger)" /> 
           <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-main)' }}>DAY {looted ? looted.day : loginTrack} LOGIN</span>
        </div>

        {!looted ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 32 }}>
            {days.map(day => {
               let rewardCoins = 0;
               let rewardItem = null;
               
               if (day === 1) rewardCoins = 150;
               else if (day === 2) rewardCoins = 200;
               else if (day === 3) { rewardCoins = 250; rewardItem = 'hammer'; }
               else if (day === 4) rewardCoins = 300;
               else if (day === 5) rewardCoins = 400;
               else if (day === 6) { rewardCoins = 600; rewardItem = 'bomb'; }
               else if (day === 7) { rewardCoins = 1500; rewardItem = 'shuffle'; }

               // The target track index to highlight 
               const targetPlayDay = canClaim ? loginTrack : loginTrack + 1;
               
               const isPast = day < targetPlayDay;
               const isToday = day === targetPlayDay;
               const isFuture = day > targetPlayDay;

               return (
                  <div key={day} style={{
                     background: isToday ? 'var(--accent-primary)' : isPast ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)',
                     border: isToday ? '2px solid #fff' : isPast ? '1px solid var(--accent-success)' : '1px solid rgba(255,255,255,0.1)',
                     padding: '12px 4px', borderRadius: 12, textAlign: 'center',
                     opacity: isFuture ? 0.5 : 1,
                     boxShadow: isToday ? '0 8px 20px rgba(59, 130, 246, 0.4)' : 'none',
                     gridColumn: day === 7 ? '1 / -1' : 'auto' // Make day 7 span massive
                  }}>
                     <div style={{ fontSize: '0.7rem', color: isToday ? '#fff' : 'var(--text-muted)', fontWeight: 800 }}>DAY {day}</div>
                     <div style={{ fontSize: '1.5rem', margin: '4px 0', display: 'flex', justifyContent: 'center', gap: 4 }}>
                        {isPast ? <CheckCircle size={22} color="var(--accent-success)" /> : day === 7 ? '🎁' : rewardItem ? (rewardItem === 'bomb' ? '💣' : '🔨') : '🪙'}
                     </div>
                     <div style={{ fontSize: '0.85rem', color: isToday ? '#fff' : 'var(--text-main)', fontWeight: 900 }}>{day === 7 ? 'MEGA CHEST' : `+${rewardCoins}`}</div>
                  </div>
               )
            })}
          </div>
        ) : (
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 12 }}
            style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}
          >
             <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, border: '2px solid var(--accent-warning)', minWidth: 100 }}>
                <Coins size={32} color="var(--accent-warning)" />
                <span style={{ fontSize: '1.2rem', fontWeight: 900 }}>+{looted.coins}</span>
             </div>
             <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, border: '2px solid var(--accent-primary)', minWidth: 100 }}>
                <Star size={32} color="var(--accent-primary)" fill="var(--accent-primary)" />
                <span style={{ fontSize: '1.2rem', fontWeight: 900 }}>+{looted.xp}</span>
             </div>
             {looted.item && (
               <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, border: '2px solid var(--accent-danger)', minWidth: 100 }}>
                  {looted.item === 'hammer' && <Hammer size={32} color="var(--accent-danger)" />}
                  {looted.item === 'bomb' && <Bomb size={32} color="var(--accent-danger)" />}
                  {looted.item === 'shuffle' && <Shuffle size={32} color="var(--accent-danger)" />}
                  <span style={{ fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase' }}>+1 {looted.item}</span>
               </div>
             )}
          </motion.div>
        )}

        {canClaim && !looted ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClaim}
            style={{
              width: '100%', padding: '18px', background: 'linear-gradient(90deg, var(--accent-warning), #fbbf24)',
              borderRadius: 16, color: '#000', fontSize: '1.2rem', fontWeight: 900,
              boxShadow: '0 8px 25px rgba(245, 158, 11, 0.4)'
            }}
          >
            CLAIM NOW
          </motion.button>
        ) : (
          <button
            onClick={() => { soundEngine.playClick(); onClose(); }}
            style={{
              width: '100%', padding: '18px', background: 'rgba(255,255,255,0.1)',
              borderRadius: 16, color: '#fff', fontSize: '1.1rem', fontWeight: 800
            }}
          >
            CLOSE
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
