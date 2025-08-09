# Log.Cash - Internal Logcomex B2B Payment Platform

## Project Context
This is an internal Logcomex project to add payment capabilities to our platform. We're building a B2B payment solution that allows our existing customers (Brazilian import/export companies) to receive and send payments in both BRL (via PIX) and USD (via wire), with regulated FX conversion between currencies. Most data comes from Logcomex's existing database, with some external integrations for banking services.

## Core Concept
Every Logcomex company gets both BRL and USD accounts when they activate payments:
- **BRL Account**: Virtual account with PIX key for instant domestic transfers
- **USD Account**: Virtual account via Bridge.xyz for international wires
- **Behind the scenes**: USD balances are held as stablecoins (USDC/USDT) in MPC wallets (Fireblocks/Safe) for instant settlement and security
They can receive payments in both currencies, convert between them via regulated FX, and make payments with multi-signature approval.

## User Activation Flow

### Step 1: Enable Payments (Instant)
```
1. User clicks "Enable Payments" in Logcomex dashboard
2. System checks company compliance score (already in Logcomex)
3. Based on score, company gets:
   - Score 90-100: Tier 1 (Gold) - $50k daily limit
   - Score 70-89: Tier 2 (Silver) - $20k daily limit  
   - Score 50-69: Tier 3 (Bronze) - $5k daily limit
   - Score <50: Blocked (compliance issues)
4. Two accounts created instantly:
   - BRL account with PIX key
   - USD account via Bridge.xyz
5. Show both account details immediately
```

### Step 2: Display Account Details (Immediate Value)
```
YOUR BRL ACCOUNT (PIX):
PIX Key (CNPJ): 12.345.678/0001-90
Bank: Logcomex Payments
[Copy PIX] [Generate QR Code]

YOUR USD ACCOUNT (Wire):
Account Name: [Company Name from Logcomex]
Account Number: 4821739506
Routing Number: 121000248
SWIFT: LEADUS33
Bank: Lead Bank, 1 Market St, San Francisco, CA 94105
[Copy Details] [Share via Email] [Download PDF]

✓ Receive payments instantly via PIX (BRL)
✓ Receive international wires (USD)
✓ All payments require multi-signature approval
```

## Main Features

### 1. Receive Payments (BRL and USD)
- **PIX (BRL)**: Share PIX key, receive instantly
- **Wire (USD)**: Share account details, receive in 1-2 days
- All incoming funds automatically credited to respective accounts
- Real-time notifications

### 2. Add USD (BRL → USD Conversion)
```
1. Click "Add USD from BRL"
2. Enter amount in BRL
3. See instant quote (rate based on tier)
4. Add optional information:
   - Observations/notes (free text for context)
   - Shipment information (optional):
     * Can add single or multiple shipments
     * Enter shipment numbers → auto-pulls from Logcomex
     * Links conversion to specific trade operations
5. Confirm → Bacen FX contract created
6. Transfer BRL via PIX from your bank
7. Process:
   - FX executed through partner bank
   - USD converted to USDC/USDT
   - Stored in company's MPC wallet (Fireblocks/Safe)
   - Shows as USD balance to user
8. USD credited in ~5 minutes
```

### 3. Send Payments (BRL via PIX or USD via Wire)
```
1. Click "Send Payment"
2. Choose currency (BRL or USD)
3. Select recipient:
   - Pre-populated from Logcomex partners (most data available)
   - Or add new recipient
4. Enter payment details:
   - Amount and invoice number
   - Shipment number (auto-pulls ETD/ETA from Logcomex if available)
   - Attach documents (invoice, BL, packing list)
5. Submit (requires 2 approvals if >threshold)
6. After approval:
   - PIX sent instantly (BRL)
   - Wire sent in 1-2 days (USD)
   - Recipient gets email confirmation
```

