import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShieldCheck, 
    Landmark, 
    ArrowRight, 
    Smartphone, 
    Lock, 
    Info,
    CheckCircle2,
    Zap
} from 'lucide-react';

/**
 * BankSignScreen (Onboarding)
 * Realistic "Bank Connect" flow to initialize the app and user profile.
 */
const BankSignScreen = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [phone, setPhone] = useState('');

    const handleNext = async () => {
        setLoading(true);
        // Simulated network delay for bank authorization
        await new Promise(r => setTimeout(r, 1200));
        setLoading(false);
        setStep(prev => prev + 1);
    };

    const handleFinalize = () => {
        localStorage.setItem('upi_auth', 'true');
        // Initial setup for the demo
        localStorage.setItem('demo_connectivity', 'true'); 
        navigate('/');
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ 
                height: '100vh', 
                display: 'flex', 
                flexDirection: 'column', 
                padding: '40px 24px',
                textAlign: 'center',
                background: 'white'
            }}
        >
            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ background: '#f5f0ff', padding: '32px', borderRadius: '40px', marginBottom: '32px', color: 'var(--primary)' }}>
                                <Smartphone size={80} strokeWidth={1.5} />
                            </div>
                            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '16px' }}>Offline UPI</h1>
                            <p style={{ color: '#666', lineHeight: 1.6, fontSize: '1.05rem', padding: '0 10px' }}>
                                Secure, token-based payments that work even without the internet.
                            </p>
                        </div>
                        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '24px', marginBottom: '32px', textAlign: 'left', display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <Info size={24} color="var(--primary)" style={{ flexShrink: 0 }} />
                            <p style={{ fontSize: '0.8rem', color: '#666', lineHeight: 1.5 }}>
                                We'll link your primary bank account using your registered mobile number via a secure SMS handshake.
                            </p>
                        </div>
                        <button className="btn btn-primary" style={{ height: '60px', borderRadius: '18px', width: '100%', fontSize: '1.1rem' }} onClick={handleNext}>
                            Get Started <ArrowRight size={20} />
                        </button>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <Landmark size={64} color="var(--secondary)" style={{ marginBottom: '32px' }} />
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '32px' }}>Verify Mobile Number</h2>
                            
                            <div style={{ width: '100%', maxWidth: '300px' }}>
                                <div style={{ marginBottom: '24px', textAlign: 'left' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#aaa', marginLeft: '12px', marginBottom: '8px', display: 'block' }}>REGISTERED NUMBER</label>
                                    <input 
                                        type="tel" 
                                        placeholder="+91 98765 43210" 
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        style={{ width: '100%', height: '64px', borderRadius: '20px', border: '2px solid #eee', padding: '0 24px', fontSize: '1.25rem', fontWeight: 700, outline: 'none' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'center', color: '#00c853', fontWeight: 700, fontSize: '0.85rem' }}>
                                    <ShieldCheck size={18} /> Bank Encrypted Connection
                                </div>
                            </div>
                        </div>
                        <button className="btn btn-primary" style={{ height: '60px', borderRadius: '18px', width: '100%', fontSize: '1.1rem' }} disabled={loading || phone.length < 10} onClick={handleNext}>
                            {loading ? 'Verifying with Bank...' : 'Confirm & Link Account'}
                        </button>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div key="step3" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ background: '#e8f5e9', padding: '32px', borderRadius: '50%', marginBottom: '32px', color: '#2e7d32' }}>
                                <CheckCircle2 size={90} strokeWidth={1} />
                            </div>
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '12px' }}>Account Linked!</h2>
                            <p style={{ color: '#666', marginBottom: '32px', fontSize: '1.1rem' }}>
                                Axis Bank account (XX8921) is now ready for offline payments.
                            </p>

                            <div style={{ width: '100%', background: '#f5f0ff', padding: '24px', borderRadius: '24px', textAlign: 'left', border: '1px solid #e1d5ff' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                    <Zap size={20} color="#ffab00" fill="#ffab00" />
                                    <p style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.9rem' }}>INITIALIZING OFFLINE RESERVE</p>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.5 }}>
                                    We've pre-authorized a ₹1,000 spending limit. This amount is now held in secure local tokens for use without the internet.
                                </p>
                            </div>
                        </div>
                        <button className="btn btn-primary" style={{ height: '60px', borderRadius: '18px', width: '100%', fontSize: '1.1rem' }} onClick={handleFinalize}>
                            Take me to Dashboard
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default BankSignScreen;
