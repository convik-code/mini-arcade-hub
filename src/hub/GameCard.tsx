import { motion } from 'framer-motion';

interface GameCardProps {
  id: string;
  title: string;
  isUnlocked: boolean;
  onClick?: () => void;
  accentColor: string;
  icon?: React.ReactNode;
}

export function GameCard({ title, isUnlocked, onClick, accentColor, icon }: GameCardProps) {
  return (
    <motion.button
      whileHover={isUnlocked ? { scale: 1.04, y: -4 } : {}}
      whileTap={isUnlocked ? { scale: 0.96 } : {}}
      onClick={isUnlocked ? onClick : undefined}
      className="glass-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        width: '100%',
        minHeight: '150px',
        opacity: isUnlocked ? 1 : 0.7,
        border: `2px solid ${isUnlocked ? accentColor : 'rgba(255,255,255,0.05)'}`,
        boxShadow: isUnlocked ? `0 8px 30px ${accentColor}30, inset 0 2px 20px rgba(255,255,255,0.05)` : 'none',
        position: 'relative',
        overflow: 'hidden',
        cursor: isUnlocked ? 'pointer' : 'default',
        background: isUnlocked ? `linear-gradient(145deg, var(--bg-card) 0%, rgba(0,0,0,0.6) 100%)` : 'rgba(10,10,10,0.4)',
      }}
    >
      {/* Background glow */}
      {isUnlocked && (
        <motion.div 
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          style={{
            position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
            background: `radial-gradient(circle at center, ${accentColor}15 0%, transparent 60%)`,
            pointerEvents: 'none',
          }} 
        />
      )}
      
      <div style={{ fontSize: '3rem', marginBottom: '16px', color: isUnlocked ? accentColor : 'var(--text-muted)' }}>
        {icon || '🎮'}
      </div>
      
      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: isUnlocked ? 'var(--text-main)' : 'var(--text-muted)', letterSpacing: '0.5px' }}>
        {title}
      </h3>
      
      {!isUnlocked && (
        <div style={{
          position: 'absolute', bottom: '12px',
          background: 'rgba(0,0,0,0.8)', padding: '6px 14px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '1px', border: '1px solid rgba(255,255,255,0.1)'
        }}>
          COMING SOON
        </div>
      )}
    </motion.button>
  );
}