### 4. Payment Approval & Batching
```
1. Approver sees pending payments dashboard
2. Can select multiple payments to same recipient
3. Batch approve with single signature
4. System combines into single transfer
5. All included invoices tracked
```

### 5. Export & Reconciliation
```
1. Select date range
2. Choose format (Excel, CSV, PDF, JSON)
3. Export includes:
   - All transaction details
   - FX rates and fees
   - Shipment information
   - Document links
   - Approval history
   - Bacen contracts
4. Ready for accounting system import
```

## Data Integration (Mostly from Logcomex)

### What We Get from Logcomex:
```javascript
// Company data (already have)
{
  cnpj: "12.345.678/0001-90",
  company_name: "ABC Importadora Ltda",
  compliance_score: 95, // Our calculation
  trade_volume_annual: 2500000,
  months_on_platform: 36,
  verified_at: "2021-01-15",
  authorized_users: [
    {
      cpf: "123.456.789-00",
      name: "João Silva",
      role: "Director",
      can_approve_payments: true
    }
  ]
}

// Business partners (from trade data)
{
  partners: [
    {
      id: "bp_001",
      name: "Shanghai Electronics Co",
      country: "China",
      tax_id: "91310000MA1234567X",
      compliance_score: 88,
      trade_history: {
        total_transactions: 45,
        total_volume: 850000,
        last_transaction: "2024-12-15"
      }
      // Bank details added when first payment made
    }
  ]
}

// Shipment data (auto-pulled by shipment number)
{
  getShipmentData(shipmentNumber: "SHNG24001") {
    bl_number: "SHNG24001",
    container: "CNTR123456",
    etd: "2024-01-15",
    eta: "2024-02-20",
    origin_port: "Shanghai",
    destination_port: "Santos",
    carrier: "Maersk",
    status: "In Transit"
  }
}
```

### What We Get from External Sources:
- **Bridge.xyz**: USD account creation and wire transfers
- **Banking Partner**: BRL account with PIX capabilities
- **FX Partner**: Exchange rates and Bacen contracts

### How Shipment Auto-Pull Works:
```javascript
// User enters shipment number
onShipmentNumberEntered(number) {
  // Check Logcomex database
  const shipmentData = logcomex.getShipment(number);
  
  if (shipmentData) {
    // Auto-fill fields
    form.etd = shipmentData.etd;
    form.eta = shipmentData.eta;
    form.container = shipmentData.container;
    // User can still edit if needed
  }
}
```

### Tier Assignment (Automatic)
```javascript
function calculateTier(company) {
  // All data from Logcomex DB
  const score = company.compliance_score;
  const volume = company.trade_volume_annual;
  const months = company.months_on_platform;
  
  if (score < 50) return 'BLOCKED';
  if (score >= 90 && volume > 100000 && months > 12) return 'TIER_1';
  if (score >= 70 && volume > 10000 && months > 3) return 'TIER_2';
  return 'TIER_3';
}
```

## User Interface

### 1. Payment Dashboard (Main Screen)
```
┌─────────────────────────────────────────┐
│ Log.Cash Payments          Tier: Gold ⭐│
├─────────────────────────────────────────┤
│ YOUR ACCOUNTS                           │
│ 🇧🇷 PIX: 12.345.678/0001-90            │
│ 🇺🇸 USD: 4821739506 | Route: 121000248 │
│ [Copy PIX] [Copy USD] [Share]          │
├─────────────────────────────────────────┤
│ BALANCES                                │
│ 🇧🇷 BRL: R$ 850,000                    │
│ 🇺🇸 USD: $ 125,000                     │
│                                         │
│ [+ Add USD] [→ Send Payment] [↓ Export]│
├─────────────────────────────────────────┤
│ RECENT ACTIVITY                         │
│ ← PIX Received R$50,000 from Cliente X │
│ ← Wire Received $50,000 from Apple Inc │
│ → PIX Sent R$18,000 to Fornecedor Y    │
│ → Wire Sent $18,000 to Shanghai Elec.  │
└─────────────────────────────────────────┘
```

