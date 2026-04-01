import { motion } from 'framer-motion';
import { X, Shield, FileText, HeartHandshake } from 'lucide-react';
import { soundEngine } from '../core/SoundEngine';

export type LegalDocType = 'privacy' | 'terms' | 'credits';

interface LegalModalProps {
  type: LegalDocType;
  onClose: () => void;
}

export function LegalModal({ type, onClose }: LegalModalProps) {
  const content = {
    privacy: {
      title: 'Privacy Policy',
      icon: <Shield size={24} color="var(--accent-primary)" />,
      text: `Your privacy is important to us.

1. Data Collection
We do not collect any personal data. All game progress, coins, and settings are stored locally on your device via standard HTML5 LocalStorage.

2. Third Parties
We do not use any third-party tracking, analytics, or fingerprinting services.

3. Complete Ownership
Because your data never leaves your device, you have complete ownership. Clearing your browser data or uninstalling the app will permanently delete your local save state.`
    },
    terms: {
      title: 'Terms of Service',
      icon: <FileText size={24} color="var(--accent-secondary)" />,
      text: `By using the Mini Game Hub, you agree to these terms:

1. Usage Scope
This application is provided as-is for entertainment purposes.

2. Intellectual Property
All original code, assets, and design belong to the respective creators.

3. Liability
We are not liable for any lost save data, corrupted LocalStorage, or device issues caused by this software.`
    },
    credits: {
      title: 'Credits & Support',
      icon: <HeartHandshake size={24} color="var(--accent-success)" />,
      text: `AntiGravity Mini Game Hub

Created with ❤️ using React, TypeScript, and Framer Motion.

Special thanks to:
- The open-source community
- Lucide React for iconography
- Web Audio API for synthetic soundscapes

Contact Support: support@example.com`
    }
  };

  const active = content[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      style={{
        position: 'absolute', inset: 0, background: 'var(--bg-card)', zIndex: 400,
        display: 'flex', flexDirection: 'column'
      }}
    >
      <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'var(--bg-main)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {active.icon}
          <h2 className="font-heading" style={{ fontSize: '1.4rem', margin: 0, color: 'var(--text-main)' }}>{active.title}</h2>
        </div>
        <button onClick={() => { soundEngine.playClick(); onClose(); }} style={{ padding: 10, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', color: 'var(--text-main)', display: 'flex' }}>
          <X size={24} />
        </button>
      </div>

      <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
         <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            {active.text}
         </div>
         <button onClick={() => { soundEngine.playClick(); onClose(); }} style={{ width: '100%', marginTop: 32, padding: '16px', background: 'var(--accent-primary)', color: '#fff', border: 'none', borderRadius: 16, fontSize: '1.1rem', fontWeight: 800 }}>
            I UNDERSTAND
         </button>
      </div>
    </motion.div>
  );
}
