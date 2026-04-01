import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, Star, Hammer, Bomb, Shuffle, Crown } from 'lucide-react';
import { soundEngine } from '../core/SoundEngine';

interface LuckySpinModalProps {
  onClose: () => void;
  appState: any;
}

const SLICES = [
  { id: 0, label: '50', icon: <Coins size={24} color="#f59e0b" />, color: '#1e293b' },
  { id: 1, label: 'HAMMER', icon: <Hammer size={24} color="#ef4444" />, color: '#334155' },
  { id: 2, label: '150', icon: <Coins size={24} color="#facc15" />, color: '#1e293b' },
  { id: 3, label: 'BOMB', icon: <Bomb size={24} color="#f97316" />, color: '#334155' },
  { id: 4, label: '200 XP', icon: <Star size={24} color="#3b82f6" fill="#3b82f6" />, color: '#1e293b' },
  { id: 5, label: 'SHUFFLE', icon: <Shuffle size={24} color="#10b981" />, color: '#334155' },
  { id: 6, label: '500', icon: <Coins size={24} color="#fbbf24" />, color: '#1e293b' },
  { id: 7, label: 'JACKPOT', icon: <Crown size={24} color="#a855f7" fill="#a855f7" />, color: 'radial-gradient(circle, #c084fc 0%, #7e22ce 100%)' }
];

