import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Target, Hammer, Bomb, Shuffle, CheckCircle, Star, Coins, Settings } from 'lucide-react';
import { useBlockBlast } from './useBlockBlast';
import { GridBoard } from './GridBoard';
import { DraggablePiece } from './DraggablePiece';
import { TutorialOverlay } from './TutorialOverlay';

interface BlockBlastScreenProps {
  onBack: () => void;
  appState: any;
  openSettings: () => void;
}

export function BlockBlastScreen({ onBack, appState, openSettings }: BlockBlastScreenProps) {
  const { 
    grid, pieces, score, combo, isGameOver, mission, 
    activePowerUp, setActivePowerUp, floatingTexts, boardShakeTimer, sessionStats,
    useShuffle, handleGridClick, placePiece, resetGame, generateNewMission 
  } = useBlockBlast(appState);
  
  useEffect(() => {
    if (score > 0) {
      appState.updateBlockBlastBestScore(score);
    }
  }, [score, appState]);

  const handlePlace = (index: number, row: number, col: number, x: number, y: number) => {
    if (activePowerUp) return false; 
    return placePiece(index, row, col, x, y);
  };

  const inventory = appState.stats.inventory;
  const levelInfo = appState.getLevelInfo(appState.stats.xp);

  const togglePowerUp = (type: 'hammer' | 'bomb' | 'shuffle') => {
    if (activePowerUp === type) {
      setActivePowerUp(null);
      return;
    }
    if (inventory[type] <= 0) {
      if (confirm(`Buy 1 ${type} for 200 coins?`)) {
        appState.buyItem(type, 200);
      }
      return;
    }
    
    if (type === 'shuffle') {
      useShuffle();
    } else {
      setActivePowerUp(type);
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      
      {/* Floating Texts Layer */}
      {floatingTexts.map(ft => (
        <div 
          key={ft.id} 
          className="floating-text"
          style={{ 
             left: ft.x, top: ft.y, color: ft.color, 
             fontSize: ft.text.includes('COMBO') || ft.text.includes('BLAST') ? '2.2rem' : '1.5rem', 
             fontWeight: 900, textShadow: '0 4px 15px rgba(0,0,0,0.4)', 
             transform: 'translate(-50%, -50%)', zIndex: 300 
          }}
        >
          {ft.text}
        </div>
      ))}

      {/* Header */}
      <div style={{ padding: '24px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 10 }}>
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
          {combo > 1 && (
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
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>x{combo}</div>
            </motion.div>
          )}

          <div className="glass-panel" style={{ padding: '12px 24px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 120 }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Score</div>
            <div className="font-heading" style={{ fontSize: '2rem', color: 'var(--text-main)', lineHeight: 1 }}>{score}</div>
          </div>
        </div>
      </div>

      {/* Mission Banner */}
      <div style={{ padding: '0 20px', marginBottom: 12 }}>
        <div className="glass-panel" style={{ 
            padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: mission.isDone ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.4))' : 'var(--bg-card)',
            border: mission.isDone ? '1px solid var(--accent-success)' : undefined,
            boxShadow: mission.isDone ? '0 0 20px rgba(16, 185, 129, 0.3)' : 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <motion.div animate={mission.isDone ? { scale: [1, 1.2, 1], rotate: [0, 360] } : {}} transition={{ duration: 0.5 }}>
               {mission.isDone ? <CheckCircle color="var(--accent-success)" /> : <Target color="var(--accent-primary)" />}
            </motion.div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: mission.isDone ? 'var(--accent-success)' : 'var(--text-main)' }}>
                {mission.isDone ? 'MISSION COMPLETE!' : mission.desc}
              </div>
              {!mission.isDone && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Progress: {Math.min(mission.progress, mission.target)} / {mission.target}
                </div>
              )}
            </div>
          </div>
          {mission.isDone ? (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={generateNewMission} 
              style={{ padding: '8px 16px', background: 'var(--accent-success)', borderRadius: 16, color: '#fff', fontSize: '0.8rem', fontWeight: 900, boxShadow: '0 4px 10px rgba(16, 185, 129, 0.4)' }}
            >
              CLAIM NEXT
            </motion.button>
          ) : (
             <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--accent-warning)' }}>
               🪙 {mission.rewardCoins}
             </div>
          )}
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-center" style={{ flex: 1, flexDirection: 'column', padding: '0 20px', WebkitUserSelect: 'none', userSelect: 'none' }}>
        <div key={boardShakeTimer} className={boardShakeTimer ? 'shake' : ''} style={{ width: '100%', maxWidth: '400px' }}>
           <GridBoard grid={grid} isTargeting={activePowerUp !== null} onCellClick={(r, c) => handleGridClick(r, c, window.innerWidth/2, window.innerHeight/2)} />
        </div>
        
        {/* Powerups Bar */}
        <div style={{ display: 'flex', gap: 20, marginTop: 30 }}>
           <PowerUpButton 
             icon={<Hammer size={24} />} 
             count={inventory.hammer} 
             isActive={activePowerUp === 'hammer'} 
             onClick={() => togglePowerUp('hammer')} 
           />
           <PowerUpButton 
             icon={<Bomb size={24} />} 
             count={inventory.bomb} 
             isActive={activePowerUp === 'bomb'} 
             onClick={() => togglePowerUp('bomb')} 
           />
           <PowerUpButton 
             icon={<Shuffle size={24} />} 
             count={inventory.shuffle} 
             isActive={activePowerUp === 'shuffle'} 
             onClick={() => togglePowerUp('shuffle')} 
           />
        </div>
      </div>

      {/* Piece Rack */}
      <div style={{ padding: '0 10px', display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', height: 140, width: '100%', opacity: activePowerUp ? 0.3 : 1, pointerEvents: activePowerUp ? 'none' : 'auto', transition: 'opacity 0.3s' }}>
         {pieces.map((piece, i) => (
           <div key={piece ? piece.id : `empty-${i}`} style={{ flex: '1 1 0', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
             {piece ? (
               <DraggablePiece piece={piece} pieceIndex={i} onAttemptPlace={handlePlace} />
             ) : null}
           </div>
         ))}
      </div>

      {/* Enhanced Game Over Premium Overlay */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <motion.div 
               initial={{ scale: 0.8, y: 50 }}
               animate={{ scale: 1, y: 0 }}
               className="glass-panel" 
               style={{ padding: '40px 24px', textAlign: 'center', width: '90%', maxWidth: 400, border: '1px solid var(--accent-danger)' }}
            >
              <h2 className="font-heading" style={{ fontSize: '2.5rem', marginBottom: 12, color: 'var(--text-main)' }}>OUT OF MOVES!</h2>
              <p style={{ color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '2px' }}>FINAL SCORE</p>
              
              <div style={{ fontSize: '4.5rem', fontWeight: 900, margin: '15px 0', color: 'var(--accent-primary)', textShadow: '0 0 30px rgba(59, 130, 246, 0.6)' }}>
                {score}
              </div>

              {score >= appState.stats.blockBlastBestScore && score > 0 && (
                 <div style={{ color: 'var(--accent-warning)', fontWeight: 900, fontSize: '1.2rem', marginBottom: 20 }}>
                   🏆 NEW HIGH SCORE!
                 </div>
              )}

              {/* Session Rewards Row */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
                 <StatBadge icon={<Star size={16} color="var(--accent-primary)" fill="var(--accent-primary)" />} label="XP Gained" value={`+${sessionStats.xp}`} />
                 <StatBadge icon={<Coins size={16} color="var(--accent-warning)" fill="var(--accent-warning)" />} label="Coins" value={`+${sessionStats.coins}`} />
                 <StatBadge icon={<Target size={16} color="var(--accent-success)" />} label="Missions" value={sessionStats.missions} />
              </div>

              {/* Active Daily Quests Minimap */}
              <div style={{ marginBottom: 24, background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
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

              {/* Rank Progress Bar */}
              <div style={{ marginBottom: 32, textAlign: 'left' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                    <span>{levelInfo.rank} - LVL {levelInfo.level}</span>
                    <span style={{ color: 'var(--accent-primary)' }}>{appState.stats.xp} / {levelInfo.nextLevelXp} XP</span>
                 </div>
                 <div style={{ width: '100%', background: 'rgba(0,0,0,0.5)', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${levelInfo.progressPercent}%` }} 
                      transition={{ duration: 1, ease: 'easeOut' }}
                      style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))' }} 
                    />
                 </div>
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <motion.button 
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={onBack}
                  style={{ flex: 1, padding: '18px', background: 'rgba(255,255,255,0.1)', borderRadius: 16, color: '#fff', fontSize: '1.1rem', fontWeight: 800 }}
                >
                  HUB
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={resetGame} 
                  style={{ flex: 2, background: 'var(--accent-primary)', padding: '18px', borderRadius: 16, color: '#fff', fontSize: '1.1rem', fontWeight: 900, boxShadow: '0 8px 25px rgba(59, 130, 246, 0.5)' }}
                >
                  PLAY AGAIN
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!appState.settings.tutorialSeen && (
           <TutorialOverlay onComplete={() => appState.setSettings({ ...appState.settings, tutorialSeen: true })} />
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

function PowerUpButton({ icon, count, isActive, onClick }: { icon: any, count: number, isActive: boolean, onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.15, y: -4 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      style={{
        position: 'relative',
        width: 55, height: 55,
        borderRadius: '50%',
        background: isActive ? 'var(--accent-danger)' : 'rgba(255,255,255,0.1)',
        border: isActive ? '3px solid #fff' : '2px solid rgba(255,255,255,0.2)',
        color: '#fff',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        boxShadow: isActive ? '0 4px 10px rgba(0,0,0,0.2)' : 'none'
      }}
    >
      {icon}
      <div style={{
        position: 'absolute', top: -5, right: -5, background: 'var(--bg-main)', border: '2px solid var(--accent-primary)',
        width: 24, height: 24, borderRadius: 12, fontSize: '0.8rem', fontWeight: 900, display: 'flex', justifyContent: 'center', alignItems: 'center'
      }}>
        {count > 0 ? count : '+'}
      </div>
    </motion.button>
  );
}
