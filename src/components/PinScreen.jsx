import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShieldAlert, 
    ArrowLeft, 
    Delete, 
    Lock, 
    CheckCircle2, 
    AlertTriangle, 
    Timer,
    Zap,
    ShieldCheck
} from 'lucide-react';
import { TokenManager } from '../logic/tokenManager';
import { SyncManager } from '../logic/syncManager';
import { FraudDetector } from '../logic/fraudDetector';
import { useLanguage } from '../hooks/useLanguage';

const PROCESSING_STEPS = [
  { label: 'Validating Device Token...', duration: 600 },
  { label: 'Authorizing Bank Reserve...', duration: 800 },
  { label: 'Securing Offline Receipt...', duration: 600 },
];

const MAX_ATTEMPTS = 3;
const LOCKOUT_SECONDS = 30;

/**
 * PinScreen
 * High-fidelity PIN entry with attempt counter, lockout, and processing steps.
 */
const PinScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { validatePin } = useUser();
    const { t } = useLanguage();
    
    const { 
        amount, 
        merchantId, 
        merchantName, 
        merchantBank, 
        merchantUpi, 
        type 
    } = location.state || {};

    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [lockedUntil, setLockedUntil] = useState(null);
    const [lockRemaining, setLockRemaining] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState(0);
    const [processingDone, setProcessingDone] = useState(false);
    
    const timerRef = useRef(null);

    // Guard: Redirect if no amount
    useEffect(() => {
        if (!amount) navigate('/');
    }, [amount, navigate]);

    // Lockout countdown logic
    useEffect(() => {
        if (!lockedUntil) return;
        
        timerRef.current = setInterval(() => {
            const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
            if (remaining <= 0) {
                setLockedUntil(null);
                setLockRemaining(0);
                setAttempts(0);
                clearInterval(timerRef.current);
            } else {
                setLockRemaining(remaining);
            }
        }, 500);
        
        return () => clearInterval(timerRef.current);
    }, [lockedUntil]);

    const isLocked = lockedUntil && Date.now() < lockedUntil;

    const handleDigit = (digit) => {
        if (isLocked || isProcessing) return;
        if (pin.length < 4) {
            setPin(prev => prev + digit);
            setError('');
        }
    };

    const handleDelete = () => {
        if (isLocked || isProcessing) return;
        setPin(prev => prev.slice(0, -1));
    };

    const handleConfirm = async () => {
        if (isLocked || isProcessing || pin.length < 4) return;

        if (!validatePin(pin)) {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            setPin('');

            if (newAttempts >= MAX_ATTEMPTS) {
                const lockEnd = Date.now() + LOCKOUT_SECONDS * 1000;
                setLockedUntil(lockEnd);
                setError(`Too many wrong attempts. Locked for ${LOCKOUT_SECONDS}s.`);
            } else {
                setError(`Incorrect PIN. ${MAX_ATTEMPTS - newAttempts} attempt(s) remaining.`);
            }
            return;
        }

        // Proceed to Payment
        startProcessing();
    };

    const startProcessing = async () => {
        setIsProcessing(true);
        setError('');

        try {
            // First, check fraud rules
            const fraudResult = FraudDetector.check(amount, type || 'offline');
            if (!fraudResult.allowed) {
                setError(`⚠️ ${fraudResult.reason}`);
                setIsProcessing(false);
                return;
            }

            // Processing steps animation
            for (let i = 0; i < PROCESSING_STEPS.length; i++) {
                setProcessingStep(i);
                await new Promise(r => setTimeout(r, PROCESSING_STEPS[i].duration));
            }

            // Deduct tokens or verify online
            const tokensUsed = type === 'offline' ? TokenManager.consumeTokens(amount) : [];
            const tokenIds = tokensUsed.map(t => t.id);

            // Create transaction in sync manager
            const transaction = SyncManager.addTransaction({
                merchantId: merchantId || 'm_unknown',
                merchantName: merchantName || 'Merchant',
                amount,
                upi: merchantUpi || 'merchant@okupi',
                bankName: merchantBank || 'Bank',
                type: type || 'offline',
                tokens: tokenIds,
                fullTokens: tokensUsed,
            });

            setProcessingDone(true);
            await new Promise(r => setTimeout(r, 600));

            // Done!
            navigate('/success', { state: { transaction } });

        } catch (err) {
            setError(err.message || 'Payment failed. Please try again.');
            setIsProcessing(false);
        }
    };

    // ─── Processing View ──────────────────────────────────────────
    if (isProcessing) {
        return (
            <div style={{
                position: 'fixed', inset: 0, background: 'white',
                zIndex: 1000, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '32px',
                padding: '40px'
            }}>
                <AnimatePresence mode="wait">
                    {processingDone ? (
                        <motion.div key="success" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                            <CheckCircle2 size={100} color="var(--success)" strokeWidth={1.5} />
                        </motion.div>
                    ) : (
                        <motion.div key="spinner" style={{ position: 'relative', width: 90, height: 90 }}>
                            <svg width="90" height="90" viewBox="0 0 90 90">
                                <circle cx="45" cy="45" r="40" fill="none" stroke="#f0f0f0" strokeWidth="8" />
                                <motion.circle
                                    cx="45" cy="45" r="40" fill="none"
                                    stroke="var(--primary)" strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray="251"
                                    animate={{ strokeDashoffset: [251, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                />
                            </svg>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Lock size={32} color="var(--primary)" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '8px' }}>
                        {processingDone ? 'PAYMENT AUTHORIZED' : PROCESSING_STEPS[processingStep]?.label}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#888' }}>
                        Securely paying ₹{amount} to {merchantName}
                    </p>
                </div>

                {!processingDone && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {PROCESSING_STEPS.map((_, i) => (
                            <motion.div 
                                key={i}
                                animate={{ scale: i === processingStep ? 1.5 : 1, opacity: i === processingStep ? 1 : 0.4 }}
                                style={{
                                    width: '10px', height: '10px', borderRadius: '50%',
                                    background: 'var(--primary)'
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // ─── Entry View ─────────────────────────────────────────────
    return (
        <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
                position: 'fixed', inset: 0,
                background: 'white', zIndex: 1000,
                padding: '24px', display: 'flex', flexDirection: 'column'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <button onClick={() => navigate(-1)} className="btn" style={{ padding: '8px', background: 'transparent' }}>
                    <ArrowLeft size={24} />
                </button>
                <h2 style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.5px' }}>
                    <ShieldCheck size={18} color="var(--primary)" />
                    UPI PIN AUTHENTICATION
                </h2>
                <div style={{ width: '40px' }} />
            </div>

            <div style={{ textAlign: 'center', flex: 1 }}>
                <p className="text-label" style={{ marginBottom: '8px', fontWeight: 600 }}>{t('paying')}</p>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px' }}>₹{amount}</h1>
                <p style={{ color: '#444', marginBottom: '32px', fontWeight: 700, fontSize: '0.95rem' }}>{merchantName}</p>

                {/* Secure Badge */}
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    background: type === 'offline' ? '#fff3e0' : '#e8f5e9',
                    color: type === 'offline' ? '#e65100' : '#2e7d32',
                    padding: '8px 16px', borderRadius: '24px',
                    fontSize: '0.75rem', fontWeight: 800, marginBottom: '40px',
                    border: `1px solid ${type === 'offline' ? '#ffcc80' : '#a5d6a7'}`
                }}>
                    {type === 'offline' ? <Zap size={14} fill="#e65100" /> : <ShieldCheck size={14} />}
                    {type === 'offline' ? t('offline_token_session') : t('online_bank_session')}
                </div>

                {/* Input Dots */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '24px' }}>
                    {[1, 2, 3, 4].map(idx => (
                        <motion.div
                            key={idx}
                            animate={{ scale: pin.length >= idx ? [1, 1.3, 1] : 1 }}
                            style={{
                                width: '20px', height: '20px', borderRadius: '50%',
                                background: pin.length >= idx ? 'var(--primary)' : '#e0e0e0',
                                boxShadow: pin.length >= idx ? '0 0 12px var(--primary)66' : 'none',
                                border: '2px solid white'
                            }}
                        />
                    ))}
                </div>

                {/* Lockout & Error messaging */}
                <AnimatePresence mode="wait">
                    {isLocked ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', color: 'var(--error)', marginBottom: '16px' }}>
                            <Timer size={18} />
                            <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{t('secure_lockout')}: {lockRemaining}s</span>
                        </motion.div>
                    ) : error ? (
                        <motion.p initial={{ x: -10 }} animate={{ x: 0 }} exit={{ opacity: 0 }}
                            style={{ color: 'var(--error)', fontSize: '0.85rem', marginBottom: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <AlertTriangle size={16} /> {error}
                        </motion.p>
                    ) : null}
                </AnimatePresence>

                <p style={{ fontSize: '0.72rem', color: '#aaa', fontWeight: 500 }}>
                    {t('security_tip')}
                </p>
            </div>

            {/* Custom Keypad */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '12px', 
                padding: '24px 0',
                opacity: isLocked ? 0.3 : 1,
                pointerEvents: isLocked ? 'none' : 'auto'
            }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'DEL'].map((val, idx) => (
                    <button
                        key={idx}
                        className="btn"
                        disabled={val === ''}
                        style={{
                            height: '66px', fontSize: '1.6rem', background: '#f9f9f9',
                            border: 'none', borderRadius: '16px', fontWeight: 700,
                            color: val === 'DEL' ? 'var(--error)' : 'var(--text)'
                        }}
                        onClick={() => val === 'DEL' ? handleDelete() : handleDigit(val.toString())}
                    >
                        {val === 'DEL' ? <Delete size={24} /> : val}
                    </button>
                ))}
            </div>

            {/* Confirm Action */}
            <button
                className="btn btn-primary"
                style={{ width: '100%', height: '60px', borderRadius: '18px', fontSize: '1.1rem' }}
                disabled={pin.length < 4 || isLocked}
                onClick={handleConfirm}
            >
                {t('confirm_payment')}
            </button>
        </motion.div>
    );
};

export default PinScreen;
