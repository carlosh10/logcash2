'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SwipeableCard } from '@/components/mobile/swipeable-card'
import { BottomNavigation } from '@/components/mobile/bottom-navigation'
import { ArrowLeft, Shield, CheckCircle2, Fingerprint } from 'lucide-react'

interface PendingTransaction {
  id: string
  currency: 'BRL' | 'USD'
  amount: number
  recipientName: string
  recipientAccount?: string
  invoiceNumber?: string
  shipmentNumber?: string
  createdAt: string
  requiredSignatures: number
  collectedSignatures: number
  approvals: Array<{
    approver: {
      name: string
    }
    signatureLevel: number
  }>
}

export default function ApprovalsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [processingTxId, setProcessingTxId] = useState<string | null>(null)
  const [showBiometric, setShowBiometric] = useState(false)
  const [pendingAction, setPendingAction] = useState<{
    action: 'approve' | 'reject'
    transactionId: string
  } | null>(null)

  const { data: pendingTransactions, isLoading } = useQuery<PendingTransaction[]>({
    queryKey: ['pending-approvals'],
    queryFn: async () => {
      const response = await fetch('/api/payments/pending')
      if (!response.ok) throw new Error('Failed to fetch pending transactions')
      return response.json()
    },
    enabled: !!session,
    refetchInterval: 5000, // Refresh every 5 seconds
  })

  const signTransactionMutation = useMutation({
    mutationFn: async ({ transactionId, action }: { transactionId: string, action: 'approve' | 'reject' }) => {
      const response = await fetch('/api/payments/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, action }),
      })
      if (!response.ok) throw new Error('Failed to sign transaction')
      return response.json()
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setProcessingTxId(null)
      setShowBiometric(false)
      setPendingAction(null)
      
      if (variables.action === 'approve' && data.status === 'broadcasting') {
        // Show success message or redirect to transaction detail
        router.push(`/transaction/${variables.transactionId}?signed=true`)
      }
    },
    onError: () => {
      setProcessingTxId(null)
      setShowBiometric(false)
      setPendingAction(null)
    }
  })

  const handleBiometricAuth = async () => {
    if (!pendingAction) return

    // Simulate biometric authentication
    setShowBiometric(false)
    setProcessingTxId(pendingAction.transactionId)
    
    // Simulate biometric delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    signTransactionMutation.mutate(pendingAction)
  }

  const handleApprove = (transactionId: string) => {
    setPendingAction({ action: 'approve', transactionId })
    setShowBiometric(true)
  }

  const handleReject = (transactionId: string) => {
    setPendingAction({ action: 'reject', transactionId })
    setShowBiometric(true)
  }

  const handleView = (transactionId: string) => {
    router.push(`/transaction/${transactionId}`)
  }

  useEffect(() => {
    if (!session) {
      router.push('/login')
    }
  }, [session, router])

  if (!session) {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-hermes-cream flex items-center justify-center">
        <div className="animate-pulse-subtle">
          <Shield className="w-16 h-16 text-hermes-orange mx-auto mb-4" />
          <p className="text-old-money-gray">Loading approvals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-hermes-cream pb-20">
      <div className="mobile-container">
        {/* Header */}
        <div className="flex items-center justify-between py-6 safe-area-top">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 hover:bg-white rounded-xl transition-colors touch-target"
          >
            <ArrowLeft className="w-6 h-6 text-old-money-navy" />
          </button>
          <h1 className="text-xl font-bold text-old-money-navy">Approvals</h1>
          <div className="w-10" />
        </div>

        {/* MPC Security Info */}
        <Card className="mb-6 border-l-4 border-l-hermes-orange">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-hermes-orange" />
              <div>
                <h3 className="font-semibold text-old-money-navy">MPC Multi-Signature</h3>
                <p className="text-sm text-old-money-gray">
                  All payments require 2-of-3 signatures for maximum security
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Transactions */}
        {pendingTransactions && pendingTransactions.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-old-money-navy">
              Pending Signatures ({pendingTransactions.length})
            </h2>
            
            {pendingTransactions.map((transaction) => (
              <SwipeableCard
                key={transaction.id}
                transaction={{
                  ...transaction,
                  createdAt: new Date(transaction.createdAt)
                }}
                onApprove={handleApprove}
                onReject={handleReject}
                onView={handleView}
                isProcessing={processingTxId === transaction.id}
              />
            ))}
            
            <div className="mt-6 p-4 bg-white rounded-2xl border border-hermes-sand/20">
              <div className="text-center">
                <CheckCircle2 className="w-8 h-8 text-old-money-sage mx-auto mb-2" />
                <p className="text-sm text-old-money-gray">
                  Swipe right to approve, left to reject
                </p>
                <p className="text-xs text-old-money-gray mt-1">
                  Biometric authentication required for all signatures
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <CheckCircle2 className="w-16 h-16 text-old-money-sage mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-old-money-navy mb-2">
              All Caught Up!
            </h2>
            <p className="text-old-money-gray mb-6">
              No pending payments require your signature
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        )}
      </div>

      {/* Biometric Authentication Modal */}
      {showBiometric && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle className="text-center">
                {pendingAction?.action === 'approve' ? 'Approve Payment' : 'Reject Payment'}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="w-20 h-20 bg-hermes-gradient rounded-full flex items-center justify-center mx-auto">
                <Fingerprint className="w-10 h-10 text-white" />
              </div>
              
              <div>
                <p className="text-old-money-navy font-medium mb-2">
                  Touch ID or Face ID Required
                </p>
                <p className="text-sm text-old-money-gray">
                  Please authenticate to {pendingAction?.action} this payment
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleBiometricAuth}
                  className="w-full"
                  disabled={signTransactionMutation.isPending}
                >
                  {signTransactionMutation.isPending ? 'Authenticating...' : 'Authenticate'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowBiometric(false)
                    setPendingAction(null)
                  }}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <BottomNavigation pendingApprovals={pendingTransactions?.length || 0} />
    </div>
  )
}