### 2. Add USD Screen
```
┌─────────────────────────────────────────┐
│ Add USD to Your Account                 │
├─────────────────────────────────────────┤
│ Amount in BRL: R$ [100,000    ]        │
│                                         │
│ FX QUOTE                                │
│ Rate: 1 USD = 5.92 BRL                 │
│ Fee: R$ 500 (0.5%)                     │
│ You receive: $ 16,806.72               │
│ Quote expires in: 28 seconds           │
│                                         │
│ OBSERVATIONS (Optional)                 │
│ [Capital for Q1 2024 imports...      ] │
│ [                                    ] │
│                                         │
│ RELATED SHIPMENTS (Optional)            │
│ [+ Add Shipment]                       │
│ ┌─────────────────────────────────┐    │
│ │ SHNG24001 ✓                     │    │
│ │ ETD: Jan 15 | ETA: Feb 20       │    │
│ │ Container: CNTR123456 [Remove]  │    │
│ └─────────────────────────────────┘    │
│ ┌─────────────────────────────────┐    │
│ │ SHNG24002 ✓                     │    │
│ │ ETD: Jan 20 | ETA: Feb 25       │    │
│ │ Container: CNTR789012 [Remove]  │    │
│ └─────────────────────────────────┘    │
│                                         │
│ [Confirm & Generate PIX →]             │
└─────────────────────────────────────────┘
```

### 3. Send Payment Screen
```
┌─────────────────────────────────────────┐
│ Send Payment                            │
├─────────────────────────────────────────┤
│ Currency: [BRL ▼] [USD]                │
│                                         │
│ To: [🔍 Search partners or add new...] │
│                                         │
│ FREQUENT RECIPIENTS                     │
│ ┌─────────────────────────────────┐    │
│ │ Shanghai Electronics 🇨🇳         │    │
│ │ Score: 88 ✓ | 45 past payments  │    │
│ └─────────────────────────────────┘    │
│                                         │
│ Amount: $[        ]                    │
│ Invoice: [        ]                    │
│                                         │
│ SHIPMENT (Optional)                    │
│ Number: [SHNG24001    ] 🔄             │
│ ↳ Auto-filled: ETD: Jan 15, ETA: Feb 20│
│                                         │
│ DOCUMENTS                              │
│ [📎 Attach Files]                      │
│                                         │
│ [Continue →]                            │
└─────────────────────────────────────────┘
```

### 3. Approval Dashboard (With Batching)
```
┌─────────────────────────────────────────┐
│ Pending Approvals (5)                   │
├─────────────────────────────────────────┤
│ GROUP BY RECIPIENT                      │
│                                         │
│ ▼ Shanghai Electronics (3 payments)     │
│ ┌─────────────────────────────────┐    │
│ │ ☑ $18,000 - INV-2024-001        │    │
│ │   Shipment: SHNG24001            │    │
│ │   1st sign: João (yesterday)     │    │
│ │                                  │    │
│ │ ☑ $15,000 - INV-2024-002        │    │
│ │   Shipment: SHNG24002            │    │
│ │   1st sign: Maria (today)        │    │
│ │                                  │    │
│ │ ☑ $20,000 - INV-2024-003        │    │
│ │   Shipment: SHNG24003            │    │
│ │   1st sign: Pedro (1 hour ago)   │    │
│ └─────────────────────────────────┘    │
│                                         │
│ Total: $53,000                         │
│ [Approve Batch (3)] [Approve Selected] │
│                                         │
│ ▼ Other Payments (2)                    │
└─────────────────────────────────────────┘
```

