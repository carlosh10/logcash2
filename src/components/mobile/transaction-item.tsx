'use client'

import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2 } from 'lucide-react'

interface Transaction {
  id: string
  type: 'send' | 'receive' | 'conversion'
  currency: 'BRL' | 'USD'
  amount: number
  status: string
  recipientName?: string
  createdAt: Date
  requiredSignatures?: number
  collectedSignatures?: number
}

interface TransactionItemProps {
  transaction: Transaction
  onClick?: () => void
}

export function TransactionItem({ transaction, onClick }: TransactionItemProps) {
  const isOutgoing = transaction.type === 'send'
  const isComplete = transaction.status === 'complete'
  const isPending = transaction.status.includes('pending')
  
  const statusIcon = isComplete ? (
    <CheckCircle2 className="w-5 h-5 text-old-money-sage" />
  ) : (
    <Clock className="w-5 h-5 text-yellow-600" />
  )

  const transactionIcon = isOutgoing ? (
    <ArrowUpRight className="w-5 h-5 text-hermes-orange" />
  ) : (
    <ArrowDownLeft className="w-5 h-5 text-old-money-sage" />
  )

  const getSignatureStatus = () => {
    if (transaction.requiredSignatures && transaction.collectedSignatures !== undefined) {
      return `${transaction.collectedSignatures}/${transaction.requiredSignatures} signatures`
    }
    return null
  }

  return (
    <div
      className="flex items-center justify-between p-4 bg-white rounded-2xl border border-hermes-sand/20 active:bg-gray-50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-hermes-cream rounded-2xl flex items-center justify-center">
          {transactionIcon}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-old-money-navy text-sm">
              {isOutgoing ? '→' : '←'} {transaction.recipientName || 'Unknown'}
            </span>
            {statusIcon}
          </div>
          
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs text-old-money-gray">
              {formatDate(transaction.createdAt)}
            </span>
            {isPending && (
              <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                {getSignatureStatus() || 'Pending'}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="text-right">
        <div className={`font-bold ${isOutgoing ? 'text-hermes-orange' : 'text-old-money-sage'}`}>
          {isOutgoing ? '-' : '+'}{formatCurrency(transaction.amount, transaction.currency)}
        </div>
        <div className="text-xs text-old-money-gray mt-1">
          {transaction.currency}
        </div>
      </div>
    </div>
  )
}