export function LuckySpinModal({ onClose, appState }: LuckySpinModalProps) {
  const isAvailable = appState.canSpinLuckyWheel();
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [rewardContent, setRewardContent] = useState<any>(null);
  
  // Safely grab cooldown from state directly
  const [timeLeft, setTimeLeft] = useState<{h:number, m:number, s:number} | null>(null);

  useEffect(() => {
    if (!isAvailable) {
       const interval = setInterval(() => {
          const now = Date.now();
          const nextSpin = (appState.stats.lastLuckySpinTime || 0) + 86400000;
          const diff = nextSpin - now;
          if (diff <= 0) {
             setTimeLeft(null);
             clearInterval(interval);
          } else {
             const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
             const m = Math.floor((diff / 1000 / 60) % 60);
             const s = Math.floor((diff / 1000) % 60);
             setTimeLeft({ h, m, s });
          }
       }, 1000);
       return () => clearInterval(interval);
    }
  }, [isAvailable, appState.stats.lastLuckySpinTime]);

  // Audio syncer tied dynamically to rotation bounds
  useEffect(() => {
    if (isSpinning) {
       const checkTick = setInterval(() => {
          // Check if rotation has crossed a sector boundary! (One slice = 45 deg)
          // Actually, we can't reliably read the exact CSS transform mid-animation mathematically from React state unless using useAnimationFrame.
          // Fallback: procedural ticking audio based on an exponential decay timeout.
       }, 50);
       return () => clearInterval(checkTick);
    }
  }, [isSpinning]);

  const triggerSpin = () => {
    if (!isAvailable || isSpinning) return;
    
    setIsSpinning(true);
    soundEngine.playSlide(); // Initial strong swoosh
    
    // Execute logic up front!
    const payload = appState.spinLuckyWheel();
    
    // Reverse map the payload to the specific slice ID
    let targetSliceId = 0;
    if (payload.type === 'jackpot') targetSliceId = 7;
    else if (payload.type === 'xp') targetSliceId = 4;
    else if (payload.type === 'item') {
       if (payload.itemId === 'hammer') targetSliceId = 1;
       else if (payload.itemId === 'bomb') targetSliceId = 3;
       else if (payload.itemId === 'shuffle') targetSliceId = 5;
    } else {
       // Coins
       if (payload.amount >= 500) targetSliceId = 6;
       else if (payload.amount >= 150) targetSliceId = 2;
       else targetSliceId = 0;
    }

    // Mathematical Slice Targeting (8 slices, each is 360/8 = 45 degrees)
    const sliceAngle = 360 / 8;
    
    // We want the targeted slice to land perfectly at the TOP (270 degrees in SVG coordinates)
    const spins = 6; // Spin 6 times minimum
    const extraAngle = (spins * 360) + (360 - (targetSliceId * sliceAngle));

    // Fake ticking audio system 
    let ticks = 0;
    const maxTicks = 20;
    const tickInterval = setInterval(() => {
       ticks++;
       soundEngine.playClick();
       if (ticks >= maxTicks) clearInterval(tickInterval);
    }, 150);

    setRotation(prev => prev + extraAngle);
    
    setTimeout(() => {
       setIsSpinning(false);
       setRewardContent(payload);
       soundEngine.playReward();
    }, 4000); // 4 second CSS easeOut duration
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(15px)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        padding: 24, zIndex: 150
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass-panel"
        style={{ width: '100%', maxWidth: 400, padding: '32px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}
      >
        <button 
           onClick={() => { soundEngine.playClick(); onClose(); }}
           style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', zIndex: 10 }}
        >
           <X size={18} />
        </button>

        <h1 className="font-heading" style={{ fontSize: '2.2rem', marginBottom: 4, background: 'linear-gradient(135deg, #c084fc, #9333ea)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
           LUCKY SPIN
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 32, fontWeight: 700 }}>
           {appState.stats.luckySpinStreak > 0 && <span style={{ color: 'var(--accent-warning)', marginRight: 6 }}>🔥 {appState.stats.luckySpinStreak} DAY STREAK</span>}
           Every day carries a guaranteed prize.
        </p>

        {/* The Wheel Container */}
        <div style={{ position: 'relative', width: 280, height: 280, margin: '0 auto 40px', filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.5))' }}>
           
           {/* Glow behind the wheel */}
           <div style={{ position: 'absolute', inset: -20, background: 'radial-gradient(circle, rgba(147, 51, 234, 0.4) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />

           {/* Pointer indicator at Top */}
           <div style={{ position: 'absolute', top: -15, left: '50%', transform: 'translateX(-50%)', zIndex: 20, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }}>
              <svg width="30" height="40" viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 40L30 15V0H0V15L15 40Z" fill="#fbbf24" stroke="#fff" strokeWidth="2" />
              </svg>
           </div>

           {/* Rotational SVG Vector Element */}
           <div 
             style={{
                width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', border: '6px solid var(--accent-primary)',
                boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8), 0 0 0 8px rgba(255,255,255,0.1)',
                transform: `rotate(${rotation}deg)`,
                transition: 'transform 4s cubic-bezier(0.2, 0.8, 0.1, 1)' // Easing out curve simulating physical drag
             }}
           >
              <svg width="280" height="280" viewBox="0 0 200 200" style={{ transform: 'rotate(-22.5deg)' }}>
                 {SLICES.map((slice, i) => {
                    const startAngle = (360 / 8) * i;
                    const endAngle = (360 / 8) * (i + 1);
                    const isGradient = slice.color.includes('gradient');
                    
                    // Convert polar to cartesian
                    const x1 = 100 + 100 * Math.cos((startAngle * Math.PI) / 180);
                    const y1 = 100 + 100 * Math.sin((startAngle * Math.PI) / 180);
                    const x2 = 100 + 100 * Math.cos((endAngle * Math.PI) / 180);
                    const y2 = 100 + 100 * Math.sin((endAngle * Math.PI) / 180);

                    return (
                      <g key={slice.id}>
                        <path 
                           d={`M 100 100 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`} 
                           fill={isGradient ? 'url(#jackpotGrad)' : slice.color} 
                           stroke="rgba(255,255,255,0.1)" strokeWidth="1" 
                        />
                      </g>
                    );
                 })}
                 <defs>
                   <radialGradient id="jackpotGrad" cx="50%" cy="50%" r="50%">
                     <stop offset="0%" stopColor="#c084fc" />
                     <stop offset="100%" stopColor="#7e22ce" />
                   </radialGradient>
                 </defs>
              </svg>

              {/* Text Layout inside slices container layer (decoupled from pure SVG fills for React component rendering) */}
              <div style={{ position: 'absolute', inset: 0 }}>
                 {SLICES.map((slice, i) => {
                   const rotationAngle = (360 / 8) * i;
                   return (
                     <div 
                       key={slice.id} 
                       style={{
                         position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 20,
                         transform: `rotate(${rotationAngle}deg)`, pointerEvents: 'none'
                       }}
                     >
                       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          {slice.icon}
                          <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                             {slice.label}
                          </span>
                       </div>
                     </div>
                   );
                 })}
              </div>

              {/* Center Pivot Axis */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 40, height: 40, background: 'radial-gradient(circle, #fcd34d 0%, #d97706 100%)', borderRadius: '50%', border: '4px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }} />
           </div>

        </div>

        {/* Bottom CTA Block */}
        {isAvailable ? (
           <motion.button
              whileHover={!isSpinning ? { scale: 1.05 } : {}}
              whileTap={!isSpinning ? { scale: 0.95 } : {}}
              disabled={isSpinning}
              onClick={triggerSpin}
              style={{
                 width: '100%', padding: '20px', background: isSpinning ? 'var(--bg-card)' : 'linear-gradient(90deg, #c084fc, #7e22ce)',
                 borderRadius: 16, color: isSpinning ? 'var(--text-muted)' : '#fff', fontSize: '1.2rem', fontWeight: 900, border: 'none',
                 boxShadow: isSpinning ? 'none' : '0 8px 30px rgba(147, 51, 234, 0.4)', textTransform: 'uppercase', letterSpacing: '2px', cursor: isSpinning ? 'not-allowed' : 'pointer'
              }}
           >
              {isSpinning ? 'SPINNING...' : 'FREE SPIN!'}
           </motion.button>
        ) : (
           <div className="glass-panel" style={{ padding: '20px', background: 'rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 8 }}>NEXT FREE SPIN IN</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '2px' }}>
                 {timeLeft ? `${String(timeLeft.h).padStart(2,'0')}:${String(timeLeft.m).padStart(2,'0')}:${String(timeLeft.s).padStart(2,'0')}` : '00:00:00'}
              </div>
           </div>
        )}

      </motion.div>

      {/* Reward Claim Result Overlay! */}
      <AnimatePresence>
         {rewardContent && (
            <motion.div
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
               <motion.div
                  initial={{ rotate: -10, y: 100 }}
                  animate={{ rotate: 0, y: 0 }}
                  transition={{ type: 'spring', damping: 10, stiffness: 200 }}
                  style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
               >
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
                    style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, height: 400, background: 'radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 60%)', zIndex: -1 }} 
                  />
                  
                  <div style={{ background: 'var(--accent-primary)', padding: 30, borderRadius: '50%', marginBottom: 20, boxShadow: '0 0 50px var(--accent-primary)' }}>
                     {rewardContent.type === 'coins' || rewardContent.type === 'jackpot' ? <Coins size={80} color="#fff" /> : 
                      rewardContent.type === 'xp' ? <Star size={80} color="#fff" fill="#fff" /> : 
                      rewardContent.itemId === 'hammer' ? <Hammer size={80} color="#fff" /> : 
                      rewardContent.itemId === 'bomb' ? <Bomb size={80} color="#fff" /> : <Shuffle size={80} color="#fff" />}
                  </div>

                  <h1 className="font-heading premium-gradient-text" style={{ fontSize: '3.5rem', margin: 0 }}>YOU WON</h1>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', textShadow: '0 4px 15px rgba(0,0,0,0.8)', marginTop: 10 }}>
                     {rewardContent.type === 'item' ? `+${rewardContent.amount} ${rewardContent.itemId.toUpperCase()}` : `+${rewardContent.amount} ${rewardContent.type.toUpperCase()}`}
                  </div>

                  <button 
                    onClick={() => { soundEngine.playClick(); onClose(); }}
                    style={{ marginTop: 50, padding: '16px 40px', fontSize: '1.2rem', fontWeight: 900, background: '#fff', color: '#000', borderRadius: 30, border: 'none', cursor: 'pointer', boxShadow: '0 4px 15px rgba(255,255,255,0.4)' }}
                  >
                     AWESOME!
                  </button>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
    </motion.div>
  );
}
