import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { useEffect } from 'react';
import { ACHIEVEMENTS_DB } from '../core/achievementsDb';
import { soundEngine } from '../core/SoundEngine';

export function AchievementToast({ achievementId, onDismiss }: { achievementId: string, onDismiss: () => void }) {
   const def = ACHIEVEMENTS_DB.find(a => a.id === achievementId);
   
   // Play sound exactly once on physical mount, never on re-render
   useEffect(() => {
     soundEngine.playMilestone();
   }, []);

   // Auto dismiss after 3 seconds, handles dynamic unstable parent references safely
   useEffect(() => {
     const t = setTimeout(() => onDismiss(), 3000);
     return () => clearTimeout(t);
   }, [onDismiss]);

   if (!def) return null;

   return (
      <motion.div
         initial={{ opacity: 0, y: -50, scale: 0.8 }}
         animate={{ opacity: 1, y: 0, scale: 1 }}
         exit={{ opacity: 0, y: -20, scale: 0.9 }}
         transition={{ type: 'spring', bounce: 0.4 }}
         style={{ 
            position: 'absolute', top: 40, left: 16, right: 16, zIndex: 9999,
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.95), rgba(217, 119, 6, 0.95))',
            borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16,
            boxShadow: '0 10px 30px rgba(245, 158, 11, 0.4)',
            backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)'
         }}
      >
         <div style={{ 
            background: 'rgba(255,255,255,0.2)', borderRadius: '50%', width: 48, height: 48, 
            display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0
         }}>
            <Trophy color="#fff" size={24} />
         </div>
         <div style={{ flex: 1 }}>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 2 }}>
               Achievement Unlocked!
            </div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>
               {def.title}
            </div>
         </div>
      </motion.div>
   );
}
