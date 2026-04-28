import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, 
    Image as ImageIcon, 
    Flashlight, 
    Info, 
    CheckCircle,
    ArrowRight,
    Camera,
    Upload,
    RefreshCw
} from 'lucide-react';

/**
 * ScannerScreen
 * Manual QR scan/upload logic. No auto-timers.
 */
const ScannerScreen = () => {
    const navigate = useNavigate();
    const [scanning, setScanning] = useState(true);
    const [selectedMerchant, setSelectedMerchant] = useState(null);
    const [uploading, setUploading] = useState(false);

    const merchants = [
      { id: 'm_cafe_central', name: 'Cafe Central', upi: 'cafe@okaxis', bank: 'Axis Bank', icon: '☕' },
      { id: 'm_grocery_mart', name: 'Grocery Mart', upi: 'grocery@okaxis', bank: 'HDFC Bank', icon: '🛒' },
      { id: 'm_pharma_care', name: 'Pharma Care', upi: 'pharma@okaxis', bank: 'SBI', icon: '💊' },
      { id: 'm_shell_fuel', name: 'Shell Fuel Station', upi: 'shell@okaxis', bank: 'ICICI Bank', icon: '⛽' }
    ];

    const handleManualScan = () => {
        // Find a merchant randomly (simulated scan result)
        const random = merchants[Math.floor(Math.random() * merchants.length)];
        identifyMerchant(random);
    };

    const handleUpload = async () => {
        setUploading(true);
        await new Promise(r => setTimeout(r, 1000));
        const random = merchants[Math.floor(Math.random() * merchants.length)];
        setUploading(false);
        identifyMerchant(random);
    };

    const identifyMerchant = (merchant) => {
        setScanning(false);
        setSelectedMerchant(merchant);
    };

    const handleConfirm = () => {
        navigate(`/pay/${selectedMerchant.id}`, { state: { 
            merchantName: selectedMerchant.name,
            merchantUpi: selectedMerchant.upi,
            merchantBank: selectedMerchant.bank
        }});
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
                position: 'fixed', 
                inset: 0, 
                background: '#000', 
                zIndex: 100, 
                color: 'white',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Header */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '24px',
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                zIndex: 10
            }}>
                <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'white' }}>
                    <X size={24} />
                </button>
                <h2 style={{ fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.5px' }}>SCAN TO PAY</h2>
                <div style={{ width: '24px' }} />
            </div>

            {/* Viewport */}
            <div style={{ 
                flex: 1, 
                position: 'relative', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, #222 0%, #000 80%)', zIndex: 1 }} />

                {scanning && (
                    <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                        <div style={{ 
                            width: '260px', 
                            height: '260px', 
                            border: '2px solid rgba(255,255,255,0.2)', 
                            borderRadius: '30px',
                            position: 'relative',
                            marginBottom: '40px'
                        }}>
                            {/* Corners */}
                            <div style={{ position: 'absolute', top: -3, left: -3, width: 40, height: 40, borderTop: '5px solid var(--primary)', borderLeft: '5px solid var(--primary)', borderRadius: '20px 0 0 0' }} />
                            <div style={{ position: 'absolute', top: -3, right: -3, width: 40, height: 40, borderTop: '5px solid var(--primary)', borderRight: '5px solid var(--primary)', borderRadius: '0 20px 0 0' }} />
                            <div style={{ position: 'absolute', bottom: -3, left: -3, width: 40, height: 40, borderBottom: '5px solid var(--primary)', borderLeft: '5px solid var(--primary)', borderRadius: '0 0 0 20px' }} />
                            <div style={{ position: 'absolute', bottom: -3, right: -3, width: 40, height: 40, borderBottom: '5px solid var(--primary)', borderRight: '5px solid var(--primary)', borderRadius: '0 0 20px 0' }} />

                            <motion.div 
                                animate={{ top: ['10%', '90%', '10%'] }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                style={{ position: 'absolute', left: '10%', width: '80%', height: '2px', background: 'var(--primary)', boxShadow: '0 0 15px var(--primary)', zIndex: 3 }}
                            />
                        </div>
                        
                        <button 
                            className="btn btn-primary"
                            onClick={handleManualScan}
                            style={{ padding: '16px 32px', borderRadius: '30px', fontSize: '1rem', fontWeight: 800, gap: '12px' }}
                        >
                            <Camera size={20} /> SCAN NOW
                        </button>
                    </div>
                )}

                <AnimatePresence>
                    {(selectedMerchant || uploading) && (
                        <motion.div 
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            style={{
                                background: 'white', color: 'var(--text)',
                                padding: '32px', borderRadius: '32px',
                                textAlign: 'center', width: '320px',
                                zIndex: 5, boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
                            }}
                        >
                            {uploading ? (
                                <>
                                    <RefreshCw className="spin" size={40} color="var(--primary)" style={{ marginBottom: '16px' }} />
                                    <h3 style={{ fontSize: '1.2rem' }}>Analyzing QR...</h3>
                                </>
                            ) : (
                                <>
                                    <div style={{ background: 'var(--success)', padding: '16px', borderRadius: '50%', display: 'inline-flex', marginBottom: '20px', color: 'white' }}>
                                        <CheckCircle size={32} />
                                    </div>
                                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px' }}>{selectedMerchant.name}</h3>
                                    <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '32px' }}>{selectedMerchant.upi}</p>
                                    <button 
                                        className="btn btn-primary" 
                                        style={{ width: '100%', height: '54px', borderRadius: '18px', fontSize: '1rem' }}
                                        onClick={handleConfirm}
                                    >
                                        Pay Merchant <ArrowRight size={18} />
                                    </button>
                                    <button 
                                        className="btn" 
                                        style={{ width: '100%', marginTop: '8px', color: '#888', fontWeight: 700 }}
                                        onClick={() => { setSelectedMerchant(null); setScanning(true); }}
                                    >
                                        Cancel
                                    </button>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Actions */}
            <div style={{ 
                padding: '32px 24px', 
                background: 'rgba(0,0,0,0.6)',
                display: 'flex', gap: '20px', justifyContent: 'center'
            }}>
                <button 
                    onClick={handleUpload}
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '16px 24px', borderRadius: '20px', color: 'white', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: 700 }}
                >
                    <Upload size={20} /> Upload QR
                </button>
                <div style={{ padding: '14px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                    <Flashlight size={24} />
                </div>
            </div>
        </motion.div>
    );
};

export default ScannerScreen;
