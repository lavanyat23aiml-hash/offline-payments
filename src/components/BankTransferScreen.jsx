import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Landmark } from 'lucide-react';

const BankTransferScreen = () => {
    const navigate = useNavigate();
    const [bankName, setBankName] = useState('');
    const [accountNum, setAccountNum] = useState('');
    const [ifsc, setIfsc] = useState('');
    const [branchName, setBranchName] = useState('');

    const handleProceed = () => {
        if (!bankName || !accountNum || !ifsc || !branchName) {
            alert('Please fill all banking details.');
            return;
        }
        
        // Simulating the merchant name as Bank Name + Acc Num
        const name = `${bankName} A/c ${accountNum.slice(-4)}`;
        navigate(`/pay/b_${accountNum}?name=${encodeURIComponent(name)}`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="contact-pay-screen"
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <button onClick={() => navigate(-1)} className="btn" style={{ padding: '8px', background: 'transparent' }}>
                    <ArrowLeft size={24} />
                </button>
                <h2>Bank Transfer</h2>
            </div>

            <div className="card" style={{ marginBottom: '24px', textAlign: 'center', padding: '24px 16px' }}>
                <div style={{ display: 'inline-flex', background: '#fff3e0', padding: '16px', borderRadius: '50%', marginBottom: '12px' }}>
                    <Landmark size={32} color="#ef6c00" />
                </div>
                <h3>Enter Bank Details</h3>
                <p className="text-label" style={{ fontSize: '0.85rem', marginTop: '4px' }}>Send money directly to a bank account.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>Bank Name</label>
                    <input
                        type="text"
                        placeholder="e.g. State Bank of India"
                        style={{ width: '100%', padding: '12px', fontSize: '1rem', borderRadius: '12px', border: '1px solid #ddd' }}
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                    />
                </div>
                <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>Account Number</label>
                    <input
                        type="number"
                        placeholder="Your 10-18 digit account number"
                        style={{ width: '100%', padding: '12px', fontSize: '1rem', borderRadius: '12px', border: '1px solid #ddd' }}
                        value={accountNum}
                        onChange={(e) => setAccountNum(e.target.value)}
                    />
                </div>
                <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>IFSC Code</label>
                    <input
                        type="text"
                        placeholder="e.g. SBIN0001234"
                        style={{ width: '100%', padding: '12px', fontSize: '1rem', borderRadius: '12px', border: '1px solid #ddd', textTransform: 'uppercase' }}
                        value={ifsc}
                        onChange={(e) => setIfsc(e.target.value)}
                    />
                </div>
                <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>Bank Branch</label>
                    <input
                        type="text"
                        placeholder="e.g. MG Road Branch"
                        style={{ width: '100%', padding: '12px', fontSize: '1rem', borderRadius: '12px', border: '1px solid #ddd' }}
                        value={branchName}
                        onChange={(e) => setBranchName(e.target.value)}
                    />
                </div>
            </div>

            <div style={{ padding: '20px 0 0 0' }}>
                <button
                    className="btn btn-primary"
                    style={{ width: '100%', height: '56px', borderRadius: '16px' }}
                    onClick={handleProceed}
                >
                    Proceed to Amount
                </button>
            </div>
        </motion.div>
    );
};

export default BankTransferScreen;
