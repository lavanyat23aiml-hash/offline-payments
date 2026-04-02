import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Clock, Trash2, Search, Zap } from 'lucide-react';
import { SyncManager } from '../logic/syncManager';

const HistoryScreen = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        setTransactions(SyncManager.getAllTransactions());
    }, []);

    const handleClear = () => {
        if (window.confirm('Clear transaction history?')) {
            SyncManager.clearHistory();
            setTransactions([]);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="history-screen"
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={() => navigate('/')} className="btn" style={{ padding: '8px', background: 'transparent' }}>
                        <ArrowLeft size={24} />
                    </button>
                    <h2>All Transactions</h2>
                </div>
                <button onClick={handleClear} className="btn" style={{ padding: '8px', background: 'transparent', color: 'var(--error)' }}>
                    <Trash2 size={20} />
                </button>
            </div>

            {transactions.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '60px', opacity: 0.5 }}>
                    <Search size={48} style={{ marginBottom: '16px' }} />
                    <p>No transactions yet</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {transactions.map(tx => (
                        <div
                            key={tx.id}
                            className="card"
                            style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                            onClick={() => navigate('/tx-detail', { state: { transaction: tx } })}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    background: tx.status === 'Completed' ? '#e8f5e9' : '#fff8e1',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    position: 'relative'
                                }}>
                                    {tx.status === 'Completed' ? (
                                        <CheckCircle size={20} color="#2e7d32" />
                                    ) : (
                                        <Clock size={20} color="#f57f17" />
                                    )}
                                    {tx.type === 'offline' && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '-4px',
                                            right: '-4px',
                                            background: '#ffab00',
                                            padding: '2px',
                                            borderRadius: '50%',
                                            border: '2px solid white',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                            <Zap size={10} color="white" fill="white" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <h4 style={{ fontSize: '0.95rem' }}>{tx.merchantName}</h4>
                                        {tx.type === 'offline' && (
                                            <span style={{
                                                fontSize: '0.6rem',
                                                background: '#fff8e1',
                                                color: '#f57f17',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                fontWeight: 700,
                                                border: '1px solid #ffeeba'
                                            }}>OFFLINE</span>
                                        )}
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: '#888' }}>
                                        {new Date(tx.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                    </p>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontWeight: 700 }}>₹{tx.amount}</p>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                                    <p style={{
                                        fontSize: '0.65rem',
                                        color: tx.status === 'Completed' ? '#2e7d32' : '#f57f17',
                                        fontWeight: 600
                                    }}>
                                        {tx.status}
                                    </p>
                                    {tx.status === 'Completed' && tx.type === 'offline' && (
                                        <span style={{ fontSize: '0.65rem', color: '#888' }}>(Synced)</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default HistoryScreen;
