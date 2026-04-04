import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Screens
import HomeScreen from './components/HomeScreen';
import ScannerScreen from './components/ScannerScreen';
import AmountScreen from './components/AmountScreen';
import SuccessScreen from './components/SuccessScreen';
import HistoryScreen from './components/HistoryScreen';
import ProfileScreen from './components/ProfileScreen';
import PinScreen from './components/PinScreen';
import ContactPayScreen from './components/ContactPayScreen';
import OnboardingScreen from './components/BankSignScreen';
import TransactionDetailScreen from './components/TransactionDetailScreen';
import BankTransferScreen from './components/BankTransferScreen';

// Hooks & Logic
import { useConnectivity } from './hooks/useConnectivity';
import { useUser } from './hooks/useUser';
import { TokenManager } from './logic/tokenManager';
import { SyncManager } from './logic/syncManager';

// UI
import { Wifi, WifiOff, RefreshCw, User, Wallet, Zap, ShieldCheck } from 'lucide-react';

const AppContent = () => {
  const navigate = useNavigate();
  const { isOnline } = useConnectivity();
  const { validatePin } = useUser();
  
  const [walletBalance, setWalletBalance] = useState(0);
  const [offlineBalance, setOfflineBalance] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [syncStats, setSyncStats] = useState({ pending: 0, completed: 0, failed: 0, total: 0 });
  const [bridgeStatus, setBridgeStatus] = useState('checking');
  const location = useLocation();

  const refreshBalances = () => {
    setWalletBalance(SyncManager.getWalletBalance());
    setOfflineBalance(TokenManager.getAvailableBalance());
    setSyncStats(SyncManager.getStats());
  };

  // Init data & auth guard
  useEffect(() => {
    TokenManager.init();
    SyncManager.init();
    refreshBalances();

    const isAuth = localStorage.getItem('upi_auth');
    if (!isAuth && location.pathname !== '/onboarding') {
      navigate('/onboarding');
    }
  }, [location.pathname, navigate]);

  // Handle system online/offline changes automatically
  useEffect(() => {
    if (isOnline) {
      handleSync();
    } else {
      setSyncStats(SyncManager.getStats());
    }
  }, [isOnline]);

  // Bridge status check heartbeat
  useEffect(() => {
    const checkBridge = () => {
      fetch('http://127.0.0.1:3001/status')
        .then(res => res.json())
        .then(() => setBridgeStatus('connected'))
        .catch(() => setBridgeStatus('disconnected'));
    };
    checkBridge();
    const interval = setInterval(checkBridge, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    if (!isOnline) return;
    setSyncing(true);
    await SyncManager.syncTransactions();
    refreshBalances();
    setSyncing(false);
  };

  const handlePreload = async () => {
    if (!isOnline) return alert('Go online to transfer funds to offline tokens!');
    
    // 1. Ask for amount
    const amountStr = prompt('Enter amount to transfer to offline tokens (Max ₹1,000):');
    if (!amountStr) return;
    const amount = parseInt(amountStr);
    
    if (isNaN(amount) || amount <= 0) return alert('Please enter a valid amount.');
    
    // 2. Initial Limit Check (within 1000)
    if (amount > 1000) {
      return alert('Maximum transfer limit to offline tokens is ₹1,000 per request.');
    }

    // 3. Wallet Balance Check
    const currentWallet = SyncManager.getWalletBalance();
    if (amount > currentWallet) {
      return alert(`Wallet balance is low (Current: ₹${currentWallet.toLocaleString()}).`);
    }
    
    // 4. Authorization
    const pin = prompt('Enter UPI PIN to authorize transfer:');
    if (!pin) return;
    if (!validatePin(pin)) return alert('Incorrect PIN. Authorization failed.');

    try {
        // Transfer logic: Deduct from Wallet, Add to Tokens
        SyncManager.updateWalletBalance(-amount);
        const user = JSON.parse(localStorage.getItem('upi_user') || '{}');
        const userId = user.upiId || 'demo_user';
        await TokenManager.preloadTokens(userId, amount);
        
        refreshBalances();
        alert(`Successfully transferred ₹${amount} to offline tokens.`);
    } catch (err) {
        alert(err.message);
    }
  };

  const bridgeDot = (bridgeStatus === 'disconnected') ? '#ff5252' : '#00c853';
  const bridgeLabel = bridgeStatus === 'connected' ? 'HARDWARE BRIDGE: ACTIVE' : 'HARDWARE BRIDGE: DISCONNECTED';

  return (
    <>
      <div className="auth-header" style={{ paddingBottom: '10px' }}>
        {/* Hardware Status Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.9 }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: bridgeDot, boxShadow: bridgeStatus === 'connected' ? `0 0 8px ${bridgeDot}` : 'none' }} />
            <span style={{ fontSize: '0.6rem', color: 'white', fontWeight: 800, letterSpacing: '0.5px' }}>
              {bridgeLabel}
            </span>
          </div>
          <div className="time">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>

        {/* Connectivity Automatic Indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div className={`connectivity-badge ${!isOnline ? 'offline' : ''}`} style={{ cursor: 'default' }}>
                {!isOnline ? <WifiOff size={14} /> : <Wifi size={14} />}
                <span>{!isOnline ? 'System Offline' : 'System Online'}</span>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
                 {isOnline && (
                    <button onClick={handleSync} disabled={syncing} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <RefreshCw size={16} className={syncing ? 'spin' : ''} />
                    </button>
                 )}
                 <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px', borderRadius: '50%', cursor: 'pointer' }} onClick={() => navigate('/profile')}>
                    <User size={18} color="white" />
                 </div>
            </div>
        </div>

        {/* Dual Balance View */}
        <div style={{ display: 'flex', gap: '12px' }}>
            {/* Wallet Balance (Online) */}
            <div style={{ flex: 1, background: 'rgba(24, 11, 46, 0.3)', padding: '12px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.65rem', fontWeight: 700, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Wallet size={10} /> WALLET BALANCE
                </p>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>₹{walletBalance.toLocaleString()}</h2>
            </div>
            
            {/* Offline Token Balance */}
            <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.1)', padding: '12px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.65rem', fontWeight: 700, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Zap size={10} fill="white" /> OFFLINE TOKENS
                </p>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>₹{offlineBalance.toLocaleString()}</h2>
            </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomeScreen balance={offlineBalance} walletBalance={walletBalance} handlePreload={handlePreload} isOnline={isOnline} syncStats={syncStats} refresh={refreshBalances} />} />
            <Route path="/scan" element={<ScannerScreen />} />
            <Route path="/onboarding" element={<OnboardingScreen />} />
            <Route path="/transfer" element={<ContactPayScreen />} />
            <Route path="/bank-transfer" element={<BankTransferScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/pin" element={<PinScreen />} />
            <Route path="/tx-detail" element={<TransactionDetailScreen />} />
            <Route path="/pay/:merchantId" element={<AmountScreen updateBalance={refreshBalances} />} />
            <Route path="/success" element={<SuccessScreen />} />
            <Route path="/history" element={<HistoryScreen />} />
          </Routes>
        </AnimatePresence>
      </div>

      {/* Persistence Notice */}
      {!isOnline && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '10px 16px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 800, borderTop: '1px solid #ffcdd2', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Zap size={14} fill="#c62828" /> SYSTEM OFFLINE: USING RESERVED TOKENS
        </div>
      )}
    </>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
