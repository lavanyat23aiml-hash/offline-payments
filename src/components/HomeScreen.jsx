import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    QrCode, 
    Smartphone, 
    History, 
    Zap, 
    ShieldCheck, 
    ArrowRight,
    Building2,
    PlusCircle,
    Wallet,
    Wifi,
    WifiOff
} from 'lucide-react';

/**
 * HomeScreen
 * Dashboard showing both Wallet and Offline balances.
 * Automatic connectivity and Wallet-to-Token transfer logic.
 */
const HomeScreen = ({ balance, walletBalance, handlePreload, isOnline, syncStats }) => {
    const navigate = useNavigate();

    const quickActions = [
        { icon: <QrCode size={26} />, label: 'Scan QR', path: '/scan', color: '#673ab7' },
        { icon: <Building2 size={26} />, label: 'To Bank', path: '/bank-transfer', color: '#1a73e8' },
        { icon: <Smartphone size={26} />, label: 'UPI ID', path: '/transfer', color: '#2e7d32' },
        { icon: <History size={26} />, label: 'History', path: '/history', color: '#ef6c00' },
    ];

    const quickMerchants = [
        { name: 'Cafe Coffee', icon: '☕', id: 'm_cafe_central', upi: 'cafe@okaxis', bank: 'Axis Bank' },
        { name: 'Pharma Plus', icon: '💊', id: 'm_pharma_care', upi: 'pharma@okSBI', bank: 'SBI' },
        { name: 'Big Bazaar', icon: '🛒', id: 'm_grocery_mart', upi: 'grocery@okaxis', bank: 'HDFC Bank' },
        { name: 'Shell Fuel', icon: '⛽', id: 'm_shell_fuel', upi: 'shell@okaxis', bank: 'ICICI Bank' }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="home-screen"
        >
            {/* Automatic Connectivity Status Indicator */}
            <div style={{
                background: isOnline ? '#e8f5e9' : '#ffebee',
                color: isOnline ? '#2e7d32' : '#c62828',
                padding: '12px 20px',
                borderRadius: '16px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: `1px solid ${isOnline ? '#c8e6c9' : '#ffcdd2'}`
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isOnline ? <Wifi size={20} /> : <WifiOff size={20} />}
                    <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>
                        SYSTEM {isOnline ? 'ONLINE' : 'OFFLINE'}
                    </span>
                </div>
                <div style={{ 
                    width: '10px', height: '10px', borderRadius: '50%', 
                    background: isOnline ? '#00c853' : '#ff5252',
                    boxShadow: `0 0 10px ${isOnline ? '#00c85388' : '#ff525288'}`,
                    animation: 'pulse 1.5s infinite'
                }} />
            </div>

            {/* Quick Actions Grid */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                gap: '12px', 
                marginBottom: '28px' 
            }}>
                {quickActions.map((action, i) => (
                    <motion.div
                        key={action.label}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(action.path)}
                        style={{ textAlign: 'center', cursor: 'pointer' }}
                    >
                        <div style={{ 
                            background: 'white', 
                            padding: '16px', 
                            borderRadius: '18px', 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.05)',
                            marginBottom: '8px',
                            color: action.color
                        }}>
                            {action.icon}
                        </div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#666' }}>
                            {action.label.toUpperCase()}
                        </span>
                    </motion.div>
                ))}
            </div>

            {/* Balances Quick View */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div className="card" style={{ padding: '16px', background: 'linear-gradient(135deg, #673ab7 0%, #512da8 100%)', color: 'white', border: 'none' }}>
                   <p style={{ fontSize: '0.65rem', fontWeight: 800, opacity: 0.8, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                       <Wallet size={12} /> WALLET BALANCE
                   </p>
                   <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>₹{walletBalance.toLocaleString()}</h2>
                </div>
                <div className="card" style={{ padding: '16px', background: 'white', border: '1px solid #e1d5ff' }}>
                   <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary)', opacity: 0.8, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                       <Zap size={12} fill="var(--primary)" /> OFFLINE TOKENS
                   </p>
                   <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>₹{balance.toLocaleString()}</h2>
                </div>
            </div>

            {/* Offline Token Management Card */}
            <div className="card" style={{ 
                background: 'linear-gradient(135deg, #fff 0%, #f9f7ff 100%)',
                marginBottom: '24px',
                border: '1px solid #e1d5ff'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <Zap size={16} color="#ffab00" fill="#ffab00" />
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#e65100', letterSpacing: '0.5px' }}>
                                TOKEN RESERVE LIMIT
                            </span>
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>₹{balance.toLocaleString()} / ₹1,000</h2>
                    </div>
                   <button 
                        onClick={handlePreload}
                        className="btn btn-primary"
                        style={{ padding: '10px 16px', fontSize: '0.75rem', borderRadius: '12px', fontWeight: 800 }}
                    >
                        <PlusCircle size={14} /> AUTHORIZE
                    </button>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.7rem', color: '#888', fontWeight: 700 }}>Reserve Capacity: {((balance/1000)*100).toFixed(0)}%</span>
                    <span style={{ fontSize: '0.7rem', color: '#888', fontWeight: 700 }}>Funding: Wallet</span>
                </div>
                <div style={{ background: '#eee', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (balance / 1000) * 100)}%` }}
                        style={{ height: '100%', background: '#ffab00', borderRadius: '4px' }}
                    />
                </div>
            </div>

            {/* Sync Alert (Only when Online) */}
            {isOnline && syncStats?.pending > 0 && (
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{
                        background: '#e3f2fd', padding: '16px', borderRadius: '20px', border: '1px solid #bbdefb',
                        display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', cursor: 'pointer'
                    }}
                    onClick={() => navigate('/history')}
                >
                    <div style={{ background: '#1a73e8', padding: '10px', borderRadius: '12px', color: 'white' }}>
                        <RefreshCw size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1a73e8' }}>
                            {syncStats.pending} Payment{syncStats.pending > 1 ? 's' : ''} Ready to Sync
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#1a73e8', opacity: 0.8 }}>
                            You are back online. Click to settle payments.
                        </p>
                    </div>
                    <ArrowRight size={20} color="#1a73e8" />
                </motion.div>
            )}

            {/* Quick Pay Merchants */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Quick Pay Merchants</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800 }}>SEE ALL</span>
                </div>
                
                <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '12px' }}>
                    {quickMerchants.map(merc => (
                        <motion.div 
                            key={merc.id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(`/pay/${merc.id}`, { state: { 
                                merchantName: merc.name,
                                merchantUpi: merc.upi,
                                merchantBank: merc.bank
                            }})}
                            style={{ 
                                minWidth: '95px', background: 'white', padding: '16px 12px', borderRadius: '24px', 
                                textAlign: 'center', boxShadow: '0 6px 16px rgba(0,0,0,0.06)', cursor: 'pointer'
                            }}
                        >
                            <span style={{ fontSize: '1.6rem', marginBottom: '8px', display: 'block' }}>{merc.icon}</span>
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#444' }}>{merc.name.toUpperCase()}</span>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Security Banner */}
            <div style={{
                background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
                color: 'white', padding: '20px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '16px'
            }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '16px' }}>
                    <ShieldCheck size={28} />
                </div>
                <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '2px' }}>UPI Offline Vault</h4>
                    <p style={{ fontSize: '0.72rem', opacity: 0.8, lineHeight: 1.4 }}>
                        Your payments are backed by pre-authorized bank tokens. Safe & Instant.
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default HomeScreen;