### 4. Export Transactions Screen
```
┌─────────────────────────────────────────┐
│ Export Transactions                     │
├─────────────────────────────────────────┤
│ Date Range:                            │
│ From: [01/01/2024] To: [31/12/2024]   │
│                                         │
│ Filters:                               │
│ ☑ BRL Transactions                     │
│ ☑ USD Transactions                     │
│ ☑ Include documents                    │
│ ☑ Include approval history             │
│                                         │
│ Format:                                │
│ ○ Excel (.xlsx) - Best for accounting  │
│ ○ CSV - For system integration         │
│ ○ PDF - For reports                    │
│ ○ JSON - For API integration           │
│                                         │
│ Fields to Include:                     │
│ ☑ Transaction ID & Date                │
│ ☑ Amount & Currency                    │
│ ☑ FX Rate & Fees                      │
│ ☑ Recipient Details                    │
│ ☑ Shipment Information                 │
│ ☑ Bacen Contract Numbers               │
│ ☑ Approval Chain                       │
│ ☑ Document Links                       │
│                                         │
│ [📥 Export] [📧 Email Report]          │
└─────────────────────────────────────────┘
```

### 3. Receive USD (Share Screen)
```
┌─────────────────────────────────────────┐
│ Receive USD Payments                    │
├─────────────────────────────────────────┤
│ Share these details with your customers │
│                                         │
│ ┌─────────────────────────────────┐    │
│ │ Beneficiary: ABC Importadora     │    │
│ │ Bank: Lead Bank                  │    │
│ │ Account: 4821739506              │    │
│ │ Routing: 121000248               │    │
│ │ SWIFT: LEADUS33                  │    │
│ │ Address: 1 Market St, SF, CA     │    │
│ └─────────────────────────────────┘    │
│                                         │
│ [📧 Email] [📄 PDF] [🔗 Copy Link]     │
│                                         │
│ ⚡ Funds typically arrive in 1-2 days   │
│ ✓ No fees for receiving wires          │
└─────────────────────────────────────────┘
```

## Database Schema (Extension to Logcomex)

```sql
-- Payment accounts (one per company)
payment_accounts {
  id
  company_id (FK to Logcomex companies)
  tier (1, 2, 3, blocked)
  -- BRL account (PIX)
  brl_pix_key (CNPJ)
  brl_account_id
  -- USD account from Bridge/Lead Bank
  bridge_account_id
  usd_account_number
  usd_routing_number
  usd_swift_code
  usd_bank_name
  usd_bank_address
  -- MPC Wallet for stablecoins
  mpc_wallet_address (Ethereum/Polygon address)
  mpc_wallet_provider (fireblocks, safe)
  usdc_balance
  usdt_balance
  -- Limits based on tier
  daily_limit_brl
  daily_limit_usd
  monthly_limit_brl
  monthly_limit_usd
  fx_rate_tier (0.4%, 0.5%, 0.6%)
  -- Status
  activated_at
  activated_by_user_id
}

-- FX Conversions (BRL to USD)
fx_conversions {
  id
  account_id
  amount_brl
  amount_usd
  fx_rate
  fee
  bacen_contract_id
  observations (text - user notes)
  status (quoted, pending_pix, converting, completed)
  pix_code
  pix_paid_at
  stablecoin_tx_hash (blockchain transaction)
  created_at
  completed_at
}

-- FX Conversion Shipments (many-to-many)
fx_conversion_shipments {
  id
  fx_conversion_id
  shipment_number
  bl_number
  container_number
  etd_date
  eta_date
  auto_pulled_at (timestamp when data pulled from Logcomex)
}

-- Transactions (BRL and USD payments)
transactions {
  id
  account_id
  type (deposit, withdrawal, payment, fx_conversion)
  currency (BRL, USD)
  amount
  amount_converted (if FX conversion)
  fx_rate (if conversion)
  bacen_contract_id (if conversion)
  -- For payments
  payment_method (pix, wire, stablecoin_internal)
  recipient_partner_id (FK to Logcomex partners - if exists)
  recipient_name
  recipient_email
  recipient_account (PIX key or bank account)
  invoice_number
  -- Shipment (auto-pulled from Logcomex)
  shipment_number
  bl_number
  container_number
  etd_date
  eta_date
  -- Blockchain data (for stablecoin movements)
  blockchain_tx_hash
  gas_fee_usd
  -- Batching
  batch_id (nullable - groups batched payments)
  -- Status
  status (pending_signature_1, pending_signature_2, approved, sent, completed)
  created_at
  completed_at
}

-- Document attachments
transaction_documents {
  id
  transaction_id
  document_type (invoice, bl, packing_list, other)
  file_name
  file_url
  file_size
  uploaded_by_user_id
  uploaded_at
}

-- Payment batches
payment_batches {
  id
  recipient_partner_id
  currency (BRL, USD)
  total_amount
  payment_count
  status (pending_signature_2, approved, sent)
  created_at
}

-- Payment approvals (for multi-sig)
payment_approvals {
  id
  transaction_id
  batch_id (if batched approval)
  approver_user_id
  signature_level (1 or 2)
  approved_at
}

-- Export logs
export_logs {
  id
  company_id
  exported_by_user_id
  date_from
  date_to
  format (excel, csv, pdf, json)
  filters_applied (JSON)
  file_url
  created_at
}
```

