import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Clock, Share2, ShieldCheck, Download, AlertCircle, Zap } from 'lucide-react';

const TransactionDetailScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { transaction } = location.state || {};

    if (!transaction) {
        navigate('/history');
        return null;
    }

    const isCompleted = transaction.status === 'Completed';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="tx-detail-screen"
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <button onClick={() => navigate(-1)} className="btn" style={{ padding: '8px', background: 'transparent' }}>
                    <ArrowLeft size={24} />
                </button>
                <h2>Transaction Detail</h2>
            </div>

            <div className="card" style={{ textAlign: 'center', borderTop: `4px solid ${isCompleted ? 'var(--success)' : 'var(--warning)'}` }}>
                <div style={{ marginTop: '20px', position: 'relative' }}>
                    {isCompleted ? (
                        <CheckCircle2 size={64} color="var(--success)" />
                    ) : (
                        <Clock size={64} color="var(--warning)" />
                    )}
                    {transaction.type === 'offline' && (
                        <div style={{
                            position: 'absolute',
                            top: '-10px',
                            right: 'calc(50% - 40px)',
                            background: '#ffab00',
                            color: 'white',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            border: '2px solid white',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                        }}>
                            <Zap size={10} fill="white" />
                            OFFLINE
                        </div>
                    )}
                </div>

                <h2 style={{ marginTop: '16px', fontSize: '1.8rem' }}>₹{transaction.amount}</h2>
                <p style={{ fontWeight: 600, color: isCompleted ? 'var(--success)' : '#856404', marginTop: '4px' }}>
                    {isCompleted ? 'Payment Successful' : 'Offline Payment Pending Sync'}
                </p>
                {transaction.type === 'offline' && (
                    <p style={{ fontSize: '0.75rem', color: '#856404', fontWeight: 600, marginTop: '4px' }}>
                        Authorized via Offline Tokens
                    </p>
                )}
                <p className="text-label" style={{ marginTop: '8px', fontSize: '0.8rem' }}>
                    {new Date(transaction.timestamp).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}
                </p>

                <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px dashed #ddd' }} />

                <div style={{ textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <span style={{ color: '#666' }}>To</span>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontWeight: 700 }}>{transaction.merchantName}</p>
                            <p style={{ fontSize: '0.75rem', color: '#999' }}>{transaction.upi || 'merchant@okupi'}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <span style={{ color: '#666' }}>Payment Source</span>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontWeight: 700 }}>{transaction.type === 'offline' ? 'Offline Wallet' : 'Bank Account'}</p>
                            <p style={{ fontSize: '0.75rem', color: '#999' }}>{transaction.bankName}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <span style={{ color: '#666' }}>Transaction ID</span>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{transaction.id}</span>
                    </div>
                </div>

                {!isCompleted && (
                    <div style={{
                        background: '#fff3cd',
                        padding: '12px',
                        borderRadius: '12px',
                        marginTop: '20px',
                        display: 'flex',
                        gap: '10px',
                        fontSize: '0.8rem',
                        color: '#856404',
                        textAlign: 'left'
                    }}>
                        <AlertCircle size={18} />
                        <span>This payment was made offline. It will be synced with your bank once you connect to the internet.</span>
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '24px' }}>
                <button className="btn btn-secondary">
                    <Share2 size={18} />
                    Share
                </button>
                <button className="btn btn-secondary">
                    <Download size={18} />
                    Receipt
                </button>
            </div>

            <div style={{ marginTop: '32px', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                    <ShieldCheck size={16} />
                    Secured by UPI Offline Logic
                </div>
            </div>
        </motion.div>
    );
};

export default TransactionDetailScreen;
