# Log.Cash - B2B Payment Platform

A modern, mobile-first payment platform for Brazilian import/export companies, featuring dual currency accounts (BRL/USD) backed by MPC (Multi-Party Computation) wallets.

## 🚀 Features

### Core Functionality
- **Dual Currency Accounts**: Native support for BRL and USD
- **MPC Multi-Signature**: 2-of-3 signature requirement for all payments
- **Mobile-First Design**: Optimized for iPhone SE to iPhone Pro Max
- **Real-time Dashboard**: Live balance updates and transaction status
- **Swipeable Approval Interface**: Intuitive gesture-based transaction approval

### Security & Compliance
- **Fireblocks Integration**: Mock MPC wallet service with threshold signatures
- **NextAuth Authentication**: Secure session management
- **Biometric Authentication**: Touch ID/Face ID for payment signatures
- **Tier-based Access Control**: Bronze, Silver, Gold, Platinum tiers

### Payment Flows
- **Multi-step Payment Creation**: Guided currency → recipient → amount → details → review flow
- **PIX Integration**: Instant BRL payments via PIX
- **USDC/USDT Support**: Ethereum-based stablecoin transactions
- **FX Conversion**: Real-time BRL ↔ USD conversion with transparent fees

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **UI**: Tailwind CSS with custom Hermes Orange design system
- **Components**: shadcn/ui with mobile-optimized variants
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth with credential provider
- **State Management**: React Query for server state
- **Forms**: React Hook Form + Zod validation
- **Mock Services**: Custom Fireblocks MPC wallet simulation

## 🎨 Design System

### Color Palette (Hermes Old Money Orange)
```css
--hermes-orange: #F37021
--hermes-burnt: #C35817
--hermes-light: #FF8C42
--hermes-cream: #FFF5EE
--hermes-sand: #FAEBD7
--old-money-navy: #1B2951
--old-money-gold: #D4AF37
--old-money-gray: #6B7280
--old-money-sage: #87936F
```

### Mobile-First Components
- **BalanceCard**: Swipeable currency balance cards with tier indicators
- **SwipeableCard**: Gesture-based approval cards with visual feedback
- **AmountPad**: Large touch-friendly number pad with currency formatting
- **BottomNavigation**: Persistent tab bar with badge notifications
- **BottomSheet**: Draggable modal sheets for secondary actions

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd logcash2
   npm install
   ```

2. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Demo Users
- **Carlos Silva**: `carlos@logcomex.com` (Gold tier, Approver)
- **Maria Santos**: `maria@logcomex.com` (Gold tier, Approver)
- **João Oliveira**: `joao@logcomex.com` (Gold tier, Approver)

*Password: Any value (demo mode)*

## 📱 Mobile User Journey

### 1. Authentication
- Clean login interface with demo user selection
- Company tier display and role-based access

### 2. Dashboard
- **Balance Cards**: Toggle visibility, tier indicators, currency flags
- **Quick Actions**: Add USD, Send Payment buttons
- **Pending Approvals**: Badge notifications and direct navigation
- **Recent Activity**: Transaction history with signature status

### 3. Send Payment Flow
- **Step 1**: Currency selection (USD/BRL) with visual indicators
- **Step 2**: Recipient selection from frequent/recent contacts
- **Step 3**: Amount entry with large touch-friendly number pad
- **Step 4**: Optional invoice/shipment details
- **Step 5**: Review with fee breakdown and MPC signature info

### 4. Approval Interface
- **Swipeable Cards**: Gesture-based approve (right) / reject (left)
- **Biometric Auth**: Touch ID/Face ID simulation before signing
- **Real-time Updates**: Live signature status and blockchain progress

### 5. MPC Wallet View
- **Fireblocks Vault**: Status, ID, multi-sig configuration
- **Stablecoin Balances**: USDC/USDT with current network fees
- **Active Signers**: Current authorized personnel
- **Blockchain Activity**: Pending and confirmed transactions

## 🏗️ Architecture

### Database Schema
```prisma
Company → Users (1:many)
Company → PaymentAccount (1:many)
PaymentAccount → MpcWallet (1:1)
PaymentAccount → Transactions (1:many)
Transaction → PaymentApprovals (1:many)
User → PaymentApprovals (1:many)
```

### API Routes
- `POST /api/payments/create` - Create new payment with auto-signature
- `POST /api/payments/sign` - Add signature to pending payment
- `GET /api/payments/pending` - Get user's pending approvals
- `GET /api/wallet/status` - MPC wallet info and balances
- `GET /api/dashboard` - Dashboard data with balances and transactions
- `GET /api/fx/rates` - Real-time exchange rates

### Mock Services
- **MockFireblocks**: Simulates MPC wallet operations with realistic delays
- **Mock Data Generation**: Creates sample transactions and approvals
- **FX Rate Simulation**: Dynamic exchange rates with spread

## 🔐 Security Features

### Multi-Signature Flow
1. **Payment Creation**: Initiator automatically provides first signature
2. **Signature Collection**: Requires exactly 2-of-3 signatures
3. **Blockchain Broadcast**: Automatic submission after threshold reached
4. **Confirmation**: 30-second simulation of blockchain confirmation

### Authentication & Authorization
- **Session Management**: NextAuth with JWT tokens
- **Role-Based Access**: `canApprove` flag for signature permissions
- **Company Isolation**: Users can only access their company's data
- **MPC Key Shares**: Encrypted key shares for authorized signers

## 📊 Performance & Optimization

### Mobile Optimizations
- **Touch Targets**: Minimum 44px for accessibility
- **Gesture Support**: Swipe navigation and pull-to-refresh
- **Haptic Feedback**: Visual and tactile feedback for actions
- **Safe Area Handling**: iPhone notch and home indicator support
- **Progressive Enhancement**: Works without JavaScript for core flows

### Caching Strategy
- **React Query**: 5-minute stale time with background refetch
- **API Response Caching**: Optimized database queries
- **Image Optimization**: Next.js automatic image optimization

## 🎯 Production Considerations

### Environment Variables
```env
DATABASE_URL="your-database-url"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="your-production-url"
FIREBLOCKS_API_KEY="your-fireblocks-key"
FIREBLOCKS_SECRET_KEY="your-fireblocks-secret"
```

### Deployment Checklist
- [ ] Replace SQLite with PostgreSQL
- [ ] Configure real Fireblocks API credentials
- [ ] Set up proper authentication providers (OAuth, SAML)
- [ ] Implement real PIX integration
- [ ] Add monitoring and error tracking
- [ ] Configure HTTPS and security headers
- [ ] Set up database backups
- [ ] Implement rate limiting

## 🧪 Testing

### Manual Testing Scenarios
1. **Complete Payment Flow**: Create → Sign → Broadcast → Confirm
2. **Multi-User Approval**: Test with different demo users
3. **Mobile Responsiveness**: Test on various screen sizes
4. **Gesture Interactions**: Swipe approval, pull-to-refresh
5. **Error Handling**: Network failures, insufficient balance

### Key User Flows to Test
- [ ] Login with demo users
- [ ] View dashboard balances
- [ ] Create USD payment to Shanghai Trading Co.
- [ ] Approve payment with second user
- [ ] Check MPC wallet status
- [ ] Add USD via PIX conversion

## 🤝 Contributing

This is an internal Logcomex project demonstrating modern B2B payment platform capabilities with enterprise-grade security and mobile-first design.

## 📄 License

Internal use only - Logcomex © 2024