## API Endpoints

```typescript
// Activation - creates both BRL and USD accounts + MPC wallet
POST /api/payments/activate
  Response: {
    tier: "TIER_1",
    limits: { 
      daily_brl: 250000,
      daily_usd: 50000, 
      monthly_brl: 2500000,
      monthly_usd: 500000 
    },
    accounts: {
      brl: {
        pix_key: "12.345.678/0001-90",
        bank_name: "Logcomex Payments"
      },
      usd: {
        number: "4821739506",
        routing: "121000248",
        swift: "LEADUS33",
        bank_name: "Lead Bank",
        bank_address: "1 Market St, San Francisco, CA 94105"
      },
      wallet: {
        provider: "fireblocks", // or "safe"
        address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7",
        network: "polygon"
      }
    }
  }

// Create FX conversion (BRL to USD) with observations and shipments
POST /api/fx/convert
  Body: {
    amount_brl: 100000,
    observations: "Capital for Q1 2024 imports from China",
    shipments: [
      "SHNG24001", // Shipment numbers
      "SHNG24002"
    ]
  }
  Response: {
    conversion_id: "fx_001",
    amount_brl: 100000,
    amount_usd: 16806.72,
    fx_rate: 5.92,
    fee: 500,
    bacen_contract: "BC2024123456",
    pix_code: "00020126580014...",
    qr_code: "data:image/png;base64,...",
    expires_at: "2024-12-22T10:30:00Z",
    shipments_linked: [
      {
        shipment_number: "SHNG24001",
        container: "CNTR123456",
        etd: "2024-01-15",
        eta: "2024-02-20"
      },
      {
        shipment_number: "SHNG24002",
        container: "CNTR789012",
        etd: "2024-01-20",
        eta: "2024-02-25"
      }
    ]
  }

// Webhook when PIX is paid - triggers stablecoin conversion
POST /webhooks/pix-received
  Body: {
    pix_id: "pix_123",
    amount: 100000,
    reference: "fx_001"
  }
  // System then:
  // 1. Executes FX through partner bank
  // 2. Receives USD to Bridge account
  // 3. Converts USD to USDC via DEX/OTC
  // 4. Transfers USDC to company's MPC wallet
  // 5. Updates balance display

// Get wallet balance (shows as USD to user)
GET /api/wallets/balance
  Response: {
    brl_balance: 850000,
    usd_balance: 125000, // Actually USDC + USDT in wallet
    usd_breakdown: {
      usdc: 100000,
      usdt: 25000,
      total_usd_value: 125000
    },
    wallet: {
      address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7",
      provider: "fireblocks"
    }
  }

// Get shipment data from Logcomex
GET /api/shipments/:shipmentNumber
  Response: {
    shipment_number: "SHNG24001",
    bl_number: "BL-SHNG24001",
    container: "CNTR123456",
    etd: "2024-01-15",
    eta: "2024-02-20",
    origin_port: "Shanghai",
    destination_port: "Santos",
    carrier: "Maersk",
    status: "In Transit"
  }

// Create payment (BRL or USD) 
POST /api/payments/send
  Body: {
    currency: "USD",
    payment_method: "wire", // or "pix" for BRL
    recipient_id: "bp_001",
    amount: 18000,
    invoice: "INV-2024-123",
    shipment_number: "SHNG24001", // Auto-pulls data
    documents: [...]
  }
  Response: {
    payment_id: "tx_003",
    status: "pending_signature_1",
    // If USD payment between Log.Cash users:
    settlement_method: "instant_stablecoin", // Internal USDC transfer
    estimated_time: "5 minutes",
    // If external:
    settlement_method: "wire_transfer",
    estimated_time: "1-2 business days"
  }

// MPC wallet operations (backend only)
POST /api/wallet/sign-transaction
  Body: {
    wallet_id: "wallet_001",
    transaction: {
      to: "0x892d35Cc6634C0532925a3b844Bc9e7595f0bEb8",
      amount: "18000",
      token: "USDC"
    },
    signers: ["user_1", "user_2"] // Multi-sig
  }
  Response: {
    tx_hash: "0x123abc...",
    status: "pending_signatures",
    signatures_collected: 0,
    signatures_required: 2
  }

// Export with FX conversion details
POST /api/transactions/export
  Body: {
    date_from: "2024-01-01",
    date_to: "2024-12-31",
    format: "excel",
    include_fx_conversions: true
  }
  Response: {
    export_id: "exp_001",
    file_url: "https://downloads.logcomex.com/exports/exp_001.xlsx",
    // Excel includes:
    // - FX conversions with observations
    // - Linked shipments
    // - Stablecoin wallet movements
    // - Gas fees for blockchain transactions
  }
```

