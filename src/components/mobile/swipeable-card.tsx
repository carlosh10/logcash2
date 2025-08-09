'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Check, X, Clock, ArrowRight } from 'lucide-react'

interface PendingTransaction {
  id: string
  currency: 'BRL' | 'USD'
  amount: number
  recipientName: string
  recipientAccount?: string
  invoiceNumber?: string
  shipmentNumber?: string
  createdAt: Date
  requiredSignatures: number
  collectedSignatures: number
  approvals: Array<{
    approver: {
      name: string
    }
    signatureLevel: number
  }>
}

interface SwipeableCardProps {
  transaction: PendingTransaction
  onApprove: (transactionId: string) => void
  onReject: (transactionId: string) => void
  onView: (transactionId: string) => void
  isProcessing?: boolean
}

export function SwipeableCard({ 
  transaction, 
  onApprove, 
  onReject, 
  onView,
  isProcessing = false 
}: SwipeableCardProps) {
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const currentX = useRef(0)

  const getFirstApprover = () => {
    const firstApproval = transaction.approvals.find(a => a.signatureLevel === 1)
    return firstApproval?.approver.name || 'Unknown'
  }

  const needsSecondSignature = () => {
    return transaction.collectedSignatures === 1 && transaction.requiredSignatures === 2
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isProcessing) return
    
    setIsDragging(true)
    startX.current = e.touches[0].clientX
    currentX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isProcessing) return

    currentX.current = e.touches[0].clientX
    const deltaX = currentX.current - startX.current
    
    // Limit drag distance
    const maxDrag = 120
    const boundedDeltaX = Math.max(-maxDrag, Math.min(maxDrag, deltaX))
    
    setDragX(boundedDeltaX)
  }

  const handleTouchEnd = () => {
    if (!isDragging || isProcessing) return
    
    setIsDragging(false)
    
    const threshold = 60
    
    if (dragX > threshold) {
      // Swiped right - approve
      onApprove(transaction.id)
    } else if (dragX < -threshold) {
      // Swiped left - reject
      onReject(transaction.id)
    }
    
    // Reset position
    setDragX(0)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isProcessing) return
    
    setIsDragging(true)
    startX.current = e.clientX
    currentX.current = e.clientX
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isProcessing) return

    currentX.current = e.clientX
    const deltaX = currentX.current - startX.current
    const maxDrag = 120
    const boundedDeltaX = Math.max(-maxDrag, Math.min(maxDrag, deltaX))
    
    setDragX(boundedDeltaX)
  }

  const handleMouseUp = () => {
    if (!isDragging || isProcessing) return
    
    setIsDragging(false)
    
    const threshold = 60
    
    if (dragX > threshold) {
      onApprove(transaction.id)
    } else if (dragX < -threshold) {
      onReject(transaction.id)
    }
    
    setDragX(0)
  }

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging && !isProcessing) {
        currentX.current = e.clientX
        const deltaX = currentX.current - startX.current
        const maxDrag = 120
        const boundedDeltaX = Math.max(-maxDrag, Math.min(maxDrag, deltaX))
        setDragX(boundedDeltaX)
      }
    }

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleMouseUp()
      }
    }

    document.addEventListener('mousemove', handleGlobalMouseMove)
    document.addEventListener('mouseup', handleGlobalMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isDragging, dragX, isProcessing])

  return (
    <div className="relative overflow-hidden rounded-3xl">
      {/* Background Actions */}
      <div className="absolute inset-0 flex">
        {/* Approve Background */}
        <div className="flex-1 bg-old-money-sage flex items-center justify-start pl-6">
          <div className="flex items-center space-x-2 text-white">
            <Check className="w-6 h-6" />
            <span className="font-semibold">Approve</span>
          </div>
        </div>
        
        {/* Reject Background */}
        <div className="flex-1 bg-red-500 flex items-center justify-end pr-6">
          <div className="flex items-center space-x-2 text-white">
            <span className="font-semibold">Reject</span>
            <X className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Card */}
      <Card
        ref={cardRef}
        className={`relative z-10 border-0 shadow-lg transition-transform ${
          isProcessing ? 'opacity-60' : ''
        }`}
        style={{
          transform: `translateX(${dragX}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-bold text-lg text-hermes-orange">
                  {formatCurrency(transaction.amount, transaction.currency)}
                </span>
                <span className="text-sm text-old-money-gray">
                  {transaction.currency}
                </span>
              </div>
              
              <div className="text-sm font-semibold text-old-money-navy">
                to {transaction.recipientName}
              </div>
              
              {transaction.recipientAccount && (
                <div className="text-xs text-old-money-gray mt-1">
                  {transaction.recipientAccount.length > 30 
                    ? `${transaction.recipientAccount.slice(0, 15)}...${transaction.recipientAccount.slice(-10)}`
                    : transaction.recipientAccount
                  }
                </div>
              )}
            </div>

            <button
              onClick={() => onView(transaction.id)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowRight className="w-5 h-5 text-old-money-gray" />
            </button>
          </div>

          <div className="space-y-2">
            {transaction.invoiceNumber && (
              <div className="flex justify-between text-sm">
                <span className="text-old-money-gray">Invoice:</span>
                <span className="text-old-money-navy">{transaction.invoiceNumber}</span>
              </div>
            )}
            
            {transaction.shipmentNumber && (
              <div className="flex justify-between text-sm">
                <span className="text-old-money-gray">Shipment:</span>
                <span className="text-old-money-navy">{transaction.shipmentNumber}</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-old-money-gray">Created:</span>
              <span className="text-old-money-navy">{formatDate(transaction.createdAt)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-old-money-gray">First signature:</span>
              <span className="text-old-money-navy">{getFirstApprover()}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-600 font-medium">
                  {needsSecondSignature() ? 'Needs your signature' : 'Waiting for signatures'}
                </span>
              </div>
              
              <div className="text-xs text-old-money-gray">
                {transaction.collectedSignatures}/{transaction.requiredSignatures} signatures
              </div>
            </div>

            {!isProcessing && (
              <div className="mt-3 text-xs text-center text-old-money-gray">
                ← Swipe left to reject • Swipe right to approve →
              </div>
            )}

            {isProcessing && (
              <div className="mt-3 text-xs text-center text-hermes-orange">
                Processing signature...
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}