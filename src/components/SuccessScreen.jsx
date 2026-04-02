import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Share2, ArrowRight, Clock, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

const SuccessScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { transaction } = location.state || {};

    useEffect(() => {
        if (transaction) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#673ab7', '#1a73e8', '#00c853']
            });

            // Play a simulated successful ping sound (visual cue suffice)
        } else {
            navigate('/');
        }
    }, [transaction]);

    if (!transaction) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="success-screen"
            style={{ textAlign: 'center', paddingTop: '40px' }}
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
                style={{ marginBottom: '24px' }}
            >
                <CheckCircle2 size={100} color="var(--success)" strokeWidth={2.5} />
            </motion.div>

            <h1 style={{ color: 'var(--success)', marginBottom: '8px' }}>Payment Successful</h1>
            {transaction.type === 'offline' ? (
                <div style={{
                    display: 'inline-block',
                    background: '#ffab00',
                    color: 'white',
                    padding: '8px 20px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    marginBottom: '24px',
                    border: '2px solid white',
                    boxShadow: '0 4px 12px rgba(255, 171, 0, 0.4)',
                    letterSpacing: '1px'
                }}>
                    <Zap size={16} style={{ display: 'inline', marginRight: '4px' }} />
                    OFFLINE RECEIPT
                </div>
            ) : (
                <div style={{
                    display: 'inline-block',
                    background: '#e8f5e9',
                    color: '#2e7d32',
                    padding: '8px 20px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    marginBottom: '24px',
                    border: '1px solid #c8e6c9'
                }}>
                    ONLINE PAYMENT
                </div>
            )}

            <p className="text-label" style={{ marginBottom: '32px' }}>Transaction ID: {transaction.id}</p>

            <div className="card" style={{ textAlign: 'left', background: '#f8fff9', border: '1px solid #e0f2e1', boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ color: '#555' }}>Paid to</span>
                    <span style={{ fontWeight: 700 }}>{transaction.merchantName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ color: '#555' }}>Amount</span>
                    <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>₹{transaction.amount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#555' }}>Status</span>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 700, color: 'var(--success)', fontSize: '0.9rem' }}>Verified Offline</p>
                        <p style={{ fontSize: '0.7rem', color: '#856404', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                            <Clock size={12} />
                            Syncing soon
                        </p>
                    </div>
                </div>
            </div>

            <p style={{ margin: '24px 0', fontSize: '0.9rem', color: '#444', fontWeight: 500, lineHeight: 1.5 }}>
                This payment was authorized using <span style={{ color: 'var(--primary)' }}>Offline Pre-loaded Tokens</span>. <br />
                It will be updated in your bank statement once you connect to the internet.
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-secondary" style={{ flex: 1 }}>
                    <Share2 size={18} />
                    Share
                </button>
                <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => navigate('/')}>
                    Done
                    <ArrowRight size={18} />
                </button>
            </div>
        </motion.div>
    );
};

export default SuccessScreen;