## Key Differentiators

### 1. Dual Currency Accounts
- BRL account with PIX for domestic transfers
- USD account for international wires
- Both created instantly on activation
- All transactions require multi-signature approval

### 2. Smart Data Integration
- Most data from Logcomex (partners, compliance, trade history)
- Shipment details auto-pulled by number
- External integrations only for banking services
- Pre-populated fields reduce manual entry by 90%

### 3. Intelligent Batching at Approval
- Approvers see payments grouped by recipient
- Can batch approve multiple payments with one signature
- Reduces approval fatigue for regular suppliers
- Single wire/PIX for multiple invoices

### 4. Complete Export Functionality
- Multiple formats (Excel, CSV, PDF, JSON)
- Full transaction details including FX rates
- Shipment information and document links
- Ready for accounting system import
- Configurable fields and date ranges

### 5. Trade-Aware Payments
- Enter shipment number → auto-fills ETD/ETA
- Attach trade documents directly to payments
- Complete audit trail from shipment to payment
- Recipient notifications with full context

### 3. Tier System (Based on Logcomex Data)
```
Tier 1 (Auto-approved):
- Compliance score 90+
- 12+ months on platform
- $100k+ annual volume
→ R$250k BRL daily, $50k USD daily
→ 0.4% FX fee

Tier 2 (Quick approval):
- Compliance score 70-89
- 3+ months on platform
- $10k+ annual volume
→ R$100k BRL daily, $20k USD daily
→ 0.5% FX fee

Tier 3 (Basic access):
- Compliance score 50-69
- New to platform
→ R$25k BRL daily, $5k USD daily
→ 0.6% FX fee

Blocked:
- Compliance score <50
- Suspicious activity
- Sanctions match
→ Cannot activate payments
```

## Implementation Phases

