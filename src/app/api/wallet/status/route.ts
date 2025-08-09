import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { mockFireblocks } from '@/lib/mock-fireblocks'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get payment account with MPC wallet
    const paymentAccount = await prisma.paymentAccount.findFirst({
      where: {
        companyId: session.user.companyId
      },
      include: {
        mpcWallet: true
      }
    })

    if (!paymentAccount || !paymentAccount.mpcWallet) {
      return NextResponse.json({ error: 'MPC wallet not found' }, { status: 404 })
    }

    const mpcWallet = paymentAccount.mpcWallet

    // Get vault balances from Fireblocks
    let balances = { USDC: '0', USDT: '0' }
    try {
      balances = await mockFireblocks.getVaultBalance(mpcWallet.vaultId)
    } catch (error) {
      console.error('Failed to get vault balance:', error)
    }

    // Get pending blockchain transactions
    const pendingTransactions = await prisma.transaction.findMany({
      where: {
        accountId: paymentAccount.id,
        status: {
          in: ['broadcasting', 'pending_signature_1', 'pending_signature_2']
        },
        currency: 'USD' // Only USD transactions go to blockchain
      },
      select: {
        id: true,
        status: true,
        amount: true,
        createdAt: true,
        fireblocksTransactionId: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    // Get recent blockchain activity (mock data for demonstration)
    const recentActivity = [
      {
        txHash: '0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
        amount: '18000.00',
        asset: 'USDC',
        status: 'confirmed',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        txHash: '0xb2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567',
        amount: '32000.00',
        asset: 'USDT',
        status: 'pending',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      }
    ]

    const walletData = {
      mpcWallet: {
        vaultId: mpcWallet.vaultId,
        walletId: mpcWallet.walletId,
        walletAddress: mpcWallet.walletAddress,
        provider: mpcWallet.provider,
        threshold: mpcWallet.threshold,
        totalSigners: mpcWallet.totalSigners,
        status: mpcWallet.status
      },
      balances,
      pendingTransactions: pendingTransactions.map(tx => ({
        id: tx.id,
        status: tx.status,
        amount: tx.amount.toString(),
        asset: 'USDC', // Assuming USDC for simplicity
        createdAt: tx.createdAt.toISOString()
      })),
      recentActivity
    }

    return NextResponse.json(walletData)
  } catch (error) {
    console.error('Wallet status API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}