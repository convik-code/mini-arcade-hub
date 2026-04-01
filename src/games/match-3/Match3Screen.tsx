import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Star, Coins, Settings } from 'lucide-react';
import { useMatch3, GRID_SIZE } from './useMatch3';
import { soundEngine } from '../../core/SoundEngine';
import type { TileData } from './useMatch3';

interface Match3ScreenProps {
  onBack: () => void;
  appState: any;
  openSettings: () => void;
}

export function Match3Screen({ onBack, appState, openSettings }: Match3ScreenProps) {
  const {
    grid, score, moves, isGameOver, isAnimating, floatingTexts, sessionStats, handleSwap, resetGame
  } = useMatch3(appState);

  const [selectedCell, setSelectedCell] = useState<{r: number, c: number} | null>(null);
  const [dragStart, setDragStart] = useState<{r: number, c: number, x: number, y: number} | null>(null);

  const handleCellClick = (r: number, c: number) => {
    if (isAnimating || isGameOver) return;
    
    if (!selectedCell) {
      setSelectedCell({ r, c });
    } else {
      const dr = Math.abs(selectedCell.r - r);
      const dc = Math.abs(selectedCell.c - c);
      
      // Check if adjacent
      if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
        handleSwap(selectedCell.r, selectedCell.c, r, c);
      }
      setSelectedCell(null);
    }
  };

  const handlePointerDown = (r: number, c: number, e: React.PointerEvent) => {
    if (isAnimating || isGameOver) return;
    setDragStart({ r, c, x: e.clientX, y: e.clientY });
  };

  const handlePointerUpOrLeave = (e: React.PointerEvent) => {
    if (!dragStart || isAnimating || isGameOver) {
      setDragStart(null);
      return;
    }
    
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx > 25 || absDy > 25) { 
       if (absDx > absDy) {
          if (dx > 0 && dragStart.c < GRID_SIZE - 1) handleSwap(dragStart.r, dragStart.c, dragStart.r, dragStart.c + 1);
          else if (dx < 0 && dragStart.c > 0) handleSwap(dragStart.r, dragStart.c, dragStart.r, dragStart.c - 1);
       } else {
          if (dy > 0 && dragStart.r < GRID_SIZE - 1) handleSwap(dragStart.r, dragStart.c, dragStart.r + 1, dragStart.c);
          else if (dy < 0 && dragStart.r > 0) handleSwap(dragStart.r, dragStart.c, dragStart.r - 1, dragStart.c);
       }
       setSelectedCell(null);
    } else if (e.type === 'pointerup') {
       handleCellClick(dragStart.r, dragStart.c);
    }
    
    setDragStart(null);
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
             fontSize: ft.text.includes('COMBO') || ft.text.includes('CASCADE') ? '2.5rem' : '1.5rem', 
             fontWeight: 900, textShadow: '0 4px 15px rgba(0,0,0,0.5)', 
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
          <div className="glass-panel" style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 90, background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(0,0,0,0.4))', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Moves</div>
            <div className="font-heading" style={{ fontSize: '1.8rem', color: moves <= 5 ? 'var(--accent-danger)' : 'var(--text-main)', lineHeight: 1 }}>{moves}</div>
          </div>
          <div className="glass-panel" style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 100, background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(0,0,0,0.4))', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Score</div>
            <div className="font-heading" style={{ fontSize: '1.8rem', color: 'var(--accent-primary)', lineHeight: 1, textShadow: '0 2px 10px rgba(59, 130, 246, 0.4)' }}>{score}</div>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-center" style={{ flex: 1, flexDirection: 'column', padding: '0 20px', WebkitUserSelect: 'none', userSelect: 'none' }}>
        
        <div 
          className="glass-panel" 
          onPointerUp={handlePointerUpOrLeave}
          onPointerLeave={handlePointerUpOrLeave}
          style={{ 
             padding: '12px', background: 'rgba(0,0,0,0.4)', borderRadius: '20px', position: 'relative', touchAction: 'none',
             width: '100%', maxWidth: '460px', aspectRatio: '1/1', display: 'flex', boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
          }}
        >
          <div style={{ 
            display: 'grid', gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`, 
            gap: '8px', width: '100%', height: '100%'
          }}>
            {grid.map((row, r) => (
              row.map((cell, c) => (
                <div 
                  key={`bg-${r}-${c}`} 
                  onPointerDown={(e) => handlePointerDown(r, c, e)}
                  style={{
                    background: 'rgba(255,255,255,0.05)', borderRadius: '8px', position: 'relative',
                    border: selectedCell?.r === r && selectedCell?.c === c ? '2px solid #fff' : '2px solid transparent',
                    boxShadow: selectedCell?.r === r && selectedCell?.c === c ? '0 0 15px rgba(255,255,255,0.8)' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  <AnimatePresence>
                    {cell && (
                      <motion.div
                        key={cell.id}
                        layout
                        initial={{ scale: 0, opacity: 0, y: -50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        style={{
                           position: 'absolute', inset: 0,
                           display: 'flex', justifyContent: 'center', alignItems: 'center',
                           zIndex: 10
                        }}
                      >
                         <TileAsset cell={cell} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            ))}
          </div>
        </div>

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
               style={{ padding: '40px 24px', textAlign: 'center', width: '90%', maxWidth: 400, border: '1px solid var(--accent-primary)' }}
            >
              <h2 className="font-heading" style={{ fontSize: '2.5rem', marginBottom: 12, color: 'var(--text-main)' }}>SWEET VICTORY!</h2>
              <p style={{ color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '2px' }}>FINAL SCORE</p>
              
              <div style={{ fontSize: '4.5rem', fontWeight: 900, margin: '15px 0', color: '#ec4899', textShadow: '0 0 30px rgba(236, 72, 153, 0.6)' }}>
                {score}
              </div>

              {score > (appState.stats.match3BestScore || 0) && score > 0 && (
                 <div style={{ color: 'var(--accent-warning)', fontWeight: 900, fontSize: '1.2rem', marginBottom: 20 }}>
                   🏆 NEW HIGH SCORE!
                 </div>
              )}

              {/* Session Rewards Row */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
                 <StatBadge icon={<Star size={16} color="var(--accent-primary)" fill="var(--accent-primary)" />} label="XP Gained" value={`+${sessionStats.xp}`} />
                 <StatBadge icon={<Coins size={16} color="var(--accent-warning)" fill="var(--accent-warning)" />} label="Coins" value={`+${sessionStats.coins}`} />
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <motion.button 
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => {
                     appState.updateMatch3BestScore(score);
                     onBack();
                  }}
                  style={{ flex: 1, padding: '18px', background: 'rgba(255,255,255,0.1)', borderRadius: 16, color: '#fff', fontSize: '1.1rem', fontWeight: 800 }}
                >
                  HUB
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => {
                     soundEngine.playShuffle();
                     appState.updateMatch3BestScore(score);
                     resetGame();
                  }} 
                  style={{ flex: 2, background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', padding: '18px', borderRadius: 16, color: '#fff', fontSize: '1.1rem', fontWeight: 900, boxShadow: '0 8px 25px rgba(236, 72, 153, 0.5)', border: 'none' }}
                >
                  <RefreshCw size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: 12, minWidth: 80, border: '1px solid rgba(255,255,255,0.1)' }}>
       <div style={{ marginBottom: 6 }}>{icon}</div>
       <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-main)' }}>{value}</div>
       <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
    </div>
  );
}

// PREMIUM 3D SVG VECTOR ASSETS
const SvgIcon = ({ children, shadow = true }: { children: React.ReactNode, shadow?: boolean }) => (
  <svg viewBox="0 0 100 100" style={{ width: '90%', height: '90%', filter: shadow ? 'drop-shadow(0px 6px 6px rgba(0,0,0,0.4))' : 'none', overflow: 'visible' }}>
    {children}
  </svg>
);

const RedJelly = () => (
  <SvgIcon>
    <defs>
      <radialGradient id="redGrad" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#fca5a5" />
        <stop offset="35%" stopColor="#ef4444" />
        <stop offset="100%" stopColor="#7f1d1d" />
      </radialGradient>
    </defs>
    <rect x="15" y="20" width="70" height="60" rx="30" fill="url(#redGrad)" stroke="#f87171" strokeWidth="2" />
    <path d="M 25 30 Q 50 22 75 30 Q 50 28 25 30" fill="#fff" opacity="0.6" />
    <ellipse cx="30" cy="35" rx="8" ry="4" fill="#fff" opacity="0.8" transform="rotate(-20 30 35)" />
  </SvgIcon>
);

const BlueDiamond = () => (
  <SvgIcon>
    <defs>
      <linearGradient id="blueGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#93c5fd" />
        <stop offset="50%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#1e3a8a" />
      </linearGradient>
      <linearGradient id="blueGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
         <stop offset="0%" stopColor="#bfdbfe" />
         <stop offset="100%" stopColor="#1d4ed8" />
      </linearGradient>
    </defs>
    <polygon points="50,10 90,50 50,90 10,50" fill="url(#blueGrad1)" stroke="#60a5fa" strokeWidth="2" strokeLinejoin="round" />
    <polygon points="50,20 75,50 50,80 25,50" fill="url(#blueGrad2)" />
    <polygon points="50,20 50,80 25,50" fill="rgba(255,255,255,0.2)" />
    <polygon points="50,10 50,20 25,50 10,50" fill="rgba(255,255,255,0.5)" />
  </SvgIcon>
);

const GreenEmerald = () => (
  <SvgIcon>
    <defs>
      <linearGradient id="greenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#6ee7b7" />
        <stop offset="50%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#064e3b" />
      </linearGradient>
    </defs>
    <polygon points="30,15 70,15 85,30 85,70 70,85 30,85 15,70 15,30" fill="url(#greenGrad)" stroke="#34d399" strokeWidth="2" strokeLinejoin="round" />
    <polygon points="35,25 65,25 75,35 75,65 65,75 35,75 25,65 25,35" fill="rgba(0,0,0,0.2)" />
    <polygon points="35,25 65,25 75,35 50,50" fill="rgba(255,255,255,0.6)" />
    <polygon points="35,25 25,35 50,50" fill="rgba(255,255,255,0.3)" />
  </SvgIcon>
);

const YellowStarIcon = () => (
  <SvgIcon>
    <defs>
      <radialGradient id="yellowGrad" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#78350f" />
      </radialGradient>
    </defs>
    <polygon points="50,10 61,35 88,35 66,52 74,80 50,64 26,80 34,52 12,35 39,35" fill="url(#yellowGrad)" stroke="#fde047" strokeWidth="2" strokeLinejoin="round" />
    <path d="M 50,15 L 59,37 L 80,37 L 62,50 L 68,72 L 50,59" fill="rgba(255,255,255,0.4)" />
  </SvgIcon>
);

const PurpleAmethyst = () => (
  <SvgIcon>
    <defs>
      <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ddd6fe" />
        <stop offset="50%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#4c1d95" />
      </linearGradient>
    </defs>
    <polygon points="50,15 85,80 15,80" fill="url(#purpleGrad)" stroke="#a78bfa" strokeWidth="2" strokeLinejoin="round" />
    <polygon points="50,15 50,80 85,80" fill="rgba(0,0,0,0.2)" />
    <polygon points="50,30 42,72 25,72" fill="rgba(255,255,255,0.4)" />
    <polygon points="50,15 50,30 15,80" fill="rgba(255,255,255,0.6)" />
  </SvgIcon>
);

const OrangeCandyIcon = () => (
  <SvgIcon>
    <defs>
      <radialGradient id="orangeGrad" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#fed7aa" />
        <stop offset="40%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#7c2d12" />
      </radialGradient>
    </defs>
    <circle cx="50" cy="50" r="35" fill="url(#orangeGrad)" stroke="#fbd38d" strokeWidth="2" />
    <path d="M 50,15 A 35,35 0 0,1 85,50 A 20,20 0 0,0 50,50 A 20,20 0 0,1 15,50 A 35,35 0 0,1 50,15 Z" fill="rgba(255,255,255,0.2)" />
    <circle cx="35" cy="32" r="6" fill="#fff" opacity="0.8" />
    <path d="M 28,45 A 20,20 0 0,1 45,28" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
  </SvgIcon>
);

const RainbowBomb = () => (
  <SvgIcon shadow={false}>
    <defs>
      <radialGradient id="rainbowGrad" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#fff" />
        <stop offset="30%" stopColor="#fde047" />
        <stop offset="50%" stopColor="#f43f5e" />
        <stop offset="70%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#3b82f6" />
      </radialGradient>
      <filter id="discoGlow">
         <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#fcd34d" floodOpacity="1" />
      </filter>
    </defs>
    <circle cx="50" cy="50" r="40" fill="url(#rainbowGrad)" stroke="#fff" strokeWidth="3" filter="url(#discoGlow)" />
    <circle cx="30" cy="30" r="6" fill="#fff" />
    <circle cx="70" cy="40" r="3" fill="#fff" />
    <circle cx="65" cy="70" r="5" fill="#fff" />
    <circle cx="40" cy="65" r="2" fill="#fff" />
  </SvgIcon>
);

const TileAsset = ({ cell }: { cell: TileData }) => {
   let MainAsset = RedJelly;
   if (cell.color === 'blue') MainAsset = BlueDiamond;
   else if (cell.color === 'green') MainAsset = GreenEmerald;
   else if (cell.color === 'yellow') MainAsset = YellowStarIcon;
   else if (cell.color === 'purple') MainAsset = PurpleAmethyst;
   else if (cell.color === 'orange') MainAsset = OrangeCandyIcon;

   if (cell.special === 'bomb') return <RainbowBomb />;

   return (
     <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {cell.special === 'cross' && (
           <div style={{ position: 'absolute', inset: -5, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236, 72, 153, 0.8) 0%, rgba(0,0,0,0) 70%)', animation: 'pulse 1s infinite' }} />
        )}
        
        <MainAsset />

        {cell.special === 'striped-h' && (
           <div style={{ position: 'absolute', width: '85%', height: '22%', background: 'linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0.4))', borderRadius: '10px', boxShadow: '0 0 10px #fff' }} />
        )}
        {cell.special === 'striped-v' && (
           <div style={{ position: 'absolute', height: '85%', width: '22%', background: 'linear-gradient(to right, rgba(255,255,255,0.9), rgba(255,255,255,0.4))', borderRadius: '10px', boxShadow: '0 0 10px #fff' }} />
        )}
     </div>
   );
};