### Week 1-2: Core Setup
- [ ] Add payment tables to Logcomex DB
- [ ] Build tier calculation from compliance scores
- [ ] Create Bridge.xyz sandbox accounts
- [ ] Build "Enable Payments" flow

### Week 3-4: USD Account Display
- [ ] Integrate Bridge.xyz account creation
- [ ] Build deposit info display screens
- [ ] Create share/export functionality
- [ ] Add to main Logcomex dashboard

### Week 5-6: Recipient Management & Documents
- [ ] Pull business partners from Logcomex DB
- [ ] Add compliance scores to partner list
- [ ] Build recipient search/filter
- [ ] Create payment history view
- [ ] Implement document upload system
- [ ] Add shipment information fields

### Week 7-8: Payment Flows & Batching
- [ ] Build BRL → USD conversion flow
- [ ] Implement payment creation with pre-populated data
- [ ] Add shipment tracking fields (BL, container, dates)
- [ ] Create batching logic for same recipient
- [ ] Build batch approval interface
- [ ] Add multi-sig for large payments
- [ ] Connect Bridge.xyz wire transfers

### Week 9-10: Notifications & Polish
- [ ] Set up email notification templates
- [ ] Implement recipient confirmation emails
- [ ] Add document attachment to emails
- [ ] Internal testing with Logcomex's own payments
- [ ] Select 20 pilot customers (mix of tiers)
- [ ] Monitor and optimize

## Success Metrics

- **Activation Rate**: 30% of eligible companies enable payments
- **Deposit Volume**: $10M in USD deposits within 3 months
- **Payment Volume**: 500 international payments/month
- **User Satisfaction**: NPS >70
- **Cost Savings**: 80% cheaper than traditional banks

## Revenue Model

- **FX Spread**: 0.4-0.6% based on tier
- **Wire Transfer Fee**: $10-20 based on tier
- **Monthly Active Account**: $10/month (waived for Tier 1)
- **Incoming Wire**: Free (encourages deposits)

## Advantages of This Approach

1. **Zero Learning Curve**: Recipients are already in the system
2. **Instant Utility**: Get USD account immediately
3. **Trust Through Transparency**: See partner compliance scores
4. **Network Effects**: Both parties benefit from being on Logcomex
5. **Risk Management**: Built on years of trade data

## Launch Strategy

### Phase 1: High-Value Customers (Week 1)
- Enable for top 100 customers by trade volume
- Personal onboarding calls
- Monitor every transaction

### Phase 2: Tier 1 Rollout (Week 2-3)
- Open to all 90+ compliance score companies
- In-app notification
- Email campaign with USD account details

### Phase 3: General Availability (Month 2)
- All companies 50+ score can activate
- Marketing push
- Success stories from Phase 1

## Key Decision Points

1. **Bridge.xyz vs Multiple Providers**: Start with one, add more later?
2. **FX Partner**: Braza (fast) vs BTG (relationship)?
3. **Initial Limits**: Conservative or aggressive?
4. **Pricing**: Subsidize initially or charge from day 1?

---

## Summary

Log.Cash is a natural extension of Logcomex's platform that solves real pain points for import/export companies. By leveraging mostly Logcomex data (with select external banking integrations), we can offer:

1. **Dual currency accounts** (BRL with PIX + USD with wire) created instantly
2. **Multi-signature approval** for all payments (PIX and wire)
3. **Smart features** like shipment auto-pull and approval batching
4. **Complete export functionality** for accounting reconciliation
5. **Tier-based limits** using existing compliance scores

The core flow is simple: 
- Receive payments in both BRL (PIX) and USD (wire)
- Convert between currencies via compliant FX
- Send payments with multi-sig security
- Export everything for easy reconciliation

**Success looks like**: 1,000 active payment users within 6 months, processing $50M+/month in combined BRL and USD payments, with 80% cost savings vs traditional banks.