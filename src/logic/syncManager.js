/**
 * Sync Manager
 * Manages the pending transaction queue and syncing with the server.
 */

const TRANSACTION_STORAGE_KEY = 'offline_transactions';

export const SyncManager = {
    init() {
        if (this.getAllTransactions().length <= 2) {
            const initialTx = [
                { id: 'TXN_SAMPLE_1', merchantName: 'Big Bazaar', amount: 450, status: 'Completed', timestamp: Date.now() - 86400000, bankName: 'SBI', type: 'offline' },
                { id: 'TXN_SAMPLE_2', merchantName: 'Starbucks', amount: 280, status: 'Completed', timestamp: Date.now() - 3600000, bankName: 'HDFC Bank', type: 'online' },
                { id: 'TXN_SAMPLE_3', merchantName: 'Apollo Pharmacy', amount: 1500, status: 'Completed', timestamp: Date.now() - 172800000, bankName: 'ICICI Bank', type: 'offline' },
                { id: 'TXN_SAMPLE_4', merchantName: 'Shell Petrol', amount: 2500, status: 'Completed', timestamp: Date.now() - 259200000, bankName: 'Axis Bank', type: 'online' },
                { id: 'TXN_SAMPLE_5', merchantName: 'Burger King', amount: 560, status: 'Completed', timestamp: Date.now() - 10800000, bankName: 'SBI', type: 'offline' }
            ];
            // Only set if really empty to avoid overwriting user experiments
            if (this.getAllTransactions().length === 0) {
               localStorage.setItem(TRANSACTION_STORAGE_KEY, JSON.stringify(initialTx));
            }
        }
    },
    /**
     * Adds a transaction to the local pending queue.
     */
    addTransaction(transaction) {
        const transactions = this.getAllTransactions();
        const txId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
        const newTx = {
            ...transaction,
            id: txId,
            timestamp: Date.now(),
            status: 'Pending',
            type: transaction.type || 'offline', // Default to offline in this simulator
            bankName: transaction.bankName || 'HDFC Bank' // Default mock bank
        };
        transactions.unshift(newTx);
        localStorage.setItem(TRANSACTION_STORAGE_KEY, JSON.stringify(transactions));
        return newTx;
    },

    getAllTransactions() {
        const data = localStorage.getItem(TRANSACTION_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    /**
     * Syncs pending transactions with the server.
     * Simulates network delay and server response.
     */
    async syncTransactions() {
        const transactions = this.getAllTransactions();
        const pending = transactions.filter(tx => tx.status === 'Pending');

        if (pending.length === 0) return 0;

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mark as completed
        const updated = transactions.map(tx => {
            if (tx.status === 'Pending') {
                return { ...tx, status: 'Completed' };
            }
            return tx;
        });

        localStorage.setItem(TRANSACTION_STORAGE_KEY, JSON.stringify(updated));
        return pending.length;
    },

    clearHistory() {
        localStorage.removeItem(TRANSACTION_STORAGE_KEY);
    }
};
