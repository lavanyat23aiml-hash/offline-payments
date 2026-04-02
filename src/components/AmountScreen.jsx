import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, ShieldAlert, RefreshCw, ArrowUpRight } from 'lucide-react';
import { TokenManager } from '../logic/tokenManager';
import { useConnectivity } from '../hooks/useConnectivity';

const AmountScreen = () => {
    const { merchantId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { isOnline } = useConnectivity();

    // Get merchant name from query or default
    const query = new URLSearchParams(location.search);
    const merchantName = query.get('name') || merchantId;

    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');

    const handlePay = () => {
        const numAmount = parseFloat(amount);
        const availableBalance = TokenManager.getAvailableBalance();

        if (isNaN(numAmount) || numAmount <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        if (numAmount > availableBalance) {
            setError('Insufficient Balance');
            return;
        }

        if (numAmount > 500 && !isOnline) {
            setError('Maximum offline payment is ₹500');
            return;
        }

        // Navigate to PIN screen for security simulation
        navigate('/pin', {
            state: {
                amount: numAmount,
                merchantId,
                merchantName,
                merchantBank: 'HDFC Bank',
                merchantUpi: merchantId + '@okupi',
                type: isOnline ? 'online' : 'offline'
            }
        });
    };

    const appendDigit = (digit) => {
        if (amount.length < 6) {
            setAmount(prev => prev + digit);
            setError('');
        }
    };

    const deleteDigit = () => {
        setAmount(prev => prev.slice(0, -1));
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="amount-screen"
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <button onClick={() => navigate(-1)} className="btn" style={{ padding: '8px', background: 'transparent' }}>
                    <ArrowLeft size={24} />
                </button>
                <h2>Paying Merchant</h2>
            </div>

            <div className="card" style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'inline-flex', background: '#f0eaff', padding: '16px', borderRadius: '50%', marginBottom: '12px' }}>
                    <User size={32} color="var(--primary)" />
                </div>
                <h3>{merchantName}</h3>
                <p className="text-label" style={{ fontSize: '0.8rem' }}>Banking Name: {merchantName.toUpperCase()}</p>

                <div style={{ marginTop: '32px', position: 'relative' }}>
                    <span style={{ fontSize: '1.5rem', position: 'absolute', left: '20%', top: '50%', transform: 'translateY(-50%)', fontWeight: 600 }}>₹</span>
                    <h1 style={{ fontSize: '3rem' }}>{amount || '0'}</h1>
                    {error && <p style={{ color: 'var(--error)', fontSize: '0.85rem', marginTop: '8px', fontWeight: 600 }}>{error}</p>}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'DEL'].map((val, idx) => (
                    <button
                        key={idx}
                        className="btn btn-secondary"
                        style={{ height: '56px', fontSize: '1.2rem', background: '#f8f9fa', border: 'none' }}
                        onClick={() => val === 'DEL' ? deleteDigit() : appendDigit(val)}
                    >
                        {val === 'DEL' ? 'DEL' : val}
                    </button>
                ))}
            </div>

            <button
                className="btn btn-primary"
                style={{ marginTop: 'auto', height: '56px', borderRadius: '16px', gap: '8px', background: isOnline ? 'var(--primary)' : '#ffab00' }}
                onClick={handlePay}
            >
                {isOnline ? 'Pay Online' : 'Pay Offline'} 
                {isOnline ? <ArrowUpRight size={18} /> : <ShieldAlert size={18} />}
            </button>
        </motion.div>
    );
};

export default AmountScreen;
