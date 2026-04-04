# Software Requirements Specification (SRS)
## Project: Offline-First UPI Payment Simulator ("Gold Build")

---

## 1. Introduction
### 1.1 Purpose
This document specifies the software requirements for the **Offline UPI Payment Simulator**, a high-fidelity proof-of-concept for offline bank-authorized digital payments. It covers the dual-balance management, automatic connectivity synchronization, and token-based settlement logic.

### 1.2 Scope
The system simulates a mobile UPI application capable of transitioning seamlessly between Online and Offline environments. It uses a hardware bridge to control physical Wi-Fi adapters and implements a local "Token Reserve" system funded by a central "Online Wallet."

### 1.3 Definitions & Acronyms
- **UPI**: Unified Payments Interface.
- **Offline Token**: A pre-authorized digital asset representing a specific monetary value, signed by a bank (simulated).
- **Wallet Balance**: The central online fund source (Simulated as ₹10,000).
- **Bridge Server**: A local Node.js server used to interface with system hardware.
- **Token Splitting**: The logic used to break a larger token into a payment and a "Change Token."

---

## 2. Overall Description
### 2.1 Product Perspective
The application consists of a **React Frontend**, a **Node.js Hardware Bridge**, and **PowerShell automation scripts**. It operates strictly in a local-first environment, with a heavy emphasis on "Gold Build" aesthetics (Premium UI/UX).

### 2.2 System Functions
1. **Automatic Connectivity**: Detects system internet status and updates application state (Online/Offline) without user intervention.
2. **Dual-Balance Architecture**: Separates Online Wallet funds from Offline Token reserves.
3. **Wallet-to-Token Transfer**: Allows users to "Authorize" funds from the Wallet to be converted into Offline Tokens.
4. **Offline Payment Execution**: Conducts payments in Airplane/No-Wi-Fi mode using pre-authorized tokens.
5. **Token Splitting (Change Tokens)**: Automatically generates "Change" tokens if a pre-authorized token is larger than the payment amount.
6. **Immutable Transaction History**: Maintains a non-deletable record of all payments with clear Online/Offline indicators.

### 2.3 User Classes & Characteristics
- **Demo User**: Requires a seamless experience with zero lag, clear status indicators (Green/Red), and realistic interaction flows (manual QR scanning).

### 2.4 Design & Implementation Constraints
- **Persistence**: All data must persist in `localStorage` across page refreshes.
- **Hardware Integration**: Requires a local Node server on port 3001 with Administrator privileges.

---

## 3. Functional Requirements
### 3.1 Connectivity Synchronization (SRS-F01)
- **Automatic Detection**: The system MUST use `navigator.onLine` and browser events (`online`, `offline`) to update the app status globally.
- **Visual Feedback**: Dashboard MUST show **GREEN** for Online and **RED** for Offline.
- **Hardware Bridge**: On status change, the system MUST call the Bridge API (`/toggle-hotspot`) to physically toggle the Wi-Fi adapter.

### 3.2 Dual Balance Management (SRS-F02)
- **Initial State**: The system MUST start with **₹10,000 in the Wallet** and **₹0 in Offline Tokens**.
- **Wallet Fund Source**: Online transactions MUST deduct directly from the Wallet.
- **Token Fund Source**: Offline transactions MUST deduct directly from the Token Reserve.
- **Balance Refinement**: Wallet balance is ONLY primary. Offline tokens are secondary assets.

### 3.3 Wallet-to-Token Transfer (SRS-F03)
- **User Prompt**: The user MUST enter an amount to transfer from Wallet to Tokens.
- **Load Limit**: Authorization MUST be restricted to **₹1,000** per request.
- **Validation**: MUST check if `amount <= 1000` AND `amount <= walletBalance`.
- **Deduction**: On success, the amount MUST be deducted from the Wallet and added to the Token Reserve.
- **PIN Authorization**: Transfers MUST require the user's 4-digit UPI PIN.

### 3.4 Token Splitting / Change (SRS-F04)
- **Requirement**: If an offline payment amount is less than the smallest available single token, the system MUST "split" the token.
- **Logic**:
  - Consume the larger token (mark as `used`).
  - Create a **new "Change Token"** for the remainder (`TokenAmount - PaymentAmount`).
  - Inherit the original token's expiry date.

### 3.5 QR Merchant Interaction (SRS-F05)
- **Manual Control**: The scanner MUST NOT auto-process. It MUST require manual **"Scan Now"** or **"Upload QR"** interaction.
- **Pre-Payment Confirmation**: Users MUST see merchant details (UPI ID, Bank Name) BEFORE entering the payment amount.

---

## 4. Non-Functional Requirements
### 4.1 Security
- **Local PIN Entry**: 4-digit PIN required for all transfers and payments.
- **Fraud Detection**: 
  - Max ₹10,000 single transaction.
  - Rate limiting (Max 10 TX per minute).
  - Daily spend tracking.

### 4.2 Usability (Aesthetics)
- **Premium Design**: Implementation MUST follow modern web design standards (glassmorphism, vibrant colors, curated Google Fonts).
- **Responsiveness**: Smooth framer-motion transitions between screens.

### 4.3 Reliability
- **Sync Recovery**: Transactions conducted offline MUST be stored with a "Pending" status and auto-sync to "Completed" when connectivity is restored.
- **Immutability**: Users MUST NOT have the ability to delete history items or reset balances once initialized.

---

## 5. System Architecture (Technical Mapping)
- **Store**: `localStorage` (Items: `upi_wallet_balance`, `offline_payment_tokens`, `offline_transactions`).
- **Hooks**: `useConnectivity.js` (State sync).
- **Logic**: `syncManager.js` (TX lifecycle), `tokenManager.js` (Token lifecycle), `fraudDetector.js` (Safety rules).
- **External**: `bridge.js` (Hardware server).
