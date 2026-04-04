import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    ArrowLeft, 
    CheckCircle2, 
    Clock, 
    Share2, 
    ShieldCheck, 
    Download, 
    AlertCircle, 
    Zap, 
    XCircle, 
    RefreshCw, 
    Building2,
    Calendar,
    Hash
} from 'lucide-react';
import { SyncManager } from '../logic/syncManager';

const LIFECYCLE_STEPS = ['Created', 'Pending', 'Synced', 'Completed'];

/**
 * TransactionDetailScreen
 * Full lifecycle timeline view with retry support for failed payments.
 */
const TransactionDetailScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [transaction, setTransaction] = useState(location.state?.transaction || null);
    const [retrying, setRetrying] = useState(false);

    if (!transaction) {
        navigate('/history');
        return null;
    }

    const isCompleted = transaction.status === 'Completed';
    const isFailed = transaction.status === 'Failed';
    const isOffline = transaction.type === 'offline';
    const log = transaction.lifecycleLog || [];

    const steps = isFailed 
        ? ['Created', 'Pending', 'Synced', 'Failed']
        : LIFECYCLE_STEPS;

    const getStepInfo = (step) => {
        const found = log.find(l => l.status === step);
        if (found) return { done: true, ts: found.ts };
        return { done: false };
    };

    const handleRetry = async () => {
        setRetrying(true);
        const success = await SyncManager.retryTransaction(transaction.id);
        if (success) {
            const updated = SyncManager.getTransactionById(transaction.id);
            if (updated) setTransaction(updated);
        }
        setRetrying(false);
    };

    const statusColor = isCompleted ? 'var(--success)' : isFailed ? 'var(--error)' : 'var(--warning)';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            style={{ paddingBottom: '40px' }}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <button onClick={() => navigate(-1)} className="btn" style={{ padding: '8px', background: 'transparent' }}>
                    <ArrowLeft size={24} />
                </button>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Record Details</h2>
            </div>

            {/* Status Summary Card */}
            <div className="card" style={{ 
                textAlign: 'center', 
                borderTop: `6px solid ${statusColor}`, 
                marginBottom: '24px',
                padding: '30px 20px'
            }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
                    {isCompleted ? <CheckCircle2 size={70} color="var(--success)" strokeWidth={1} /> :
                     isFailed ? <XCircle size={70} color="var(--error)" strokeWidth={1} /> :
                     <Clock size={70} color="var(--warning)" strokeWidth={1} />}
                    
                    {isOffline && (
                        <div style={{
                            position: 'absolute', top: -5, right: -15,
                            background: '#ffab00', color: 'white',
                            padding: '4px 8px', borderRadius: '12px',
                            fontSize: '0.65rem', fontWeight: 900,
                            display: 'flex', alignItems: 'center', gap: '4px',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                        }}>
                            <Zap size={10} fill="white" /> OFFLINE
                        </div>
                    )}
                </div>

                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: statusColor, marginBottom: '4px' }}>₹{transaction.amount}</h1>
                <p style={{ fontWeight: 800, color: statusColor, marginBottom: '20px', letterSpacing: '0.5px' }}>
                    {isCompleted ? 'PAYMENT SUCCESSFUL' : isFailed ? 'PAYMENT FAILED' : 'OFFLINE PENDING SYNC'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px dashed #eee', paddingTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#999' }}>
                            <Building2 size={16} /> <span style={{ fontSize: '0.85rem' }}>Recipient</span>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{transaction.merchantName}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#999' }}>
                            <Calendar size={16} /> <span style={{ fontSize: '0.85rem' }}>Timestamp</span>
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '0.8rem', color: '#666' }}>
                            {new Date(transaction.timestamp).toLocaleString()}
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#999' }}>
                            <Hash size={16} /> <span style={{ fontSize: '0.85rem' }}>Transaction ID</span>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.75rem', fontFamily: 'monospace', color: '#444' }}>{transaction.id}</span>
                    </div>
                </div>
            </div>

            {/* Lifecycle Timeline (Crucial Feature) */}
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '16px' }}>Transaction Lifecycle</h3>
            <div className="card" style={{ marginBottom: '24px' }}>
                <div style={{ paddingLeft: '20px', position: 'relative' }}>
                    {steps.map((step, i) => {
                        const { done, ts } = getStepInfo(step);
                        const isLast = i === steps.length - 1;
                        const color = done ? (step === 'Failed' ? 'var(--error)' : 'var(--success)') : '#eee';

                        return (
                            <div key={step} style={{ display: 'flex', gap: '20px', marginBottom: isLast ? 0 : '16px' }}>
                                {/* Timeline line & dot */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                                    <div style={{ 
                                        width: '12px', height: '12px', borderRadius: '50%', 
                                        background: color, zIndex: 2, marginTop: '4px',
                                        boxShadow: done ? `0 0 8px ${color}88` : 'none',
                                        transition: 'all 0.3s ease'
                                    }} />
                                    {!isLast && <div style={{ 
                                        width: '2px', flex: 1, background: done ? color : '#eee', 
                                        margin: '2px 0', position: 'absolute', top: '16px' 
                                    }} />}
                                </div>
                                {/* Label & Time */}
                                <div>
                                    <p style={{ 
                                        fontSize: '0.9rem', fontWeight: done ? 800 : 500, 
                                        color: done ? '#222' : '#ccc' 
                                    }}>{step}</p>
                                    {ts && <p style={{ fontSize: '0.7rem', color: '#aaa', marginTop: '2px' }}>
                                        {new Date(ts).toLocaleTimeString([], { timeStyle: 'medium' })}
                                    </p>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Offline Token Info */}
            {isOffline && (
                <div className="card" style={{ background: '#f5f0ff', marginBottom: '24px', border: '1px solid #e1d5ff' }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '12px' }}>TOKEN BACKED SETTLEMENT</h4>
                    <p style={{ fontSize: '0.78rem', color: '#666', lineHeight: 1.5, marginBottom: '14px' }}>
                        This payment was authorized using valid, pre-signed offline tokens stored on this device. The merchant safe-settlement is guaranteed.
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {(transaction.tokens || []).map(id => (
                            <span key={id} style={{ 
                                background: 'white', padding: '4px 10px', borderRadius: '8px', 
                                fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary)',
                                fontFamily: 'monospace', border: '1px solid #e1d5ff'
                            }}>
                                #{id.split('_').pop()?.slice(-8)}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Fail Action / Retry */}
            {isFailed && (
                <div style={{ background: '#ffebee', padding: '20px', borderRadius: '20px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <AlertCircle size={22} color="var(--error)" strokeWidth={3} />
                        <div>
                            <p style={{ fontWeight: 800, color: '#c62828', fontSize: '0.95rem' }}>Failed during Sync</p>
                            <p style={{ fontSize: '0.8rem', color: '#c62828', opacity: 0.8 }}>
                                Error: {transaction.failReason || 'Local signature verification failed.'}
                            </p>
                        </div>
                    </div>
                    {transaction.retries < 3 && (
                        <button 
                            className="btn" 
                            style={{ width: '100%', background: 'var(--error)', color: 'white', fontWeight: 800, height: '52px' }}
                            disabled={retrying}
                            onClick={handleRetry}
                        >
                            <RefreshCw size={18} className={retrying ? 'spin' : ''} /> 
                            {retrying ? 'Retrying Payment...' : `Retry Sync (${transaction.retries + 1}/3)`}
                        </button>
                    )}
                </div>
            )}

            {/* Action Group */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px' }}>
                <button className="btn btn-secondary" style={{ borderRadius: '14px' }}>
                    <Share2 size={18} /> Share Receipt
                </button>
                <button className="btn btn-secondary" style={{ borderRadius: '14px' }}>
                    <Download size={18} /> Save PDF
                </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <div style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: '8px', 
                    color: '#ccc', fontSize: '0.8rem', fontWeight: 700 
                }}>
                    <ShieldCheck size={16} /> SECURED BY UPI PRIVACY PROTOCOL
                </div>
            </div>
        </motion.div>
    );
};

export default TransactionDetailScreen;
