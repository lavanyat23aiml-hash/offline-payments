/**
 * Sync Manager — Full transaction lifecycle
 * IndexedDB simulation via localStorage.
 * Transactions are IMMUTABLE.
 */
const TX_KEY = 'offline_transactions';
const QUEUE_KEY = 'offline_sync_queue';
const WALLET_KEY = 'upi_wallet_balance';
const INITIAL_WALLET = 10000;

export const SyncManager = {
  init() {
    // Initial State: Wallet = ₹10,000
    if (localStorage.getItem(WALLET_KEY) === null) {
      localStorage.setItem(WALLET_KEY, JSON.stringify(INITIAL_WALLET));
    }
    
    // Transactions history starts empty.
    if (!localStorage.getItem(TX_KEY)) {
      localStorage.setItem(TX_KEY, JSON.stringify([]));
    }
  },

  getWalletBalance() {
    return Number(localStorage.getItem(WALLET_KEY) || INITIAL_WALLET);
  },

  updateWalletBalance(delta) {
    const current = this.getWalletBalance();
    localStorage.setItem(WALLET_KEY, JSON.stringify(current + delta));
  },

  addTransaction(tx) {
    const all = this.getAllTransactions();
    const id = `TXN${Date.now()}${Math.floor(Math.random() * 9000 + 1000)}`;
    const now = Date.now();
    const amountNum = Number(tx.amount);

    // Online Transaction logic: Deduct from Wallet
    if (tx.type === 'online') {
      if (this.getWalletBalance() < amountNum) {
        throw new Error('Insufficient wallet balance for online payment.');
      }
      this.updateWalletBalance(-amountNum);
    }

    const newTx = {
      id, merchantId: tx.merchantId || 'm_unknown', merchantName: tx.merchantName || 'Merchant',
      amount: amountNum, upi: tx.upi || `${tx.merchantId}@okupi`,
      bankName: tx.bankName || 'HDFC Bank', type: tx.type || 'offline',
      tokens: tx.tokens || [], status: tx.type === 'online' ? 'Completed' : 'Pending', 
      retries: 0, timestamp: now,
      lifecycleLog: tx.type === 'online' 
        ? [{ status: 'Created', ts: now - 5 }, { status: 'Completed', ts: now }]
        : [{ status: 'Created', ts: now - 5 }, { status: 'Pending', ts: now }],
    };

    all.unshift(newTx);
    localStorage.setItem(TX_KEY, JSON.stringify(all));
    if (tx.type === 'offline') this._addQueue(id);
    return newTx;
  },

  getAllTransactions() {
    try { return JSON.parse(localStorage.getItem(TX_KEY) || '[]'); } catch { return []; }
  },

  getTransactionById(id) { return this.getAllTransactions().find(t => t.id === id) || null; },

  getStats() {
    const all = this.getAllTransactions();
    return {
      total: all.length,
      pending: all.filter(t => t.status === 'Pending').length,
      completed: all.filter(t => t.status === 'Completed').length,
      failed: all.filter(t => t.status === 'Failed').length,
    };
  },

  async syncTransactions() {
    const all = this.getAllTransactions();
    const pending = all.filter(t => t.status === 'Pending');
    if (!pending.length) return 0;

    await new Promise(r => setTimeout(r, 1500));
    const seen = new Set();
    let count = 0;

    const updated = all.map(tx => {
      if (tx.status !== 'Pending') return tx;
      const now = Date.now();
      const dup = (tx.tokens || []).some(tid => seen.has(tid));
      if (dup) {
        return { ...tx, status: 'Failed', failReason: 'Duplicate token detected.',
          lifecycleLog: [...(tx.lifecycleLog || []), { status: 'Synced', ts: now }, { status: 'Failed', ts: now + 10 }] };
      }
      (tx.tokens || []).forEach(tid => seen.add(tid));
      count++;
      return { ...tx, status: 'Completed',
        lifecycleLog: [...(tx.lifecycleLog || []), { status: 'Synced', ts: now }, { status: 'Completed', ts: now + 200 }] };
    });

    localStorage.setItem(TX_KEY, JSON.stringify(updated));
    localStorage.removeItem(QUEUE_KEY);
    return count;
  },

  async retryTransaction(id) {
    const all = this.getAllTransactions();
    const i = all.findIndex(t => t.id === id);
    if (i === -1 || all[i].status !== 'Failed' || all[i].retries >= 3) return false;
    all[i] = { ...all[i], status: 'Pending', retries: all[i].retries + 1 };
    localStorage.setItem(TX_KEY, JSON.stringify(all));
    this._addQueue(id);
    return true;
  },

  // RESET removed to ensure IMMUTABILITY.
  
  _addQueue(id) {
    try {
      const q = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
      if (!q.includes(id)) q.push(id);
      localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
    } catch {}
  },
};
