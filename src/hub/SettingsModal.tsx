import { motion } from 'framer-motion';
import { X, Volume2, Music, Trash2, Vibrate, Sparkles, Shield, Info, HeartHandshake, FileText } from 'lucide-react';
import { soundEngine } from '../core/SoundEngine';
import { useState } from 'react';
import { LegalModal } from './LegalModal';
import type { LegalDocType } from './LegalModal';
import { AnimatePresence } from 'framer-motion';

interface SettingsModalProps {
  onClose: () => void;
  appState: any;
}

export function SettingsModal({ onClose, appState }: SettingsModalProps) {
  const { settings, setSettings } = appState;
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [activeLegal, setActiveLegal] = useState<LegalDocType | null>(null);

  const toggleSound = () => { soundEngine.playToggle(); setSettings({ ...settings, soundOn: !settings.soundOn }); };
  const toggleMusic = () => { soundEngine.playToggle(); setSettings({ ...settings, musicOn: !settings.musicOn }); };
  const toggleVibration = () => { soundEngine.playToggle(); setSettings({ ...settings, vibrationOn: !settings.vibrationOn }); };
  
  const setVFX = (quality: 'low' | 'medium' | 'high') => { soundEngine.playToggle(); setSettings({ ...settings, vfxQuality: quality }); };

  const handleReset = () => {
     soundEngine.playReward(); // Or a custom reset sweep
     appState.resetSave();
     setShowConfirmReset(false);
     onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
        display: 'flex', flexDirection: 'column', zIndex: 300
      }}
    >
      <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <h2 className="font-heading" style={{ fontSize: '1.8rem', margin: 0 }}>Settings</h2>
        <button onClick={() => { soundEngine.playClick(); onClose(); }} style={{ padding: 10, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', color: 'var(--text-main)', display: 'flex' }}>
          <X size={24} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', paddingBottom: 100 }}>
        
        {/* Hardware & Effects */}
        <SectionHeader title="Game Experience" icon={<Sparkles size={18} color="var(--accent-primary)" />} />
        <div className="glass-panel" style={{ padding: '20px', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <SettingToggle label="Sound Effects" icon={<Volume2 size={20} color="var(--accent-success)" />} active={settings.soundOn} onClick={toggleSound} />
          <SettingToggle label="Music" icon={<Music size={20} color="var(--accent-secondary)" />} active={settings.musicOn} onClick={toggleMusic} />
          <SettingToggle label="Haptic Feedback" icon={<Vibrate size={20} color="var(--accent-warning)" />} active={settings.vibrationOn} onClick={toggleVibration} />
          
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20 }}>
             <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 12 }}>Visual Effects Quality</div>
             <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: 12, overflow: 'hidden', padding: 4, gap: 4 }}>
                <SegmentButton label="Low" active={settings.vfxQuality === 'low'} onClick={() => setVFX('low')} />
                <SegmentButton label="Medium" active={settings.vfxQuality === 'medium'} onClick={() => setVFX('medium')} />
                <SegmentButton label="High" active={settings.vfxQuality === 'high'} onClick={() => setVFX('high')} />
             </div>
             <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8, fontWeight: 600 }}>
                {settings.vfxQuality === 'low' && 'Disables ambient particles and complex background gradients to save battery.'}
                {settings.vfxQuality === 'medium' && 'Balanced visual experience perfect for most mobile devices.'}
                {settings.vfxQuality === 'high' && 'Maximum GPU-accelerated neon glows, cascades, and fluid particle simulations.'}
             </div>
          </div>
        </div>



        {/* Action Panel */}
        <SectionHeader title="Support & About" icon={<Info size={18} color="var(--accent-secondary)" />} />
        <div className="glass-panel" style={{ padding: '8px 4px', marginBottom: 32, display: 'flex', flexDirection: 'column' }}>
           <ActionButton label="Privacy Policy" icon={<Shield size={18} />} onClick={() => setActiveLegal('privacy')} />
           <ActionButton label="Terms of Service" icon={<FileText size={18} />} onClick={() => setActiveLegal('terms')} />
           <ActionButton label="Credits & Support" icon={<HeartHandshake size={18} />} onClick={() => setActiveLegal('credits')} />
           
           <div style={{ padding: '20px 16px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 8 }}>
              <div className="premium-gradient-text" style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'Rubik, sans-serif' }}>AntiGravity</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, margin: '4px 0 12px' }}>VERSION 1.2.0 • BUILD 4912</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, padding: '0 20px' }}>
                A premium casual gaming collection built entirely in the browser using React, Framer Motion, and absolute precision physics.
              </div>
           </div>
        </div>

        {/* Danger Zone */}
        <SectionHeader title="Danger Zone" icon={<Trash2 size={18} color="var(--accent-danger)" />} />
        {!showConfirmReset ? (
           <button 
              onClick={() => { soundEngine.playClick(); setShowConfirmReset(true); }}
              style={{ width: '100%', padding: '16px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 16, color: 'var(--accent-danger)', fontSize: '1rem', fontWeight: 900, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
           >
             <Trash2 size={20} /> RESET ALL PROGRESS
           </button>
        ) : (
           <motion.div 
             initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
             style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-danger)', padding: 20, borderRadius: 16 }}
           >
              <h4 style={{ color: 'var(--accent-danger)', margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 900 }}>ARE YOU SURE?</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 20, lineHeight: 1.5 }}>
                 This will permanently delete your Coins, XP, Level, Daily Login streak, Best Scores, and Unlocked Themes. Your hardware Preferences will be ignored.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                 <button onClick={() => { soundEngine.playClick(); setShowConfirmReset(false); }} style={{ flex: 1, padding: 12, background: 'rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontWeight: 800 }}>CANCEL</button>
                 <button onClick={handleReset} style={{ flex: 1, padding: 12, background: 'var(--accent-danger)', borderRadius: 12, color: '#fff', fontWeight: 900 }}>CONFIRM</button>
              </div>
           </motion.div>
        )}
      </div>

      <AnimatePresence>
         {activeLegal && <LegalModal type={activeLegal} onClose={() => setActiveLegal(null)} />}
      </AnimatePresence>
    </motion.div>
  );
}

