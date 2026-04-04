import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    ArrowLeft, 
    Landmark, 
    ShieldCheck, 
    CheckCircle,
    Info,
    Search
} from 'lucide-react';

/**
 * BankTransferScreen
 * Direct bank entry form for offline payments.
 */
const BankTransferScreen = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        accountNo: '',
        ifsc: '',
        name: '',
        branch: ''
    });

    const handleProceed = () => {
        // Navigate to payment amount screen
        navigate('/pay/bank_manual', { state: { 
            merchantName: form.name || 'Recipient User',
            merchantUpi: `acc_${form.accountNo.slice(-4)}@upi`,
            merchantBank: form.branch || 'Direct Bank'
        }});
    };

    const isFormValid = form.accountNo.length >= 10 && form.ifsc.length >= 11 && form.name.length > 2;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ paddingBottom: '32px' }}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <button onClick={() => navigate(-1)} className="btn" style={{ padding: '8px', background: 'transparent' }}>
                    <ArrowLeft size={24} />
                </button>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Transfer to Bank</h2>
                    <p style={{ fontSize: '0.75rem', color: '#888' }}>Direct A/C Transfer via Offline Token</p>
                </div>
            </div>

            {/* Verification Notice */}
            <div style={{ background: '#f5f0ff', padding: '16px', borderRadius: '18px', marginBottom: '32px', display: 'flex', gap: '14px', alignItems: 'center', border: '1px solid #e1d5ff' }}>
                <div style={{ background: 'var(--primary)', padding: '10px', borderRadius: '12px', color: 'white' }}>
                    <ShieldCheck size={20} />
                </div>
                <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '2px' }}>Encrypted Settlement</h4>
                    <p style={{ fontSize: '0.7rem', color: '#666', lineHeight: 1.4 }}>
                        Tokens are pre-authorized for bank transfers up to ₹500.
                    </p>
                </div>
            </div>

            {/* Form Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
                <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#aaa', marginLeft: '12px', marginBottom: '8px', display: 'block' }}>ACCOUNT NUMBER</label>
                    <input 
                        type="tel" 
                        placeholder="XXXX XXXX XXXX" 
                        value={form.accountNo}
                        onChange={(e) => setForm({...form, accountNo: e.target.value})}
                        style={{ width: '100%', height: '58px', borderRadius: '16px', border: '1.5px solid #eee', padding: '0 20px', fontSize: '1rem', fontWeight: 600, outline: 'none' }}
                    />
                </div>
                <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#aaa', marginLeft: '12px', marginBottom: '8px', display: 'block' }}>IFSC CODE</label>
                    <div style={{ position: 'relative' }}>
                        <input 
                            type="text" 
                            placeholder="SBIN0001234" 
                            value={form.ifsc}
                            onChange={(e) => setForm({...form, ifsc: e.target.value.toUpperCase()})}
                            style={{ width: '100%', height: '58px', borderRadius: '16px', border: '1.5px solid #eee', padding: '0 20px', fontSize: '1rem', fontWeight: 600, outline: 'none' }}
                        />
                        <button style={{ position: 'absolute', right: '12px', top: '12px', background: '#f0f0f0', border: 'none', padding: '8px 12px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary)' }}>VERIFY</button>
                    </div>
                </div>
                <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#aaa', marginLeft: '12px', marginBottom: '8px', display: 'block' }}>RECIPIENT NAME</label>
                    <input 
                        type="text" 
                        placeholder="Full name as per bank records" 
                        value={form.name}
                        onChange={(e) => setForm({...form, name: e.target.value})}
                        style={{ width: '100%', height: '58px', borderRadius: '16px', border: '1.5px solid #eee', padding: '0 20px', fontSize: '1rem', fontWeight: 600, outline: 'none' }}
                    />
                </div>
            </div>

            <button 
                className="btn btn-primary" 
                style={{ width: '100%', height: '60px', borderRadius: '20px', fontSize: '1.1rem', gap: '10px' }}
                disabled={!isFormValid}
                onClick={handleProceed}
            >
                Proceed Transfer <Landmark size={20} />
            </button>

            <div style={{ textAlign: 'center', marginTop: '32px', opacity: 0.4 }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <CheckCircle size={14} /> PCI-DSS Compliant Local Vault
                </p>
            </div>
        </motion.div>
    );
};

export default BankTransferScreen;
