import { useState } from 'react';
import { motion } from 'framer-motion';

interface TutorialOverlayProps {
  onComplete: () => void;
}

export function TutorialOverlay({ onComplete }: TutorialOverlayProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to Block Blast',
      desc: 'Drag and drop the pieces onto the 8x8 grid.',
      icon: '👆',
    },
    {
      title: 'Clear Lines',
      desc: 'Fill an entire row or column to clear it and score points!',
      icon: '💥',
    },
    {
      title: 'Build Combos',
      desc: 'Clear lines in consecutive turns to build a massive score multiplier!',
      icon: '🔥',
    },
    {
      title: 'Power-Ups',
      desc: 'Stuck? Use the Hammer to smash a block, or the Bomb to blast a 3x3 area!',
      icon: '🔨',
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(12px)', zIndex: 300, display: 'flex',
        justifyContent: 'center', alignItems: 'center', padding: 20
      }}
    >
      <motion.div
        key={step}
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -50, opacity: 0 }}
        className="glass-panel"
        style={{
          width: '100%', maxWidth: 360, padding: '40px 24px', textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)', border: '1px solid var(--accent-primary)'
        }}
      >
        <div style={{ fontSize: '4rem', marginBottom: 20 }}>{steps[step].icon}</div>
        <h2 className="font-heading premium-gradient-text" style={{ fontSize: '1.8rem', marginBottom: 16 }}>
          {steps[step].title}
        </h2>
        <p style={{ color: 'var(--text-main)', fontSize: '1.1rem', lineHeight: 1.5, marginBottom: 32 }}>
          {steps[step].desc}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
          {steps.map((_, i) => (
             <div key={i} style={{
               width: i === step ? 24 : 8, height: 8, borderRadius: 4,
               background: i === step ? 'var(--accent-primary)' : 'rgba(255,255,255,0.2)',
               transition: 'all 0.3s'
             }} />
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNext}
          style={{
            width: '100%', padding: '16px', background: 'var(--accent-primary)',
            borderRadius: 16, color: '#fff', fontSize: '1.1rem', fontWeight: 900,
            boxShadow: '0 8px 25px rgba(59, 130, 246, 0.5)'
          }}
        >
          {step < steps.length - 1 ? 'NEXT' : 'PLAY NOW'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
