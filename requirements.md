Create a working prototype of Log.Cash, a B2B payment platform for Brazilian import/export companies. This is an internal Logcomex project that adds payment capabilities with dual currency accounts (BRL and USD) backed by MPC wallets.

## Tech Stack
- Next.js 14 with App Router and TypeScript
- Tailwind CSS with shadcn/ui components (MOBILE-FIRST)
- PostgreSQL with Prisma ORM
- NextAuth for authentication
- React Query for data fetching
- Recharts for visualizations
- React Hook Form + Zod for forms
- Mock Fireblocks MPC wallet integration
- Mock external integrations (Bridge.xyz, PIX)

## Design System - Hermes Old Money Orange Palette
```css
/* Add these to tailwind.config.ts */
colors: {
  'hermes-orange': '#F37021',
  'hermes-burnt': '#C35817',
  'hermes-light': '#FF8C42',
  'hermes-cream': '#FFF5EE',
  'hermes-sand': '#FAEBD7',
  'old-money-navy': '#1B2951',
  'old-money-gold': '#D4AF37',
  'old-money-gray': '#6B7280',
  'old-money-sage': '#87936F',
}

Primary actions: Hermes orange gradient
Backgrounds: Cream/sand tones
Text: Navy and gray
Success states: Sage green
Premium elements: Gold accents

Core Features to Implement
1. Database Schema (Prisma)
Create these main models:

Company (cnpj, name, complianceScore, tier, tradingVolume)
PaymentAccount (companyId, tier, brlPixKey, usdAccountNumber, usdRoutingNumber, balanceBRL, balanceUSD, dailyLimitBRL, dailyLimitUSD, mpcWalletId, fireblocksVaultId)
Transaction (accountId, type, currency, amount, status, recipientName, invoiceNumber, shipmentNumber, batchId, fireblocksTransactionId, requiredSignatures: 2, collectedSignatures)
FxConversion (accountId, amountBRL, amountUSD, fxRate, fee, observations, status)
PaymentApproval (transactionId, approverUserId, signatureLevel, mpcSignature, approvedAt)
PaymentBatch (recipientName, currency, totalAmount, paymentCount, status)
User (email, name, companyId, canApprove, mpcKeyShare)
MpcWallet (walletId, vaultId, walletAddress, provider: 'fireblocks', threshold: 2, totalSigners: 3)

2. Mock Fireblocks Integration
Create mock Fireblocks MPC wallet service:
typescript// lib/mock-fireblocks.ts
class MockFireblocks {
  // Create MPC wallet with 2-of-3 threshold
  async createVault(companyId: string) {
    return {
      vaultId: `vault_${generateId()}`,
      walletAddress: `0x${generateAddress()}`,
      threshold: 2,
      maxSigners: 3,
      status: 'ACTIVE'
    };
  }
  
  // Initiate transaction requiring signatures
  async createTransaction(params: {
    vaultId: string,
    amount: string,
    destination: string,
    asset: 'USDC' | 'USDT'
  }) {
    return {
      txId: `fb_tx_${generateId()}`,
      status: 'PENDING_SIGNATURE',
      requiredSignatures: 2,
      collectedSignatures: 0,
      signatureStatus: []
    };
  }
  
  // Add signature to transaction
  async signTransaction(txId: string, userId: string, keyShare: string) {
    return {
      txId,
      signatureAdded: true,
      collectedSignatures: 1,
      status: 'PENDING_SIGNATURE', // or 'READY_TO_BROADCAST' if 2nd sig
    };
  }
  
  // Broadcast transaction after collecting signatures
  async broadcastTransaction(txId: string) {
    return {
      txId,
      blockchainTxHash: `0x${generateHash()}`,
      status: 'SUBMITTED',
      estimatedTime: '2-5 minutes'
    };
  }
}
3. MOBILE-FIRST Pages
/dashboard (Mobile Primary)
┌─────────────────────────┐
│ Log.Cash    Tier: Gold ⭐│
├─────────────────────────┤
│ YOUR BALANCES           │
│ ┌─────────────────────┐ │
│ │ 🇧🇷 R$ 850,000     │ │
│ │ 🇺🇸 $ 125,000      │ │
│ └─────────────────────┘ │
│                         │
│ [+ Add USD]            │
│ [→ Send Payment]       │
│                         │
│ PENDING APPROVALS (3)   │
│ [View All →]           │
│                         │
│ RECENT ACTIVITY        │
│ ← R$50k from Cliente   │
│   1/2 signatures       │
│ → $18k to Shanghai     │
│   2/2 ✓ Complete       │
└─────────────────────────┘

Swipeable cards for accounts
Pull-to-refresh for balances
Bottom sheet for actions
Floating action button for send

/activate (One-Tap Mobile)

Large CTA button
Progress indicator steps
Success animation
Share account details immediately

/add-usd (Mobile Optimized)

Large number pad for amount
Slide-to-confirm for conversion
QR code display for PIX
Copy PIX code button

/send-payment (Step-by-Step Mobile)

Step 1: Select currency (large toggle)
Step 2: Choose recipient (searchable list)
Step 3: Enter amount (number pad)
Step 4: Add details (invoice, shipment)
Step 5: Review & request signatures
Progress bar at top

/approvals (Mobile Signature Flow)

Swipe cards to review payments
Biometric authentication option
"Swipe up to sign" gesture
Batch selection with checkboxes
MPC signature visualization

/wallet (MPC Wallet View)

Fireblocks vault status
Current signers (2 of 3)
Pending blockchain transactions
Gas fee estimates
Stablecoin balances (USDC/USDT)

4. Mobile-First Components
BottomSheet

Slides up for actions
Drag to dismiss
Backdrop blur

SwipeableCard

Swipe actions for approve/reject
Visual feedback on swipe
Spring animations

MobileSignature

Touch ID/Face ID prompt
MPC key share visualization
Signature progress (1/2, 2/2)
Animated checkmarks

AmountPad

Large touch targets
Haptic feedback
Currency switcher
Live conversion display

AccountQR

Full-screen QR display
Brightness boost
Share options
Copy fallback

5. Multi-Signature Flow (ALWAYS REQUIRED)
Every Transaction Requires 2 Signatures
typescript// All payments need multi-sig, regardless of amount
interface Transaction {
  id: string;
  amount: number;
  currency: 'BRL' | 'USD';
  status: 'pending_signature_1' | 'pending_signature_2' | 'broadcasting' | 'complete';
  signatures: {
    signer1: { userId: string; timestamp: Date; mpcKeyShare: string; };
    signer2: { userId: string; timestamp: Date; mpcKeyShare: string; } | null;
  };
  fireblocksData: {
    vaultId: string;
    txId: string;
    broadcastHash?: string;
  };
}
Signature Collection Process

Initiator creates payment (automatic 1st signature)
System notifies available approvers
Second approver reviews and signs
Fireblocks broadcasts transaction
Blockchain confirmation (~2-5 min)

Mobile Signature UX

Push notification for pending signatures
In-app badge on approval tab
Biometric authentication before signing
Show who signed first
Time limit warnings (24h to sign)

6. Mock Data & Integrations
Mock MPC Wallet Setup
Each company gets:

Fireblocks vault with 2-of-3 setup
3 authorized signers (employees)
Ethereum address for USDC/USDT
Mock key shares for each signer

Mock Blockchain Data

Transaction hashes
Gas fee estimates (~$2-5)
Block confirmations
Wallet balances in USDC/USDT

7. Mobile Navigation
Bottom Tab Bar
typescriptconst tabs = [
  { icon: Home, label: 'Home', route: '/dashboard' },
  { icon: Send, label: 'Send', route: '/send-payment' },
  { icon: PenTool, label: 'Sign', route: '/approvals', badge: pendingCount },
  { icon: Wallet, label: 'Wallet', route: '/wallet' },
  { icon: User, label: 'Profile', route: '/profile' }
];
Gesture Navigation

Swipe right to go back
Pull down to refresh
Long press for context menus
Pinch to zoom on QR codes

8. API Routes with MPC
typescript// Multi-sig payment creation
POST /api/payments/create
  - Creates transaction in DB
  - Initiates Fireblocks transaction
  - Collects first signature automatically
  - Returns: { txId, status: 'pending_signature_2' }

// Add second signature
POST /api/payments/sign
  - Validates signer authority
  - Adds signature to Fireblocks
  - If 2nd sig: broadcasts transaction
  - Returns: { status: 'broadcasting', estimatedTime: '2-5 min' }

// Check MPC wallet status
GET /api/wallet/status
  - Returns vault info
  - Current signers
  - Pending transactions
  - Blockchain balances
9. Responsive Breakpoints
css/* Mobile-first approach */
/* Base styles for mobile (320px - 640px) */
/* sm: 640px+ (large phones) */
/* md: 768px+ (tablets) */
/* lg: 1024px+ (desktop) */
/* xl: 1280px+ (wide desktop) */
10. Mobile Performance

Lazy load heavy components
Virtualized lists for transactions
Optimistic UI updates
Skeleton loaders
Image optimization for QR codes
Service worker for offline support

Premium Mobile UI Details
Animations

Smooth page transitions (slide)
Button press effects (scale)
Success haptics and confetti
Loading shimmer in Hermes orange
Stagger animations for lists

Touch Optimizations

Minimum 44px touch targets
Thumb-friendly bottom actions
Swipe gestures for navigation
Pull-to-refresh with custom spinner
Long press for tooltips

Status Bar & Headers

Transparent status bar
Collapsing headers on scroll
Sticky CTAs at bottom
Safe area padding (notch)

File Structure
/app
  /(mobile)
    /dashboard
    /send-payment
    /approvals
    /wallet
    /profile
  /(desktop)
    /dashboard
    /reports
  /api
    /payments
    /wallet
    /fireblocks
/components
  /mobile
    /bottom-sheet
    /swipeable-card
    /amount-pad
    /signature-flow
  /ui (shadcn)
  /wallet
    /mpc-status
    /vault-info
/lib
  /mock-fireblocks
  /mock-data
  /utils
Core User Journey (Mobile)

Open app → See balances immediately
Send payment → Tap send → Choose recipient → Enter amount → Auto-signs as initiator
Get notified → Push notification for pending signature
Approve payment → Open app → Swipe to review → Biometric auth → Sign
Track status → See "Broadcasting" → Get confirmation in 2-5 min
View in wallet → See blockchain transaction → USDC/USDT balance updated

IMPORTANT:

Every flow must work smoothly on iPhone SE (375px) to iPhone Pro Max
All payments require exactly 2 signatures (no exceptions)
Fireblocks integration should feel real (show vault IDs, tx hashes, etc.)
Use Hermes orange as primary accent throughout
Bottom navigation should persist across all main screens
Test swipe gestures and touch interactions thoroughly