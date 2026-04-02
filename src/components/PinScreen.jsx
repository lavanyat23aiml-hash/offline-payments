import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, Delete, Eye, EyeOff, Lock } from 'lucide-react';
import { useUser } from '../hooks/useUser';
import { TokenManager } from '../logic/tokenManager';
import { SyncManager } from '../logic/syncManager';

const PinScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { validatePin } = useUser();
    const { amount, merchantId, merchantName, merchantBank, merchantUpi } = location.state || {};

    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleDigit = (digit) => {
        if (pin.length < 4) {
            setPin(prev => prev + digit);
            setError('');
        }
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
    };

    const handleConfirm = () => {
        if (validatePin(pin)) {
            processPayment();
        } else {
            setError('Incorrect UPI PIN. Please try again.');
            setPin('');
        }
    };

    const processPayment = () => {
        setIsProcessing(true);
        // Add a small delay for realistic feeling
        setTimeout(() => {
            try {
                const { amount, merchantId, merchantName, merchantBank, merchantUpi, type } = location.state || {};
                const tokensUsed = TokenManager.consumeTokens(amount);
                const transaction = SyncManager.addTransaction({
                    merchantId: merchantId || 'm_unknown',
                    merchantName: merchantName || 'Merchant',
                    amount: amount,
                    upi: merchantUpi || 'merchant@okupi',
                    bankName: merchantBank || 'Bank',
                    type: type || 'offline',
                    tokens: tokensUsed.map(t => t.id)
                });

                navigate('/success', { state: { transaction } });
            } catch (err) {
                setError(err.message);
                setIsProcessing(false);
            }
        }, 600);
    };

    if (!amount) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <p>Invalid session. Please start over.</p>
                <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: '20px' }}>Back to Home</button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'white',
                zIndex: 1000,
                padding: '24px',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <button onClick={() => navigate(-1)} className="btn" style={{ padding: '8px', background: 'transparent' }}>
                    <ArrowLeft size={24} />
                </button>
                <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Lock size={18} color="var(--primary)" />
                    ENTER UPI PIN
                </h2>
                <div style={{ width: '40px' }} />
            </div>

            <div style={{ textAlign: 'center', flex: 1 }}>
                <p className="text-label" style={{ marginBottom: '16px' }}>Paying ₹{amount} to</p>
                <h2 style={{ marginBottom: '40px' }}>{merchantName}</h2>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '16px' }}>
                    {[1, 2, 3, 4].map(idx => (
                        <div
                            key={idx}
                            style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                background: pin.length >= idx ? 'var(--primary)' : '#eee',
                                transition: 'all 0.2s',
                                boxShadow: pin.length === idx ? '0 0 8px var(--primary-light)' : 'none'
                            }}
                        />
                    ))}
                </div>

                {error && (
                    <p style={{ color: 'var(--error)', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}>{error}</p>
                )}

                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '16px' }}>
                    Hint: Default PIN is <span style={{ color: 'var(--primary)', fontWeight: 700 }}>1234</span>
                </p>

                <button
                    onClick={() => setShowPin(!showPin)}
                    className="btn"
                    style={{ background: 'transparent', color: 'var(--text-dim)', fontSize: '0.8rem', padding: '4px', margin: '0 auto' }}
                >
                    {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                    {showPin ? 'Hide PIN' : 'View PIN'}
                </button>

                {showPin && pin && (
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '8px', letterSpacing: '8px' }}>{pin}</p>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', paddingBottom: '20px' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'DEL'].map((val, idx) => (
                    <button
                        key={idx}
                        className="btn btn-secondary"
                        style={{ height: '64px', fontSize: '1.5rem', background: '#f8f9fa', border: 'none' }}
                        disabled={val === '' || isProcessing}
                        onClick={() => val === 'DEL' ? handleDelete() : handleDigit(val.toString())}
                    >
                        {val === 'DEL' ? <Delete size={24} /> : val}
                    </button>
                ))}
            </div>

            <button
                className="btn btn-primary"
                style={{ width: '100%', height: '56px', borderRadius: '12px' }}
                disabled={pin.length < 4 || isProcessing}
                onClick={handleConfirm}
            >
                {isProcessing ? 'PROCESSING...' : 'CONFIRM PAYMENT'}
            </button>
        </motion.div>
    );
};

export default PinScreen;
