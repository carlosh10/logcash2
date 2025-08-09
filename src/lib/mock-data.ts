import { mockFireblocks } from './mock-fireblocks'
import { prisma } from './prisma'

export interface MockCompanyData {
  company: {
    id: string
    cnpj: string
    name: string
    tier: string
    complianceScore: number
  }
  users: Array<{
    id: string
    email: string
    name: string
    canApprove: boolean
    mpcKeyShare?: string
  }>
  paymentAccount: {
    id: string
    balanceBRL: number
    balanceUSD: number
    mpcWallet?: {
      vaultId: string
      walletAddress: string
    }
  }
  transactions: Array<{
    id: string
    type: string
    currency: string
    amount: number
    status: string
    recipientName?: string
    createdAt: Date
  }>
}

export async function createMockCompany(): Promise<MockCompanyData> {
  // Create company
  const company = await prisma.company.create({
    data: {
      cnpj: '12.345.678/0001-90',
      name: 'Logcomex Import/Export Ltda',
      tier: 'gold',
      complianceScore: 92,
      tradingVolume: 2500000.0,
    }
  })

  // Create MPC vault first
  const vault = await mockFireblocks.createVault(company.id)

  // Create payment account with MPC wallet
  const paymentAccount = await prisma.paymentAccount.create({
    data: {
      companyId: company.id,
      tier: 'gold',
      brlPixKey: '12345678000190',
      usdAccountNumber: '1234567890',
      usdRoutingNumber: '021000021',
      balanceBRL: 850000.0,
      balanceUSD: 125000.0,
      dailyLimitBRL: 200000.0,
      dailyLimitUSD: 50000.0,
      fireblocksVaultId: vault.vaultId,
      mpcWallet: {
        create: {
          walletId: `wallet_${vault.vaultId}`,
          vaultId: vault.vaultId,
          walletAddress: vault.walletAddress,
          provider: 'fireblocks',
          threshold: 2,
          totalSigners: 3,
          status: 'ACTIVE',
        }
      }
    },
    include: {
      mpcWallet: true,
    }
  })

  // Create users with MPC key shares
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'carlos@logcomex.com',
        name: 'Carlos Silva',
        companyId: company.id,
        canApprove: true,
        mpcKeyShare: 'mpc_key_share_1_encrypted',
      }
    }),
    prisma.user.create({
      data: {
        email: 'maria@logcomex.com',
        name: 'Maria Santos',
        companyId: company.id,
        canApprove: true,
        mpcKeyShare: 'mpc_key_share_2_encrypted',
      }
    }),
    prisma.user.create({
      data: {
        email: 'joao@logcomex.com',
        name: 'João Oliveira',
        companyId: company.id,
        canApprove: true,
        mpcKeyShare: 'mpc_key_share_3_encrypted',
      }
    }),
  ])

  // Create sample transactions
  const transactions = await Promise.all([
    // Completed transaction
    prisma.transaction.create({
      data: {
        accountId: paymentAccount.id,
        type: 'send',
        currency: 'USD',
        amount: 18000.0,
        status: 'complete',
        recipientName: 'Shanghai Trading Co.',
        recipientAccount: '0x742d35Cc6634C0532925a3b8D8Cc3aE8C6B4aF17',
        invoiceNumber: 'INV-2024-001',
        shipmentNumber: 'SHIP-SH-2024-001',
        fireblocksTransactionId: 'fb_tx_completed_001',
        blockchainTxHash: '0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
        requiredSignatures: 2,
        collectedSignatures: 2,
        networkFee: 2.5,
        serviceFee: 45.0,
      }
    }),

    // Pending transaction (needs 1 more signature)
    prisma.transaction.create({
      data: {
        accountId: paymentAccount.id,
        type: 'send',
        currency: 'BRL',
        amount: 50000.0,
        status: 'pending_signature_2',
        recipientName: 'Fornecedor ABC',
        invoiceNumber: 'INV-2024-002',
        fireblocksTransactionId: 'fb_tx_pending_002',
        requiredSignatures: 2,
        collectedSignatures: 1,
        serviceFee: 125.0,
      }
    }),

    // Another pending transaction
    prisma.transaction.create({
      data: {
        accountId: paymentAccount.id,
        type: 'send',
        currency: 'USD',
        amount: 32000.0,
        status: 'pending_signature_1',
        recipientName: 'Global Shipping Ltd',
        recipientAccount: '0x8ba1f109551bD432803012645Hac136c22C57002',
        invoiceNumber: 'INV-2024-003',
        shipmentNumber: 'SHIP-GL-2024-003',
        fireblocksTransactionId: 'fb_tx_pending_003',
        requiredSignatures: 2,
        collectedSignatures: 0,
        networkFee: 3.2,
        serviceFee: 80.0,
      }
    }),

    // Recent receive transaction
    prisma.transaction.create({
      data: {
        accountId: paymentAccount.id,
        type: 'receive',
        currency: 'BRL',
        amount: 75000.0,
        status: 'complete',
        recipientName: 'Cliente Importador XYZ',
        description: 'Pagamento via PIX',
        requiredSignatures: 0,
        collectedSignatures: 0,
      }
    }),
  ])

  // Create approval records for completed transactions
  await prisma.paymentApproval.createMany({
    data: [
      {
        transactionId: transactions[0].id, // Completed USD transaction
        approverUserId: users[0].id,
        signatureLevel: 1,
        mpcSignature: 'sig_1_' + transactions[0].id,
      },
      {
        transactionId: transactions[0].id,
        approverUserId: users[1].id,
        signatureLevel: 2,
        mpcSignature: 'sig_2_' + transactions[0].id,
      },
      {
        transactionId: transactions[1].id, // Pending BRL transaction (has 1 sig)
        approverUserId: users[0].id,
        signatureLevel: 1,
        mpcSignature: 'sig_1_' + transactions[1].id,
      },
    ]
  })

  return {
    company,
    users,
    paymentAccount: {
      ...paymentAccount,
      mpcWallet: paymentAccount.mpcWallet ? {
        vaultId: paymentAccount.mpcWallet.vaultId,
        walletAddress: paymentAccount.mpcWallet.walletAddress,
      } : undefined,
    },
    transactions,
  }
}

export async function getPendingTransactions(accountId: string) {
  return await prisma.transaction.findMany({
    where: {
      accountId,
      status: {
        in: ['pending_signature_1', 'pending_signature_2']
      }
    },
    include: {
      approvals: {
        include: {
          approver: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function getRecentTransactions(accountId: string, limit = 10) {
  return await prisma.transaction.findMany({
    where: {
      accountId
    },
    include: {
      approvals: {
        include: {
          approver: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit,
  })
}

export async function getAccountBalance(accountId: string) {
  const account = await prisma.paymentAccount.findUnique({
    where: { id: accountId },
    select: {
      balanceBRL: true,
      balanceUSD: true,
      company: {
        select: {
          tier: true,
        }
      }
    }
  })
  
  return account
}

// Initialize mock data on first run
export async function initializeMockData() {
  const existingCompany = await prisma.company.findFirst()
  
  if (!existingCompany) {
    console.log('Creating mock data...')
    const mockData = await createMockCompany()
    console.log('Mock data created:', {
      company: mockData.company.name,
      users: mockData.users.length,
      transactions: mockData.transactions.length,
      mpcVault: mockData.paymentAccount.mpcWallet?.vaultId,
    })
    return mockData
  }
  
  return null
}