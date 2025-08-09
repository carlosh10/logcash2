import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { initializeMockData } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Initialize mock data if needed
    await initializeMockData()

    // Get payment account for the user's company
    const paymentAccount = await prisma.paymentAccount.findFirst({
      where: {
        companyId: session.user.companyId
      },
      include: {
        company: {
          select: {
            tier: true
          }
        }
      }
    })

    if (!paymentAccount) {
      return NextResponse.json({ error: 'Payment account not found' }, { status: 404 })
    }

    // Get pending transactions count
    const pendingTransactionsCount = await prisma.transaction.count({
      where: {
        accountId: paymentAccount.id,
        status: {
          in: ['pending_signature_1', 'pending_signature_2']
        }
      }
    })

    // Get recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        accountId: paymentAccount.id
      },
      include: {
        approvals: {
          include: {
            approver: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    const dashboardData = {
      balances: {
        brl: paymentAccount.balanceBRL,
        usd: paymentAccount.balanceUSD,
        tier: paymentAccount.company.tier
      },
      pendingTransactions: pendingTransactionsCount,
      recentTransactions: recentTransactions.map(tx => ({
        id: tx.id,
        type: tx.type,
        currency: tx.currency,
        amount: tx.amount,
        status: tx.status,
        recipientName: tx.recipientName,
        createdAt: tx.createdAt.toISOString(),
        requiredSignatures: tx.requiredSignatures,
        collectedSignatures: tx.collectedSignatures
      }))
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}