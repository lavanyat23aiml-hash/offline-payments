import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    ArrowLeft, 
    Zap, 
    ShieldCheck, 
    CheckCircle,
    Delete,
    Wallet
} from 'lucide-react';
import { useConnectivity } from '../hooks/useConnectivity';
import { TokenManager } from '../logic/tokenManager';
import { SyncManager } from '../logic/syncManager';

/**
 * AmountScreen
 * Entering payment amount. Dynamically switches between Wallet and Offline Balance.
 */
const AmountScreen = ({ updateBalance }) => {
    const navigate = useNavigate();
    const { merchantId } = useParams();
    const location = useLocation();
    const { isOnline } = useConnectivity();
    
    const { merchantName, merchantUpi, merchantBank } = location.state || { 
        merchantName: 'Merchant',
        merchantUpi: 'merchant@okupi',
        merchantBank: 'Bank'
    };

    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');

    const currentWallet = SyncManager.getWalletBalance();
    const currentTokens = TokenManager.getAvailableBalance();

    const handleDigit = (digit) => {
        if (amount.length >= 6) return;
        if (amount === '' && digit === '0') return;
        setAmount(prev => prev + digit);
        setError('');
    };

    const handleDelete = () => {
        setAmount(prev => prev.slice(0, -1));
        setError('');
    };

    const handleProceed = () => {
        const numAmount = Number(amount);
        if (numAmount <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        if (isOnline) {
            if (numAmount > currentWallet) {
                setError(`Insufficient Wallet Balance (₹${currentWallet.toLocaleString()})`);
                return;
            }
        } else {
            if (numAmount > currentTokens) {
                setError(`Insufficient Offline Tokens (₹${currentTokens.toLocaleString()})`);
                return;
            }
            if (numAmount > 500) {
                setError('Offline single transaction limit is ₹500');
                return;
            }
        }

        navigate('/pin', { state: { 
            amount: numAmount, 
            merchantId, 
            merchantName, 
            merchantBank, 
            merchantUpi,
            type: isOnline ? 'online' : 'offline'
        }});
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' }}
        >
            {/* Merchant Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <button onClick={() => navigate(-1)} className="btn" style={{ padding: '8px', background: 'transparent' }}>
                    <ArrowLeft size={24} />
                </button>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{merchantName}</h2>
                    <p style={{ fontSize: '0.7rem', color: '#aaa', fontWeight: 700 }}>{merchantUpi} • {merchantBank.toUpperCase()}</p>
                </div>
                <div style={{ background: '#f5f0ff', padding: '10px', borderRadius: '14px', color: 'var(--primary)' }}>
                    <CheckCircle size={20} />
                </div>
            </div>

            {/* Mode & Balance Info */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                {!isOnline ? (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ffe0b2', color: '#e65100', padding: '10px 20px', borderRadius: '24px', fontWeight: 800, fontSize: '0.8rem', border: '1px solid #ffcc80' }}>
                        <Zap size={14} fill="#e65100" /> OFFLINE TOKENS: ₹{currentTokens.toLocaleString()}
                    </div>
                ) : (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#e1f5fe', color: '#0288d1', padding: '10px 20px', borderRadius: '24px', fontWeight: 800, fontSize: '0.8rem', border: '1px solid #b3e5fc' }}>
                        <Wallet size={14} /> WALLET BALANCE: ₹{currentWallet.toLocaleString()}
                    </div>
                )}
            </div>

            {/* Amount Display */}
            <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ color: '#bbb', fontSize: '1.8rem', fontWeight: 700, marginBottom: '8px' }}>₹</div>
                <h1 style={{ fontSize: '4.8rem', fontWeight: 900, color: amount ? 'var(--text)' : '#eee', lineHeight: 1 }}>
                    {amount || '0'}
                </h1>
                
                {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: 'var(--error)', fontSize: '0.85rem', fontWeight: 700, marginTop: '20px' }}>
                        {error}
                    </motion.p>
                )}
            </div>

            {/* Custom Keypad */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', padding: '24px 0' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'DEL'].map((val, idx) => (
                    <motion.button
                        key={idx}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => val === 'DEL' ? handleDelete() : handleDigit(val.toString())}
                        style={{
                            height: '68px', fontSize: '1.6rem', fontWeight: 800, background: 'white', border: 'none', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: val === 'DEL' ? 'var(--error)' : 'var(--text)', boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
                        }}
                    >
                        {val === 'DEL' ? <Delete size={24} /> : val}
                    </motion.button>
                ))}
            </div>

            {/* Proceed Button */}
            <button 
                className="btn btn-primary" 
                style={{ width: '100%', height: '62px', borderRadius: '20px', fontSize: '1.1rem', fontWeight: 800, boxShadow: '0 12px 24px rgba(103, 58, 183, 0.25)' }}
                disabled={!amount || Number(amount) <= 0}
                onClick={handleProceed}
            >
                {isOnline ? 'Online Pay' : 'Offline Pay via Token'} ₹{amount || '0'}
            </button>
        </motion.div>
    );
};

export default AmountScreen;
