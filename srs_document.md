# Software Requirements Specification (SRS)
## Project: Offline-First UPI Payment Simulator ("Gold Build")

---

## 1. Introduction
### 1.1 Purpose
This document specifies the software requirements for the **Offline UPI Payment Simulator**, a high-fidelity proof-of-concept for offline bank-authorized digital payments. It covers the dual-balance management, automatic connectivity synchronization, simulated bank authorities, internationalization (i18n), and a context-aware Secure AI Agent.

### 1.2 Scope
The system simulates a mobile UPI application capable of transitioning seamlessly between Online and Offline environments. It uses a hardware bridge to control physical Wi-Fi adapters, implements a local "Token Reserve" system funded by a central "Online Wallet", dynamically serves multiple languages, and leverages advanced NLP logic for non-intrusive voice/text assistance.

### 1.3 Definitions & Acronyms
- **UPI**: Unified Payments Interface.
- **Offline Token**: A pre-authorized digital asset representing a specific monetary value, cryptographically signed by a Simulated Bank.
- **Wallet Balance**: The central online fund source (Simulated as ₹10,000).
- **Token Splitting**: The logic used to break a larger token into a payment and a "Change Token."
- **NLP**: Natural Language Processing for intent and entity extraction.
- **PII**: Personally Identifiable Information (Mobile numbers, UPI IDs, Account numbers).

---

## 2. Overall Description
### 2.1 Product Perspective
The application consists of a **React Frontend**, a local **Node.js Hardware Bridge**, and dynamic structural logic. It operates securely in a local-first browser environment using memory and `localStorage` to simulate a robust fin-tech environment.

### 2.2 Core System Functions
1. **Hardware Connectivity Synchronization**: Detects system internet status and toggles physical Wi-Fi adapters (`netsh wlan`) to enforce offline conditions.
2. **Dual-Balance Architecture**: Separates Online Wallet funds from Offline Token reserves, tracking deductions contextually.
3. **Simulated Bank Authority**: Emulates a real-world central bank that cryptographically issues, signs, and authorizes Offline Tokens.
4. **Token Splitting (Change Tokens)**: Automatically generates "Change" tokens if a pre-authorized token is larger than the payment amount.
5. **Multi-Language Support (i18n)**: Seamless language localization serving English, Hindi, Kannada, and Telugu dynamically without reloads via React Context.
6. **Secure AI Interface**: Context-aware Chatbot for querying History, routing Navigation, and prepping Payment intents via Interactive Forms or Voice (when online boundaries allow).

### 2.3 User Classes & Characteristics
- **Demo User**: Requires a seamless experience, minimal latency, clear feedback on network states (Green/Red alerts), and robust accessibility tools (multi-language and voice assistance).

### 2.4 Design & Implementation Constraints
- **Isolation**: The AI Assistant MUST operate as a sandboxed UX wrapper. It cannot perform monetary transactions autonomously; it must defer to `PinScreen`.
- **Persistence**: Data must persist locally; the system requires no external database.

---

## 3. Functional Requirements

### 3.1 Network & Dual Balance (SRS-F01)
- **Automatic Detection**: Evaluates `navigator.onLine` and maps states globally to adjust UX and logical bounds.
- **Primary Deduction**: Online transactions MUST deduct dynamically from Wallet `SyncManager`.
- **Secondary Deduction**: Offline transactions MUST consume signed tokens via `TokenManager`.

### 3.2 Simulated Bank Authorization (SRS-F02)
- **Fund Locking**: Moving Wallet funds into Offline Tokens MUST deduct the primary balance.
- **Signatures**: The Bank MUST append cryptographic guarantees (via Web Crypto API) ensuring the token structure is tamper-proof natively.

### 3.3 Dynamic Internationalization (SRS-F03)
- **Translational Coverage**: High-visibility strings across `HomeScreen`, `PinScreen`, `SuccessScreen`, and AI models MUST be dynamically evaluated against a centralized `translations.js` map.
- **Session Continuity**: Language changes MUST be persisted and applied instantaneously.

### 3.4 Secure AI Assistant Engine (SRS-F04)
- **NLP Regex Extraction**: Text ingestion MUST extract target IDs separately (distinguishing 10-digit mobile numbers from `user@bank` UPI formats) and isolate integers specifically attached to currency-phrases.
- **Guarded GUI Generation**: AI parses payment intents and creates an interactive UI payload (The Confirmation Card) requesting User confirmation before bridging out to PIN validation.
- **Voice Boundary Check**: If Web Speech API is invoked while `netsh` bridge or `navigator` throws offline status, it MUST capture the error softly to prevent system crash, displaying an offline-voice-degradation alert.
- **PII Masking**: Chat logs MUST sanitize output records (`9876543210 -> ******3210` and `user@bank -> us****@bank`).

### 3.5 QR & Payment Logic (SRS-F05)
- **Manual Control**: QR Scanner requires manual interaction to initiate payment flow.
- **State Inference**: Success Receipts MUST log whether the transaction completed via Bank APIs (Online) or Cryptographic Token deductions (Offline) prominently.

---

## 4. Non-Functional Requirements
### 4.1 Security
- **Local PIN Entry**: Required physical confirmation logic for both Online Wallet deductions and Offline Token consumption.
- **Fraud Engine Boundary**: NLP Engine flags unusually high transfers (> ₹5000) or Duplicate amounts within a 5-minute window directly within the Chat Interface before processing.

### 4.2 Usability (Aesthetics)
- **Premium Design**: Heavy glassmorphism, responsive shadow scaling, contextual gradients, and dynamic FAB (Floating Action Block) states to enforce "Gold Build" fin-tech standards.

### 4.3 Reliability & Immutability
- **Auto-Sync Queuing**: Offline payments MUST route to `Pending` queues, auto-resolving to `Completed` once the bridge restores Wi-Fi connectivity seamlessly.
- Transactions are immutable; deletion capabilities explicitly scrubbed.

---

## 5. Technical Mapping
- **App Wrapper**: Vite / React.js / Framer Motion
- **Persistence Layer**: `localStorage` -> `upi_wallet_balance`, `app_language`, `offline_transactions`
- **NLP / Brain**: `logic/nlpEngine.js`, native regex, `Web Speech API`
- **Bank Operations**: `logic/bankServer.js`, `logic/tokenManager.js`
- **Network Hooks**: `hooks/useConnectivity.js`, Server: `bridge.js` (PowerShell API)
