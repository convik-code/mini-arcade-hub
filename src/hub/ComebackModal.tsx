import { useState } from 'react';
import { motion } from 'framer-motion';
import { PartyPopper, Coins, Star, Bomb } from 'lucide-react';
import { soundEngine } from '../core/SoundEngine';

export function ComebackModal({ onClose, appState }: { onClose: () => void, appState: any }) {
  const [claimed, setClaimed] = useState(false);

  const handleClaim = () => {
    soundEngine.playReward();
    appState.claimComebackReward();
    setClaimed(true);
    setTimeout(onClose, 2500);
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
         initial={{ scale: 0.8, y: 50 }}
         animate={{ scale: 1, y: 0 }}
         className="glass-panel"
         style={{ width: '100%', maxWidth: 420, padding: 32, textAlign: 'center', border: '2px solid var(--accent-success)' }}
       >
          <motion.div 
            animate={{ rotate: [0, -10, 10, -10, 0], scale: claimed ? 1.2 : 1 }} 
            transition={{ repeat: claimed ? 0 : Infinity, duration: 2 }}
            style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}
          >
             <PartyPopper size={72} color="var(--accent-success)" />
          </motion.div>

          <h1 className="font-heading premium-gradient-text" style={{ fontSize: '2.5rem', margin: '0 0 16px', lineHeight: 1.1 }}>
            WELCOME BACK!
          </h1>
          
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: 32, fontWeight: 600 }}>
             We missed you! Here is a welcome gift to get you back into the puzzle action.
          </p>

          {!claimed ? (
             <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                   <Coins size={28} color="var(--accent-warning)" />
                   <span style={{ fontSize: '1.5rem', fontWeight: 900 }}>+300</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                   <Star size={28} color="var(--accent-primary)" fill="var(--accent-primary)" />
                   <span style={{ fontSize: '1.5rem', fontWeight: 900 }}>+500</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                   <Bomb size={28} color="var(--accent-danger)" />
                   <span style={{ fontSize: '1.5rem', fontWeight: 900 }}>+2 BOMBS</span>
                </div>
             </div>
          ) : (
             <motion.div 
               initial={{ scale: 0.5, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               style={{ color: 'var(--accent-success)', fontSize: '1.5rem', fontWeight: 900, padding: 40, border: '2px dashed var(--accent-success)', borderRadius: 20, marginBottom: 32 }}
             >
               CLAIMED!
             </motion.div>
          )}

          {!claimed && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClaim}
              style={{
                width: '100%', padding: '20px', background: 'var(--accent-success)',
                borderRadius: 16, color: '#000', fontSize: '1.3rem', fontWeight: 900,
                boxShadow: '0 8px 30px rgba(16, 185, 129, 0.4)'
              }}
            >
              CLAIM GIFT
            </motion.button>
          )}
       </motion.div>
    </motion.div>
  );
}
