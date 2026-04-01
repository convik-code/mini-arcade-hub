import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Coins, CheckCircle, Target, Settings } from 'lucide-react';
import { useMerge2048 } from './useMerge2048';
import { soundEngine } from '../../core/SoundEngine';

interface Merge2048ScreenProps {
  onBack: () => void;
  appState: any;
  openSettings: () => void;
}

const TILE_COLORS: Record<number, { bg: string, color: string }> = {
  2: { bg: 'rgba(255,255,255,0.05)', color: '#fff' },
  4: { bg: 'rgba(255,255,255,0.1)', color: '#fff' },
  8: { bg: '#f2b179', color: '#fff' },
  16: { bg: '#f59563', color: '#fff' },
  32: { bg: '#f67c5f', color: '#fff' },
  64: { bg: '#f65e3b', color: '#fff' },
  128: { bg: '#edcf72', color: '#fff' },
  256: { bg: '#edcc61', color: '#fff' },
  512: { bg: '#edc850', color: '#fff' },
  1024: { bg: '#edc53f', color: '#fff' },
  2048: { bg: '#edc22e', color: '#fff' },
};

export function Merge2048Screen({ onBack, appState, openSettings }: Merge2048ScreenProps) {
  const { 
    tiles, score, comboStreak, isGameOver, isVictory, keepPlaying, sessionStats, floatingTexts, 
    mission, moveTiles, initGame, continuePlaying, resetGame
  } = useMerge2048(appState);

  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<{ x: number, y: number } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') moveTiles('UP');
      if (e.key === 'ArrowDown') moveTiles('DOWN');
      if (e.key === 'ArrowLeft') moveTiles('LEFT');
      if (e.key === 'ArrowRight') moveTiles('RIGHT');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveTiles]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) > 30) {
      if (absDx > absDy) {
        moveTiles(dx > 0 ? 'RIGHT' : 'LEFT');
      } else {
        moveTiles(dy > 0 ? 'DOWN' : 'UP');
      }
    }
    setTouchStart(null);
  };

  const getTileStyle = (val: number) => {
     if (val >= 2048) return { bg: '#3c3a32', color: '#f9f6f2', shadow: '0 0 30px #edc22e' };
     return { bg: TILE_COLORS[val]?.bg || '#3c3a32', color: TILE_COLORS[val]?.color || '#f9f6f2', shadow: val >= 128 ? `0 0 ${Math.min(val/10, 20)}px rgba(237, 194, 46, 0.4)` : 'none' };
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      
      {/* Floating Texts Layer */}
      {floatingTexts.map(ft => (
        <div 
          key={ft.id} 
          className="floating-text"
          style={{ left: ft.x, top: ft.y, color: ft.color, fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase', transform: 'translate(-50%, -50%)', zIndex: 300, pointerEvents: 'none' }}
        >
          {ft.text}
        </div>
      ))}

      {/* Header and Score */}
      <div style={{ padding: '24px 20px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onBack} className="glass-panel" style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.2rem', fontWeight: 800 }}>
              <ArrowLeft size={24} /> HUB
            </button>
            <button onClick={openSettings} className="glass-panel" style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Settings size={24} />
            </button>
          </div>
          <div className="glass-panel" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, fontSize: '1rem', fontWeight: 800, color: 'var(--accent-warning)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            🪙 {appState.stats.coins}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          {comboStreak > 1 && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.1, 1], rotate: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="glass-panel"
              style={{
                 padding: '12px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                 background: 'rgba(239, 68, 68, 0.2)', border: '1px solid var(--accent-danger)'
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-danger)', fontWeight: 900, textTransform: 'uppercase' }}>Combo</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>x{comboStreak}</div>
            </motion.div>
          )}
          <div className="glass-panel" style={{ padding: '12px 24px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 120 }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Score</div>
            <div className="font-heading" style={{ fontSize: '2rem', color: 'var(--text-main)', lineHeight: 1 }}>{score}</div>
          </div>
        </div>
      </div>

      {/* Mission Banner */}
      <div style={{ padding: '0 20px', marginBottom: 16 }}>
        <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8, border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Live Mission</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-warning)' }}>{mission.rewardCoins} 🪙 | {mission.rewardXp} XP</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>{mission.desc}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--accent-primary)' }}>{Math.min(mission.progress, mission.target)} / {mission.target}</div>
          </div>
          <div style={{ height: 6, background: 'rgba(0,0,0,0.5)', borderRadius: 3, overflow: 'hidden', marginTop: 4 }}>
             <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(Math.min(mission.progress, mission.target) / mission.target) * 100}%` }}
                style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))' }}
             />
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div 
        className="flex-center" 
        style={{ flex: 1, flexDirection: 'column', padding: '0 20px', WebkitUserSelect: 'none', userSelect: 'none' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <div 
           ref={containerRef}
           style={{ 
             width: '100%', maxWidth: 360, aspectRatio: '1/1', 
             background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 8, 
             position: 'relative', border: '2px solid rgba(255,255,255,0.1)',
             boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5), 0 10px 30px rgba(0,0,0,0.3)',
             touchAction: 'none'
           }}
        >
          {/* Strict coordinate plane boundary to match absolute tiles with background grid cells regardless of parent padding */}
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
             
             {/* Background Grid */}
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(4, 1fr)', gap: 8, height: '100%' }}>
               {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.2)' }} />
               ))}
             </div>

             {/* Foreground Animated Tiles */}
             <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
               {tiles.map((tile) => {
                  const styles = getTileStyle(tile.value);
                  // Absorbed tiles render underneath their target to hide popping artifacts
                  if (tile.value === 0) return null; 

                  return (
                    <motion.div
                       key={tile.id}
                       initial={tile.isNew ? { scale: 0, opacity: 0 } : false}
                       animate={{ 
                         scale: tile.isMerged ? [1, 1.35, 1] : 1, 
                         opacity: 1,
                         x: `calc(${tile.col * 100}% + ${tile.col * 8}px)`,
                         y: `calc(${tile.row * 100}% + ${tile.row * 8}px)`
                       }}
                       transition={{ 
                         type: "spring", stiffness: tile.isMerged ? 500 : 300, damping: tile.isNew ? 15 : 20, duration: 0.15 
                       }}
                       style={{
                         position: 'absolute', top: 0, left: 0,
                         width: 'calc(25% - 6px)', height: 'calc(25% - 6px)',
                         background: styles.bg, borderRadius: 8,
                         display: 'flex', justifyContent: 'center', alignItems: 'center',
                         color: styles.color, fontSize: tile.value >= 1024 ? '1.4rem' : '2rem', fontWeight: 900,
                         boxShadow: styles.shadow, zIndex: tile.isMerged ? 10 : 1
                       }}
                    >
                      {tile.value}
                    </motion.div>
                  )
               })}
             </div>
          </div>
        </div>
      </div>

      {/* Game Over / Win Premium Overlays */}
      <AnimatePresence>
        {(isGameOver || (isVictory && !keepPlaying)) && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <motion.div 
               initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }}
               className="glass-panel" 
               style={{ padding: '40px 24px', textAlign: 'center', width: '90%', maxWidth: 400, border: isVictory ? '1px solid var(--accent-warning)' : '1px solid var(--accent-danger)', overflow: 'hidden', position: 'relative' }}
            >
              {isVictory && <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, var(--accent-warning) 0%, transparent 70%)', opacity: 0.2, filter: 'blur(30px)' }} />}
              
              <h2 className="font-heading" style={{ fontSize: '2.5rem', marginBottom: 12, color: 'var(--text-main)', position: 'relative' }}>
                {isVictory ? '2048!' : 'OUT OF MOVES'}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '2px' }}>FINAL SCORE</p>
              
              <div style={{ fontSize: '4.5rem', fontWeight: 900, margin: '15px 0', color: isVictory ? 'var(--accent-warning)' : 'var(--accent-primary)', textShadow: isVictory ? '0 0 30px rgba(245, 158, 11, 0.6)' : '0 0 30px rgba(59, 130, 246, 0.6)' }}>
                {score}
              </div>

              {score >= appState.stats.merge2048BestScore && score > 0 && (
                 <div style={{ color: 'var(--accent-warning)', fontWeight: 900, fontSize: '1.2rem', marginBottom: 20 }}>
                   🏆 NEW HIGH SCORE!
                 </div>
              )}

              {/* Session Rewards Row */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
                 <StatBadge icon={<Star size={16} color="var(--accent-primary)" />} label="XP Gained" value={`+${sessionStats.xp}`} />
                 <StatBadge icon={<Coins size={16} color="var(--accent-warning)" />} label="Coins" value={`+${sessionStats.coins}`} />
                 <StatBadge icon={<ArrowLeft size={16} style={{ transform: 'rotate(90deg)' }} />} label="Highest" value={sessionStats.maxTileAdded} />
              </div>

              {/* Active Daily Quests Minimap */}
              <div style={{ marginBottom: 32, background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                 <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 800, marginBottom: 12, textAlign: 'left', textTransform: 'uppercase' }}>Daily Quests Progress</div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(appState.stats.activeQuests || []).map((q: any) => (
                       <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {q.isDone ? <CheckCircle size={16} color="var(--accent-success)" /> : <Target size={16} color="var(--text-muted)" />}
                          <div style={{ flex: 1, textAlign: 'left' }}>
                             <div style={{ fontSize: '0.85rem', fontWeight: 700, color: q.isDone ? 'var(--text-muted)' : 'var(--text-main)', textDecoration: q.isDone ? 'line-through' : 'none' }}>{q.desc}</div>
                             <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                                <div style={{ width: `${Math.min(100, (q.progress / q.target) * 100)}%`, height: '100%', background: 'var(--accent-secondary)' }} />
                             </div>
                          </div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 900, color: q.isDone ? 'var(--accent-success)' : 'var(--accent-warning)', minWidth: 35, textAlign: 'right' }}>
                             {q.isDone ? 'DONE' : `${q.progress}/${q.target}`}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                {isVictory && !keepPlaying ? (
                  <motion.button 
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => { soundEngine.playClick(); continuePlaying(); }} 
                    style={{ flex: 1, padding: '18px', background: 'rgba(255,255,255,0.1)', borderRadius: 16, color: '#fff', fontSize: '1rem', fontWeight: 800 }}
                  >
                    CONTINUE
                  </motion.button>
                ) : (
                  <motion.button 
             whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
             onClick={() => { soundEngine.playShuffle(); resetGame(); }}
             style={{ width: '100%', padding: 16, background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '1.2rem', fontWeight: 900, borderRadius: 16 }}
          >
            PLAY AGAIN
          </motion.button>
                )}
                
                <motion.button 
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => { soundEngine.playShuffle(); initGame(); }} 
                  style={{ flex: 2, background: 'var(--accent-primary)', padding: '18px', borderRadius: 16, color: '#fff', fontSize: '1.1rem', fontWeight: 900, boxShadow: '0 8px 25px rgba(59, 130, 246, 0.5)' }}
                >
                  PLAY AGAIN
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatBadge({ icon, label, value }: { icon: any, label: string, value: string | number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: 12, minWidth: 80 }}>
       <div style={{ marginBottom: 6 }}>{icon}</div>
       <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-main)' }}>{value}</div>
       <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
    </div>
  );
}
