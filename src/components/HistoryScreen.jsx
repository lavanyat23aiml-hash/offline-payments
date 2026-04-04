import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, 
    Search, 
    Filter, 
    Clock, 
    Zap, 
    ShieldCheck, 
    CheckCircle2, 
    AlertCircle,
    ShoppingBag,
    History as HistoryIcon,
    ArrowUpRight,
    ArrowDownLeft,
    Wifi,
    WifiOff
} from 'lucide-react';
import { SyncManager } from '../logic/syncManager';

/**
 * HistoryScreen
 * Filterable transaction list with status badges.
 * Transactions are IMMUTABLE.
 */
const HistoryScreen = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    
    const transactions = SyncManager.getAllTransactions();
    const stats = SyncManager.getStats();

    const filtered = transactions.filter(tx => {
        const matchesFilter = filter === 'All' || tx.status === filter;
        const matchesSearch = tx.merchantName.toLowerCase().includes(search.toLowerCase()) || 
                             tx.id.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            style={{ paddingBottom: '32px' }}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <button onClick={() => navigate(-1)} className="btn" style={{ padding: '8px', background: 'transparent' }}>
                    <ArrowLeft size={24} />
                </button>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Transaction History</h2>
                    <p style={{ fontSize: '0.75rem', color: '#888' }}>Immutable record of all payments</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <div className="card" style={{ flex: 1, padding: '12px', textAlign: 'center', background: 'white' }}>
                    <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#aaa', marginBottom: '4px' }}>PENDING</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffab00' }}>{stats.pending}</p>
                </div>
                <div className="card" style={{ flex: 1, padding: '12px', textAlign: 'center', background: 'white' }}>
                    <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#aaa', marginBottom: '4px' }}>COMPLETED</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--success)' }}>{stats.completed}</p>
                </div>
                <div className="card" style={{ flex: 1, padding: '12px', textAlign: 'center', background: 'white' }}>
                    <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#aaa', marginBottom: '4px' }}>FAILED</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--error)' }}>{stats.failed}</p>
                </div>
            </div>

            {/* Search & Tabs */}
            <div style={{ position: 'relative', marginBottom: '20px' }}>
                <Search size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: '#aaa' }} />
                <input 
                    type="text" 
                    placeholder="Search merchant or TXN ID..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ 
                        width: '100%', 
                        height: '48px', 
                        borderRadius: '16px', 
                        border: '1.5px solid #eee', 
                        padding: '0 20px 0 46px', 
                        fontSize: '0.9rem', 
                        fontWeight: 600, 
                        outline: 'none'
                    }}
                />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
                {['All', 'Pending', 'Completed', 'Failed'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '12px',
                            border: 'none',
                            background: filter === tab ? 'var(--primary)' : 'white',
                            color: filter === tab ? 'white' : '#666',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            whiteSpace: 'nowrap',
                            boxShadow: filter === tab ? '0 4px 12px rgba(103,58,183,0.2)' : 'none',
                            cursor: 'pointer'
                        }}
                    >
                        {tab.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Transaction List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <AnimatePresence mode="popLayout">
                    {filtered.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ textAlign: 'center', marginTop: '60px', opacity: 0.5 }}
                        >
                            <HistoryIcon size={48} style={{ margin: '0 auto 16px' }} />
                            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>No transactions yet</h3>
                            <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>Confirm your first payment to see it here.</p>
                        </motion.div>
                    ) : (
                        filtered.map(tx => (
                            <motion.div
                                layout
                                key={tx.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={() => navigate('/tx-detail', { state: { transaction: tx } })}
                                className="card"
                                style={{ 
                                    padding: '16px', 
                                    display: 'flex', 
                                    gap: '16px', 
                                    alignItems: 'center', 
                                    cursor: 'pointer',
                                    border: '1.5px solid #f8f8f8'
                                }}
                            >
                                <div style={{ 
                                    width: '48px', height: '48px', borderRadius: '16px', 
                                    background: tx.status === 'Completed' ? '#f1f8e9' : tx.status === 'Pending' ? '#fff3e0' : '#ffebee',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: tx.status === 'Completed' ? '#2e7d32' : tx.status === 'Pending' ? '#e65100' : '#d32f2f'
                                }}>
                                    {tx.type === 'online' ? <Wifi size={20} /> : <Zap size={20} fill="currentColor" />}
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                        <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#222' }}>{tx.merchantName}</h4>
                                        <span style={{ fontSize: '0.95rem', fontWeight: 900, color: tx.status === 'Failed' ? '#d32f2f' : '#222' }}>
                                            ₹{tx.amount}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <p style={{ fontSize: '0.65rem', color: '#999', fontWeight: 700 }}>
                                            {new Date(tx.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                        </p>
                                        
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <span style={{ 
                                                fontSize: '0.55rem', fontWeight: 900, padding: '2px 6px', borderRadius: '4px',
                                                background: tx.type === 'online' ? '#e3f2fd' : '#fff3e0',
                                                color: tx.type === 'online' ? '#1565c0' : '#e65100',
                                                letterSpacing: '0.5px'
                                            }}>
                                                {tx.type.toUpperCase()}
                                            </span>
                                            <span style={{ 
                                                fontSize: '0.55rem', fontWeight: 900, padding: '2px 6px', borderRadius: '4px',
                                                background: tx.status === 'Completed' ? '#e8f5e9' : tx.status === 'Pending' ? '#fff8e1' : '#ffebee',
                                                color: tx.status === 'Completed' ? '#2e7d32' : tx.status === 'Pending' ? '#ff8f00' : '#d32f2f',
                                                letterSpacing: '0.5px'
                                            }}>
                                                {tx.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default HistoryScreen;
