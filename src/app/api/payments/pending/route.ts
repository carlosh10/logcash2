import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get payment account for the user's company
    const paymentAccount = await prisma.paymentAccount.findFirst({
      where: {
        companyId: session.user.companyId
      }
    })

    if (!paymentAccount) {
      return NextResponse.json({ error: 'Payment account not found' }, { status: 404 })
    }

    // Get pending transactions that need signatures
    const pendingTransactions = await prisma.transaction.findMany({
      where: {
        accountId: paymentAccount.id,
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
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Filter out transactions that the current user has already signed
    const userPendingTransactions = pendingTransactions.filter(tx => {
      // Check if user has already signed this transaction
      const userHasSigned = tx.approvals.some(approval => 
        approval.approver.id === session.user.id
      )
      
      // If user hasn't signed, they can sign
      // If it needs second signature and user hasn't signed, they can sign
      return !userHasSigned && (
        tx.status === 'pending_signature_1' || 
        (tx.status === 'pending_signature_2' && tx.collectedSignatures < tx.requiredSignatures)
      )
    })

    const formattedTransactions = userPendingTransactions.map(tx => ({
      id: tx.id,
      currency: tx.currency,
      amount: tx.amount,
      recipientName: tx.recipientName,
      recipientAccount: tx.recipientAccount,
      invoiceNumber: tx.invoiceNumber,
      shipmentNumber: tx.shipmentNumber,
      createdAt: tx.createdAt.toISOString(),
      requiredSignatures: tx.requiredSignatures,
      collectedSignatures: tx.collectedSignatures,
      approvals: tx.approvals.map(approval => ({
        approver: {
          name: approval.approver.name
        },
        signatureLevel: approval.signatureLevel
      }))
    }))

    return NextResponse.json(formattedTransactions)
  } catch (error) {
    console.error('Pending approvals API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}