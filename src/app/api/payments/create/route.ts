import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { mockFireblocks } from '@/lib/mock-fireblocks'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      currency,
      amount,
      recipientName,
      recipientAccount,
      invoiceNumber,
      shipmentNumber,
      description
    } = body

    // Get payment account
    const paymentAccount = await prisma.paymentAccount.findFirst({
      where: {
        companyId: session.user.companyId
      },
      include: {
        mpcWallet: true
      }
    })

    if (!paymentAccount) {
      return NextResponse.json({ error: 'Payment account not found' }, { status: 404 })
    }

    // Check balance
    const balance = currency === 'BRL' ? paymentAccount.balanceBRL : paymentAccount.balanceUSD
    if (balance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    let fireblocksTransactionId = null
    let blockchainAsset: 'USDC' | 'USDT' | null = null

    // Create Fireblocks transaction for USD payments
    if (currency === 'USD' && paymentAccount.mpcWallet) {
      blockchainAsset = 'USDC' // Default to USDC
      const fireblocksTransaction = await mockFireblocks.createTransaction({
        vaultId: paymentAccount.mpcWallet.vaultId,
        amount: amount.toString(),
        destination: recipientAccount,
        asset: blockchainAsset
      })
      fireblocksTransactionId = fireblocksTransaction.txId
    }

    // Calculate fees
    const serviceFee = amount * 0.0025 // 0.25% service fee
    const networkFee = currency === 'USD' ? 2.5 : 0 // Network fee only for USD

    // Create transaction in database
    const transaction = await prisma.transaction.create({
      data: {
        accountId: paymentAccount.id,
        type: 'send',
        currency,
        amount,
        status: 'pending_signature_1',
        recipientName,
        recipientAccount,
        invoiceNumber,
        shipmentNumber,
        description,
        fireblocksTransactionId,
        requiredSignatures: 2,
        collectedSignatures: 0,
        serviceFee,
        networkFee,
      }
    })

    // Auto-add first signature from the initiator
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { mpcKeyShare: true }
    })

    if (user?.mpcKeyShare) {
      await prisma.paymentApproval.create({
        data: {
          transactionId: transaction.id,
          approverUserId: session.user.id,
          signatureLevel: 1,
          mpcSignature: `sig_1_${transaction.id}_${Date.now()}`,
        }
      })

      // Add signature to Fireblocks if USD payment
      if (fireblocksTransactionId && user.mpcKeyShare) {
        try {
          await mockFireblocks.signTransaction(
            fireblocksTransactionId,
            session.user.id,
            user.mpcKeyShare
          )
        } catch (error) {
          console.error('Fireblocks signature error:', error)
        }
      }

      // Update transaction status
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'pending_signature_2',
          collectedSignatures: 1
        }
      })
    }

    return NextResponse.json({
      success: true,
      transactionId: transaction.id,
      fireblocksTransactionId,
      status: 'pending_signature_2',
      message: 'Payment created and automatically signed. Waiting for second signature.'
    })

  } catch (error) {
    console.error('Create payment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}