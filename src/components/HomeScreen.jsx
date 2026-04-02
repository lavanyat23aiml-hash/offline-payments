import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scan, History, CreditCard, PlusCircle, ArrowUpRight, Phone, AtSign, Landmark } from 'lucide-react';

const HomeScreen = ({ balance, handlePreload, isOnline }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="home-screen"
        >
            <div className="card" style={{ padding: '16px', borderRadius: '24px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '16px' }}>Transfer Money</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center' }}>
                    <div onClick={() => navigate('/scan')} style={{ cursor: 'pointer' }}>
                        <div style={{ background: '#e1f5fe', padding: '12px', borderRadius: '16px', display: 'inline-flex', marginBottom: '8px' }}>
                            <Scan size={24} color="#0288d1" />
                        </div>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600 }}>Scan QR</p>
                    </div>
                    <div onClick={() => navigate('/transfer')} style={{ cursor: 'pointer' }}>
                        <div style={{ background: '#e8f5e9', padding: '12px', borderRadius: '16px', display: 'inline-flex', marginBottom: '8px' }}>
                            <Phone size={24} color="#2e7d32" />
                        </div>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600 }}>To Phone</p>
                    </div>
                    <div onClick={() => navigate('/transfer')} style={{ cursor: 'pointer' }}>
                        <div style={{ background: '#fce4ec', padding: '12px', borderRadius: '16px', display: 'inline-flex', marginBottom: '8px' }}>
                            <AtSign size={24} color="#c2185b" />
                        </div>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600 }}>To UPI ID</p>
                    </div>
                    <div onClick={() => navigate('/bank-transfer')} style={{ cursor: 'pointer' }}>
                        <div style={{ background: '#fff3e0', padding: '12px', borderRadius: '16px', display: 'inline-flex', marginBottom: '8px' }}>
                            <Landmark size={24} color="#ef6c00" />
                        </div>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600 }}>To Bank</p>
                    </div>
                </div>
            </div>

            <div className="quick-actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '16px', marginTop: '10px' }}>
                <button className="btn btn-secondary" onClick={() => navigate('/history')} style={{ height: '80px', justifyContent: 'space-between', padding: '0 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <History size={24} color="#673ab7" />
                        <span>Transaction History</span>
                    </div>
                    <span>&rarr;</span>
                </button>
            </div>

            <div className="card" style={{ marginTop: '24px' }}>
                <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CreditCard size={20} color="#673ab7" />
                    Offline Tokens
                </h3>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p className="text-label" style={{ fontSize: '0.8rem' }}>Pre-authorized limit</p>
                        <p style={{ fontWeight: 700, fontSize: '1.2rem' }}>₹{balance}</p>
                    </div>
                    <button
                        className="btn"
                        style={{ padding: '8px 16px', fontSize: '0.85rem', background: '#f0eaff', color: '#673ab7' }}
                        disabled={!isOnline}
                        onClick={handlePreload}
                    >
                        <PlusCircle size={16} />
                        Add More
                    </button>
                </div>

                {!isOnline && balance < 100 && (
                    <p className="text-label" style={{ marginTop: '12px', color: '#ff5252', fontSize: '0.75rem' }}>
                        * Low balance. Go online to reload tokens.
                    </p>
                )}
            </div>

            <div className="recent-activity" style={{ marginTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '1rem' }}>Tips for Offline Pay</h3>
                </div>
                <div className="card" style={{ padding: '16px', background: '#f8f9fa', border: 'none', boxShadow: 'none' }}>
                    <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: '#555' }}>
                        <li style={{ marginBottom: '8px', display: 'flex', gap: '8px' }}>
                            <ArrowUpRight size={14} color="#673ab7" />
                            Preload tokens while you have internet.
                        </li>
                        <li style={{ marginBottom: '8px', display: 'flex', gap: '8px' }}>
                            <ArrowUpRight size={14} color="#673ab7" />
                            Scan any merchant QR code normally.
                        </li>
                        <li style={{ marginBottom: '8px', display: 'flex', gap: '8px' }}>
                            <ArrowUpRight size={14} color="#673ab7" />
                            Pay even in basements or zero-signal areas!
                        </li>
                    </ul>
                </div>
            </div>
        </motion.div>
    );
};

export default HomeScreen;
