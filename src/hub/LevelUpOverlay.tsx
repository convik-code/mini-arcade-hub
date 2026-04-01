import { motion } from 'framer-motion';
import { Award, Coins } from 'lucide-react';
import { useEffect } from 'react';
import { soundEngine } from '../core/SoundEngine';

export function LevelUpOverlay({ level, rank, coinsReward, onDismiss }: { level: number, rank: string, coinsReward: number, onDismiss: () => void }) {
  useEffect(() => {
    soundEngine.playMilestone();
  }, []);

  // Give a massive dopamine explosion on screen
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => { soundEngine.playClick(); onDismiss(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
      }}
    >
      <motion.div
         initial={{ scale: 0, rotate: -20, y: 100 }}
         animate={{ scale: 1, rotate: 0, y: 0 }}
         transition={{ type: 'spring', damping: 12, stiffness: 200 }}
         style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
      >
         <motion.div 
           animate={{ scale: [1, 1.15, 1], filter: ['hue-rotate(0deg)', 'hue-rotate(360deg)'] }}
           transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
         >
           <Award size={140} color="var(--accent-warning)" strokeWidth={1} />
         </motion.div>
         
         <h1 className="font-heading" style={{ 
             fontSize: '4.5rem', margin: '20px 0 0', lineHeight: 1,
             background: 'linear-gradient(to bottom, #fff, var(--accent-primary))',
             WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
             textShadow: '0 0 40px rgba(59, 130, 246, 0.8)' 
         }}>
            LEVEL UP!
         </h1>
         
         <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', letterSpacing: '8px', marginTop: 10, textTransform: 'uppercase' }}>
            {rank}
         </div>
         
         <div style={{ fontSize: '1.4rem', color: 'var(--accent-warning)', fontWeight: 800, marginTop: 10, letterSpacing: '2px' }}>
            REACHED LEVEL {level}
         </div>

         {coinsReward > 0 && (
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.5, type: 'spring' }}
               style={{ 
                 display: 'flex', alignItems: 'center', gap: 8, marginTop: 24, padding: '12px 24px', 
                 background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: 30,
                 boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)'
               }}
            >
               <Coins color="var(--accent-warning)" size={24} />
               <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent-warning)' }}>+{coinsReward} COINS</span>
            </motion.div>
         )}
         
         <motion.p 
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ color: 'var(--text-muted)', marginTop: 60, fontWeight: 700, fontSize: '1.1rem', letterSpacing: '1px' }}
         >
            TAP ANYWHERE TO CONTINUE
         </motion.p>
      </motion.div>
      
      {/* Celebration particles */}
      {Array.from({ length: 20 }).map((_, i) => (
         <motion.div
           key={i}
           initial={{
             opacity: 1, 
             x: 0, y: 0, scale: Math.random() * 1.5 + 0.5
           }}
           animate={{
             opacity: 0,
             x: (Math.random() - 0.5) * window.innerWidth * 1.5,
             y: (Math.random() - 0.5) * window.innerHeight * 1.5,
             rotate: Math.random() * 360
           }}
           transition={{ duration: 1.5 + Math.random() * 1.5, ease: "easeOut" }}
           style={{
             position: 'absolute', width: 8, height: 8, borderRadius: '50%',
             background: ['var(--accent-primary)', 'var(--accent-warning)', 'var(--accent-success)', 'var(--accent-danger)'][Math.floor(Math.random() * 4)],
             boxShadow: '0 0 10px currentColor', zIndex: -1
           }}
         />
      ))}
    </motion.div>
  );
}
