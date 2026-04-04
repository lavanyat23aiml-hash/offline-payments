/**
 * Fraud Detector
 * Enforces real-world fraud prevention rules for offline payments.
 * Limits increased as per User request to remove "Offline Token Limit".
 */

const TRANSACTION_KEY = 'offline_transactions';
const FRAUD_LOG_KEY = 'fraud_attempts_log';

const RULES = {
  MAX_TX_PER_MINUTE: 10,       // Max 10 transactions per 60 seconds (Increased)
  MAX_OFFLINE_TX_AMOUNT: 10000,// Max ₹10,000 per offline transaction (Increased)
  MAX_ONLINE_TX_AMOUNT: 50000, // Max ₹50,000 per online transaction (Increased)
  DAILY_LIMIT: 50000,          // Max ₹50,000 total offline spend in 24h (Increased)
};

export const FraudDetector = {

  /**
   * Main check — call before processing any payment.
   * Returns { allowed: boolean, reason: string }
   */
  check(amount, type = 'offline', tokenIds = []) {
    // Rule 1: Amount limit
    const maxAmount = type === 'offline' ? RULES.MAX_OFFLINE_TX_AMOUNT : RULES.MAX_ONLINE_TX_AMOUNT;
    if (amount > maxAmount) {
      return {
        allowed: false,
        code: 'LIMIT_EXCEEDED',
        reason: `Maximum ${type === 'offline' ? 'offline' : 'online'} payment is ₹${maxAmount.toLocaleString()}.`,
      };
    }

    // Rule 2: Rate limiting — too many transactions in 60s
    const recentCount = this._getRecentTransactionCount(60 * 1000);
    if (recentCount >= RULES.MAX_TX_PER_MINUTE) {
      this._logAttempt(amount, 'RATE_LIMIT');
      return {
        allowed: false,
        code: 'RATE_LIMIT',
        reason: `Too many transactions in a short time. Please wait a moment.`,
      };
    }

    // Rule 3: Daily limit
    const dailySpent = this.getDailySpent();
    if (dailySpent + amount > RULES.DAILY_LIMIT) {
      this._logAttempt(amount, 'DAILY_LIMIT');
      return {
        allowed: false,
        code: 'DAILY_LIMIT',
        reason: `Daily offline limit of ₹${RULES.DAILY_LIMIT.toLocaleString()} reached.`,
      };
    }

    // Rule 4: Token double-spend prevention
    if (tokenIds && tokenIds.length > 0) {
      const isDuplicate = this._checkDuplicateTokens(tokenIds);
      if (isDuplicate) {
        this._logAttempt(amount, 'DUPLICATE_TOKEN');
        return {
          allowed: false,
          code: 'DUPLICATE_TOKEN',
          reason: `Duplicate token detected. This payment has already been processed.`,
        };
      }
    }

    return { allowed: true, reason: '' };
  },

  /**
   * Get total amount spent in the last 24 hours.
   */
  getDailySpent() {
    const transactions = this._getTransactions();
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return transactions
      .filter(tx => tx.timestamp >= cutoff && tx.type === 'offline' && tx.status !== 'Failed')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
  },

  /**
   * Get remaining daily allowance.
   */
  getDailyRemaining() {
    return Math.max(0, RULES.DAILY_LIMIT - this.getDailySpent());
  },

  getRules() {
    return RULES;
  },

  // ─── Private Helpers ───────────────────────────────────────────────────────

  _getTransactions() {
    try {
      return JSON.parse(localStorage.getItem(TRANSACTION_KEY) || '[]');
    } catch {
      return [];
    }
  },

  _getRecentTransactionCount(windowMs) {
    const cutoff = Date.now() - windowMs;
    return this._getTransactions().filter(tx =>
      tx.timestamp >= cutoff && tx.status !== 'Failed'
    ).length;
  },

  _checkDuplicateTokens(tokenIds) {
    const transactions = this._getTransactions();
    const allTokensUsed = transactions
      .filter(tx => tx.status !== 'Failed')
      .flatMap(tx => tx.tokens || []);
    return tokenIds.some(id => allTokensUsed.includes(id));
  },

  _logAttempt(amount, type) {
    try {
      const logs = JSON.parse(localStorage.getItem(FRAUD_LOG_KEY) || '[]');
      logs.unshift({ timestamp: Date.now(), amount, type });
      if (logs.length > 50) logs.length = 50; // Keep last 50
      localStorage.setItem(FRAUD_LOG_KEY, JSON.stringify(logs));
    } catch {}
  },
};
