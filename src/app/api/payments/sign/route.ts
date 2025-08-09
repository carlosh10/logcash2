import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { mockFireblocks } from '@/lib/mock-fireblocks'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId || !session.user.canApprove) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { transactionId, action } = body // action: 'approve' | 'reject'

    // Get transaction details
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        account: {
          include: {
            mpcWallet: true
          }
        },
        approvals: {
          include: {
            approver: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Check if user has already signed
    const existingApproval = transaction.approvals.find(
      approval => approval.approver.id === session.user.id
    )

    if (existingApproval) {
      return NextResponse.json({ error: 'You have already signed this transaction' }, { status: 400 })
    }

    // Get user's MPC key share
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { mpcKeyShare: true }
    })

    if (!user?.mpcKeyShare) {
      return NextResponse.json({ error: 'MPC key share not found' }, { status: 400 })
    }

    if (action === 'reject') {
      // Update transaction status to failed
      await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: 'failed' }
      })

      return NextResponse.json({
        success: true,
        status: 'rejected',
        message: 'Payment rejected successfully'
      })
    }

    // Handle approval
    const nextSignatureLevel = transaction.collectedSignatures + 1
    
    // Create approval record
    await prisma.paymentApproval.create({
      data: {
        transactionId,
        approverUserId: session.user.id,
        signatureLevel: nextSignatureLevel,
        mpcSignature: `sig_${nextSignatureLevel}_${transactionId}_${Date.now()}`,
      }
    })

    // Add signature to Fireblocks if USD transaction
    let fireblocksStatus = null
    if (transaction.fireblocksTransactionId && transaction.account.mpcWallet) {
      try {
        const signResult = await mockFireblocks.signTransaction(
          transaction.fireblocksTransactionId,
          session.user.id,
          user.mpcKeyShare
        )
        fireblocksStatus = signResult.status
      } catch (error) {
        console.error('Fireblocks signature error:', error)
      }
    }

    const newCollectedSignatures = transaction.collectedSignatures + 1
    let newStatus = transaction.status

    // Check if we have enough signatures
    if (newCollectedSignatures >= transaction.requiredSignatures) {
      newStatus = 'broadcasting'
      
      // If USD transaction, broadcast to blockchain
      if (transaction.fireblocksTransactionId && fireblocksStatus === 'READY_TO_BROADCAST') {
        try {
          const broadcastResult = await mockFireblocks.broadcastTransaction(
            transaction.fireblocksTransactionId
          )
          
          // Update transaction with blockchain hash
          await prisma.transaction.update({
            where: { id: transactionId },
            data: {
              status: 'broadcasting',
              collectedSignatures: newCollectedSignatures,
              blockchainTxHash: broadcastResult.blockchainTxHash,
            }
          })

          // Simulate blockchain confirmation after delay
          setTimeout(async () => {
            await prisma.transaction.update({
              where: { id: transactionId },
              data: { status: 'complete' }
            })
          }, 30000) // 30 seconds

          return NextResponse.json({
            success: true,
            status: 'broadcasting',
            blockchainTxHash: broadcastResult.blockchainTxHash,
            message: 'Payment signed and submitted to blockchain. Confirmation expected in 2-5 minutes.'
          })
        } catch (error) {
          console.error('Broadcast error:', error)
        }
      } else if (transaction.currency === 'BRL') {
        // For BRL transactions, mark as complete immediately (PIX simulation)
        await prisma.transaction.update({
          where: { id: transactionId },
          data: {
            status: 'complete',
            collectedSignatures: newCollectedSignatures,
          }
        })

        return NextResponse.json({
          success: true,
          status: 'complete',
          message: 'BRL payment completed successfully via PIX.'
        })
      }
    } else {
      // Still need more signatures
      newStatus = `pending_signature_${newCollectedSignatures + 1}`
    }

    // Update transaction
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: newStatus,
        collectedSignatures: newCollectedSignatures,
      }
    })

    return NextResponse.json({
      success: true,
      status: newStatus,
      collectedSignatures: newCollectedSignatures,
      requiredSignatures: transaction.requiredSignatures,
      message: newCollectedSignatures >= transaction.requiredSignatures 
        ? 'Payment fully signed and processing'
        : `Signature added. Need ${transaction.requiredSignatures - newCollectedSignatures} more signature(s).`
    })

  } catch (error) {
    console.error('Sign payment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}