function SectionHeader({ title, icon }: { title: string, icon: any }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
       <div style={{ background: 'rgba(255,255,255,0.05)', padding: 6, borderRadius: 8 }}>{icon}</div>
       <h3 className="font-heading" style={{ fontSize: '1.2rem', color: 'var(--text-main)', margin: 0 }}>{title}</h3>
    </div>
  );
}

function SettingToggle({ label, icon, active, onClick }: { label: string, icon: any, active: boolean, onClick: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>
        {icon} {label}
      </div>
      <div 
        onClick={onClick}
        style={{ 
          width: 50, height: 28, background: active ? 'var(--accent-success)' : 'rgba(255,255,255,0.1)',
          borderRadius: 14, position: 'relative', cursor: 'pointer', transition: '0.3s',
          border: active ? 'none' : '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <motion.div 
          animate={{ x: active ? 24 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          style={{ width: 24, height: 24, background: '#fff', borderRadius: '50%', position: 'absolute', top: active ? 2 : 1 }}
        />
      </div>
    </div>
  )
}

function SegmentButton({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
     <button 
       onClick={onClick}
       style={{ 
          flex: 1, padding: '10px 0', border: 'none', borderRadius: 8,
          background: active ? 'var(--accent-primary)' : 'transparent',
          color: active ? '#fff' : 'var(--text-muted)',
          fontWeight: active ? 900 : 700, fontSize: '0.9rem',
          boxShadow: active ? '0 4px 10px rgba(59,130,246,0.3)' : 'none',
          transition: 'all 0.2s'
       }}
     >
       {label}
     </button>
  );
}

function ActionButton({ label, icon, onClick }: { label: string, icon: any, onClick?: () => void }) {
  return (
     <button onClick={() => { soundEngine.playClick(); onClick?.(); }} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px', background: 'transparent', border: 'none', color: 'var(--text-main)', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
        <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.05)', borderRadius: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
           {icon}
        </div>
        <div style={{ fontSize: '1.05rem', fontWeight: 700, flex: 1 }}>{label}</div>
        <div style={{ borderTop: '2px solid rgba(255,255,255,0.1)', borderRight: '2px solid rgba(255,255,255,0.1)', width: 8, height: 8, transform: 'rotate(45deg)', opacity: 0.5 }} />
     </button>
  );
}
