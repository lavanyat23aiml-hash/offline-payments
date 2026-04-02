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

// UI Components
import { Wifi, WifiOff, RefreshCw, User } from 'lucide-react';

const AppContent = () => {
  const navigate = useNavigate();
  const { isOnline, toggleConnectivity } = useConnectivity();
  const [balance, setBalance] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Seed initial balance and history if empty
    TokenManager.init();
    SyncManager.init();
    setBalance(TokenManager.getAvailableBalance());

    // Check if user is "signed in" to a bank
    const isAuth = localStorage.getItem('upi_auth');
    if (!isAuth && location.pathname !== '/onboarding') {
      navigate('/onboarding');
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    // If online, auto-sync
    if (isOnline) {
      handleSync();
    }
  }, [isOnline]);

  const handleSync = async () => {
    setSyncing(true);
    const syncedCount = await SyncManager.syncTransactions();
    if (syncedCount > 0) {
      setBalance(TokenManager.getAvailableBalance());
    }
    setSyncing(false);
  };

  const handlePreload = async () => {
    if (!isOnline) return alert('Go online to preload tokens!');
    const currentBalance = TokenManager.getAvailableBalance();
    if (currentBalance >= 1000) {
      return alert('You have reached the maximum offline limit of ₹1,000.');
    }
    const needed = 1000 - currentBalance;
    await TokenManager.preloadTokens([needed]);
    setBalance(TokenManager.getAvailableBalance());
  };

  const [bridgeStatus, setBridgeStatus] = useState('checking');

  useEffect(() => {
    const checkBridge = () => {
      fetch('http://127.0.0.1:3001/status')
        .then(res => res.json())
        .then(() => setBridgeStatus('connected'))
        .catch(() => setBridgeStatus('disconnected'));
    };
    checkBridge();
    const interval = setInterval(checkBridge, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="auth-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.8 }}>
             <div style={{
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: (!isOnline || bridgeStatus === 'disconnected') ? '#ff5252' : (bridgeStatus === 'connected' ? '#00c853' : '#ffab00'),
                boxShadow: (!isOnline || bridgeStatus === 'disconnected') ? 'none' : (bridgeStatus === 'connected' ? '0 0 8px #00c853' : 'none')
             }} />
             <span style={{ fontSize: '0.65rem', color: 'white', fontWeight: 700, letterSpacing: '0.5px' }}>
                HARDWARE BRIDGE: {!isOnline ? 'DISCONNECTED' : bridgeStatus.toUpperCase()}
             </span>
          </div>
          <div className="time">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
        <div className="status-bar" style={{ paddingTop: 0 }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div
              className={`connectivity-badge ${!isOnline ? 'offline' : ''}`}
              onClick={toggleConnectivity}
            >
              {!isOnline ? <WifiOff size={16} /> : <Wifi size={16} />}
              <span>{!isOnline ? 'Go Online' : 'Go Offline'}</span>
            </div>
            <div
              style={{ background: 'rgba(255,255,255,0.2)', padding: '6px', borderRadius: '50%', cursor: 'pointer' }}
              onClick={() => navigate('/profile')}
            >
              <User size={18} color="white" />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p className="text-label" style={{ color: 'rgba(255,255,255,0.7)' }}>Wallet Balance</p>
            <h1 style={{ fontSize: '2rem' }}>₹{balance.toLocaleString()}</h1>
          </div>
          {isOnline && (
            <button
              onClick={handleSync}
              className="btn"
              style={{ background: 'rgba(255,255,255,0.1)', padding: '10px' }}
              disabled={syncing}
            >
              <RefreshCw className={syncing ? 'spin' : ''} size={20} color="white" />
              {syncing && <span style={{ color: 'white', marginLeft: '8px', fontSize: '0.8rem' }}>Syncing</span>}
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomeScreen balance={balance} handlePreload={handlePreload} isOnline={isOnline} />} />
            <Route path="/scan" element={<ScannerScreen />} />
            <Route path="/onboarding" element={<OnboardingScreen />} />
            <Route path="/transfer" element={<ContactPayScreen />} />
            <Route path="/bank-transfer" element={<BankTransferScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/pin" element={<PinScreen />} />
            <Route path="/tx-detail" element={<TransactionDetailScreen />} />
            <Route path="/pay/:merchantId" element={<AmountScreen updateBalance={() => setBalance(TokenManager.getAvailableBalance())} />} />
            <Route path="/success" element={<SuccessScreen />} />
            <Route path="/history" element={<HistoryScreen />} />
          </Routes>
        </AnimatePresence>
      </div>

      {!isOnline && (
        <div style={{
          background: '#fff3cd',
          color: '#856404',
          padding: '8px',
          textAlign: 'center',
          fontSize: '0.8rem',
          fontWeight: 700,
          borderTop: '1px solid #ffeeba',
          zIndex: 1000
        }}>
          ⚠️ SIMULATED OFFLINE MODE ACTIVE
        </div>
      )}

      <style>{`
        .spin { animation: rotate 1s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
