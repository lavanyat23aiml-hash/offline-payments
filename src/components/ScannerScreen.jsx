import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, User, ArrowLeft, Zap } from 'lucide-react';

const MERCHANTS = [
    { id: 'm_1', name: 'Starbucks Coffee', category: 'Food & Drinks' },
    { id: 'm_2', name: 'Reliance Fresh', category: 'Groceries' },
    { id: 'm_3', name: 'Decathlon Sports', category: 'Shopping' },
    { id: 'm_4', name: 'Apollo Pharmacy', category: 'Health' },
    { id: 'm_5', name: 'Shell Petrol Pump', category: 'Travel' },
    { id: 'm_6', name: 'Burger King', category: 'Food & Drinks' },
    { id: 'm_7', name: 'Big Bazaar', category: 'Groceries' },
    { id: 'm_8', name: 'H&M Store', category: 'Fashion' }
];

const ScannerScreen = () => {
    const navigate = useNavigate();
    const [scanning, setScanning] = useState(true);

    useEffect(() => {
        // Simulate finding a QR code after 1.5 seconds
        const timer = setTimeout(() => {
            setScanning(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="scanner-screen"
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <button onClick={() => navigate('/')} className="btn" style={{ padding: '8px', background: 'transparent' }}>
                    <ArrowLeft size={24} />
                </button>
                <h2>Scan QR Code</h2>
            </div>

            <div style={{
                flex: 1,
                background: '#000',
                borderRadius: '24px',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white'
            }}>
                {scanning ? (
                    <>
                        <div style={{
                            width: '250px',
                            height: '250px',
                            border: '2px solid rgba(255,255,255,0.3)',
                            borderRadius: '24px',
                            position: 'relative'
                        }}>
                            <motion.div
                                animate={{ top: ['0%', '100%', '0%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                style={{
                                    position: 'absolute',
                                    width: '100%',
                                    height: '2px',
                                    background: 'var(--primary-light)',
                                    boxShadow: '0 0 15px var(--primary-light)'
                                }}
                            />
                        </div>
                        <p style={{ marginTop: '24px', opacity: 0.8 }}>Align QR code within the frame</p>
                    </>
                ) : (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{ width: '100%', padding: '24px' }}
                    >
                        <div className="card" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <div style={{ background: 'var(--primary)', padding: '12px', borderRadius: '50%' }}>
                                    <User size={24} />
                                </div>
                                <div>
                                    <h3>Select Merchant</h3>
                                    <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Simulating scanned result...</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
                                {MERCHANTS.map(m => (
                                    <button
                                        key={m.id}
                                        className="btn btn-secondary"
                                        style={{ justifyContent: 'space-between', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                                        onClick={() => navigate(`/pay/${m.id}?name=${m.name}`)}
                                    >
                                        <span>{m.name}</span>
                                        <Zap size={16} color="#ffab00" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            <div style={{ padding: '20px', textAlign: 'center' }}>
                <button
                    className="btn btn-secondary"
                    style={{ width: '100%', marginBottom: '16px', background: '#f5f5f7' }}
                    onClick={() => navigate('/pay/m_2?name=Reliance%20Fresh')}
                >
                    Upload from Gallery
                </button>
                <p className="text-label">Static QR Codes supported</p>
            </div>
        </motion.div>
    );
};

export default ScannerScreen;
