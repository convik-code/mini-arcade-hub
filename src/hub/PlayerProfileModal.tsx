import { motion } from 'framer-motion';
import { X, Trophy, Star, Crown, Target, Activity, Coins, Shield, Medal } from 'lucide-react';
import { soundEngine } from '../core/SoundEngine';

interface PlayerProfileModalProps {
  onClose: () => void;
  appState: any;
}

export function PlayerProfileModal({ onClose, appState }: PlayerProfileModalProps) {
  const { stats, getLevelInfo } = appState;
  const levelInfo = getLevelInfo(stats.xp);
  
  const achievementsCount = Object.values(stats.achievements || {}).filter((a: any) => a.isUnlocked).length;

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
      <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)' }}>
        <div style={{ display: 'flex', gap: 16 }}>
           <div style={{ position: 'relative' }}>
             <div style={{ 
               width: 72, height: 72, borderRadius: '50%', 
               background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', 
               display: 'flex', justifyContent: 'center', alignItems: 'center', 
               fontWeight: 900, fontSize: '2rem', color: '#fff', 
               boxShadow: '0 0 30px rgba(59, 130, 246, 0.4), inset 0 2px 4px rgba(255,255,255,0.4)',
               border: '2px solid rgba(255,255,255,0.2)' 
             }}>
               {levelInfo.level}
             </div>
             <div style={{ position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent-warning)', color: '#000', padding: '4px 12px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 900, boxShadow: '0 2px 10px rgba(245,158,11,0.5)' }}>
               LVL {levelInfo.level}
             </div>
           </div>
           
           <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                 <Crown size={18} color="var(--accent-warning)" />
                 <span className="premium-gradient-text" style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '0.5px' }}>{levelInfo.rank}</span>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 800, marginTop: 4 }}>
                {stats.xp.toLocaleString()} / {levelInfo.nextLevelXp.toLocaleString()} XP
              </div>
           </div>
        </div>
        <button onClick={() => { soundEngine.playClick(); onClose(); }} style={{ padding: 10, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', color: 'var(--text-main)', display: 'flex' }}>
          <X size={24} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', paddingBottom: 100 }}>
         
         <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={16} /> LIFETIME STATS
         </div>
         
         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
            <StatCard title="Games Played" value={(stats.totalGamesPlayed || 0).toLocaleString()} icon={<Target size={20} color="var(--accent-primary)" />} />
            <StatCard title="Total Coins" value={(stats.lifetimeCoinsEarned || stats.coins || 0).toLocaleString()} icon={<Coins size={20} color="var(--accent-warning)" />} />
            <StatCard title="Current Streak" value={`${stats.luckySpinStreak || 0} Days`} icon={<Star size={20} color="var(--accent-secondary)" />} />
            <StatCard title="Achievements" value={`${achievementsCount} Unlocked`} icon={<Medal size={20} color="var(--accent-success)" />} />
         </div>

         <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Trophy size={16} /> HALL OF FAME
         </div>

         <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <GameHighlightCard 
               color="var(--accent-primary)" 
               gameName="Block Blast" 
               metricLabel="High Score" 
               metricValue={(stats.blockBlastBestScore || 0).toLocaleString()} 
               icon="🟦" 
            />
            <GameHighlightCard 
               color="var(--accent-warning)" 
               gameName="2048 Merge" 
               metricLabel="Best Score" 
               metricValue={(stats.merge2048BestScore || 0).toLocaleString()} 
               secondaryLabel="Max Tile"
               secondaryValue={stats.merge2048HighestTile || 0}
               icon="4K" 
            />
            <GameHighlightCard 
               color="#ec4899" 
               gameName="Candy Swap" 
               metricLabel="Best Score" 
               metricValue={(stats.match3BestScore || 0).toLocaleString()} 
               icon="🍬" 
            />
         </div>

      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string | number, icon: any }) {
   return (
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 8, background: 'rgba(0,0,0,0.3)' }}>
         <div style={{ background: 'rgba(255,255,255,0.05)', padding: 8, borderRadius: 12, width: 'fit-content' }}>
            {icon}
         </div>
         <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-main)' }}>{value}</div>
         <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>{title}</div>
      </div>
   )
}

function GameHighlightCard({ color, gameName, metricLabel, metricValue, secondaryLabel, secondaryValue, icon }: any) {
   return (
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 16, background: `linear-gradient(90deg, ${color}22 0%, transparent 100%)`, borderLeft: `4px solid ${color}` }}>
         <div style={{ width: 48, height: 48, borderRadius: 12, background: color, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.4rem', fontWeight: 900, color: '#fff', boxShadow: `0 4px 15px ${color}66` }}>
            {icon}
         </div>
         <div style={{ flex: 1 }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>{gameName}</div>
            <div style={{ display: 'flex', gap: 16 }}>
               <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>{metricLabel}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#fff' }}>{metricValue}</div>
               </div>
               {secondaryLabel && (
                  <div>
                     <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>{secondaryLabel}</div>
                     <div style={{ fontSize: '1rem', fontWeight: 900, color: '#fff' }}>{secondaryValue}</div>
                  </div>
               )}
            </div>
         </div>
      </div>
   )
}
