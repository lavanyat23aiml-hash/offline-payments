import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CheckCircle2, 
    Share2, 
    ArrowRight, 
    Zap, 
    ShieldCheck, 
    Building2, 
    RefreshCw,
    Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../hooks/useLanguage';

/**
 * SuccessScreen
 * Detailed receipt with Merchant Trust Banner and Token IDs for offline payments.
 */
const SuccessScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { transaction } = location.state || {};
    const { t } = useLanguage();

    useEffect(() => {
        if (!transaction) {
            navigate('/');
            return;
        }

        // Celebrate success!
        confetti({
            particleCount: 200,
            spread: 90,
            origin: { y: 0.6 },
            colors: transaction.type === 'offline' 
                ? ['#ffab00', '#ff6f00', '#fff9c4'] 
                : ['#673ab7', '#512da8', '#00c853']
        });
    }, [transaction, navigate]);

    if (!transaction) return null;

    const isOffline = transaction.type === 'offline';
    const shortTokens = (transaction.tokens || []).map(id => id.split('_').pop()?.slice(-6));

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{ 
                padding: '40px 24px', 
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}
        >
            {/* Main Success Circle */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
                style={{ 
                    width: '120px', 
                    height: '120px', 
                    background: '#e8f5e9', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginBottom: '24px',
                    color: 'var(--success)',
                    boxShadow: '0 12px 30px rgba(46, 125, 50, 0.15)'
                }}
            >
                <CheckCircle2 size={70} strokeWidth={1.5} />
            </motion.div>

            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--success)', marginBottom: '8px' }}>
                ₹{transaction.amount} {t('payment_paid')}
            </h1>

            {/* Offline/Online Logic Badge */}
            {isOffline ? (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: '#ffab00', color: 'white',
                    padding: '8px 20px', borderRadius: '24px',
                    fontWeight: 800, fontSize: '0.85rem', marginBottom: '24px',
                    boxShadow: '0 8px 20px rgba(255, 171, 0, 0.4)',
                    letterSpacing: '0.5px'
                }}>
                    <Zap size={14} fill="white" /> {t('offline_receipt')}
                </div>
            ) : (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: '#f0f0f0', color: '#666',
                    padding: '8px 20px', borderRadius: '24px',
                    fontWeight: 700, fontSize: '0.85rem', marginBottom: '24px',
                    border: '1px solid #ddd'
                }}>
                    <ShieldCheck size={14} /> {t('online_receipt')}
                </div>
            )}

            <p style={{ fontSize: '0.72rem', color: '#999', marginBottom: '24px', letterSpacing: '0.5px' }}>
                {t('reference')}: {transaction.id}
            </p>

            {/* Merchant Trust Information (Crucial Feature) */}
            {isOffline && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    style={{
                        background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
                        color: 'white',
                        padding: '24px',
                        borderRadius: '24px',
                        textAlign: 'left',
                        marginBottom: '20px',
                        boxShadow: '0 15px 35px rgba(26, 35, 126, 0.25)'
                    }}
                >
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <Building2 size={24} style={{ flexShrink: 0, marginTop: '4px' }} />
                        <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>Merchant Notification Sent</h4>
                    </div>
                    <p style={{ fontSize: '0.85rem', opacity: 0.9, lineHeight: 1.6 }}>
                        "{t('payment_trust_msg')}"
                    </p>
                </motion.div>
            )}

            {/* Receipt Summary Card */}
            <div className="card" style={{ 
                width: '100%', 
                textAlign: 'left', 
                marginBottom: '16px',
                background: isOffline ? '#fffdf0' : '#f9f9f9',
                border: `1px solid ${isOffline ? '#f9eb9d' : '#eee'}`
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#888' }}>{t('recipient')}</span>
                    <span style={{ fontWeight: 700 }}>{transaction.merchantName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#888' }}>{t('account')}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{transaction.bankName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#888' }}>{t('mode')}</span>
                    <span style={{ fontWeight: 700, color: isOffline ? '#e65100' : 'var(--success)' }}>
                        {isOffline ? 'Offline Token' : 'Direct Bank'}
                    </span>
                </div>

                {isOffline && shortTokens && shortTokens.length > 0 && (
                    <div style={{ borderTop: '1px dashed #ddd', paddingTop: '14px', marginTop: '4px' }}>
                        <p style={{ fontSize: '0.72rem', color: '#999', marginBottom: '8px', fontWeight: 700 }}>{t('token_audit_trail')}</p>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {shortTokens.map((t, idx) => (
                                <span key={idx} style={{ 
                                    fontSize: '0.65rem', 
                                    background: '#eee', 
                                    padding: '4px 8px', 
                                    borderRadius: '6px',
                                    fontWeight: 700,
                                    fontFamily: 'monospace'
                                }}>
                                    #{t}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Sync Notice */}
            {isOffline && (
                <div style={{ 
                    display: 'flex', alignItems: 'center', gap: '10px', 
                    color: '#e65100', fontSize: '0.85rem', fontWeight: 700,
                    marginBottom: '24px'
                }}>
                    <RefreshCw size={16} /> {t('auto_sync_pending')}
                </div>
            )}

            {/* Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', width: '100%' }}>
                <button className="btn btn-secondary" style={{ padding: '16px', borderRadius: '16px' }}>
                    <Share2 size={20} />
                </button>
                <button 
                    className="btn btn-primary" 
                    style={{ padding: '16px', borderRadius: '16px', fontWeight: 800 }}
                    onClick={() => navigate('/')}
                >
                    {t('done')} <ArrowRight size={20} />
                </button>
            </div>

            <button style={{ 
                marginTop: '24px', background: 'none', border: 'none', 
                color: '#aaa', fontSize: '0.8rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '8px'
            }}>
                <Download size={14} /> Download Receipt
            </button>
        </motion.div>
    );
};

export default SuccessScreen;
