'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Eye, EyeOff } from 'lucide-react'

interface BalanceCardProps {
  currency: 'BRL' | 'USD'
  amount: number
  isVisible: boolean
  onToggleVisibility: () => void
  tier: string
}

export function BalanceCard({ currency, amount, isVisible, onToggleVisibility, tier }: BalanceCardProps) {
  const currencyIcon = currency === 'BRL' ? '🇧🇷' : '🇺🇸'
  const tierColor = getTierColor(tier)
  
  return (
    <Card className="relative overflow-hidden border-0 shadow-lg">
      <div className={`absolute top-0 left-0 w-full h-1 ${tierColor}`} />
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{currencyIcon}</span>
            <span className="text-lg font-semibold text-old-money-gray">
              {currency}
            </span>
          </div>
          <button
            onClick={onToggleVisibility}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-target"
          >
            {isVisible ? (
              <EyeOff className="w-5 h-5 text-old-money-gray" />
            ) : (
              <Eye className="w-5 h-5 text-old-money-gray" />
            )}
          </button>
        </div>
        
        <div className="space-y-2">
          {isVisible ? (
            <div className="amount-display">
              {formatCurrency(amount, currency)}
            </div>
          ) : (
            <div className="amount-display">
              {currency === 'BRL' ? 'R$ •••••' : '$ •••••'}
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-old-money-gray">Available</span>
            <span className={`text-xs px-2 py-1 rounded-full ${tierColor} text-white`}>
              {tier.toUpperCase()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function getTierColor(tier: string): string {
  switch (tier.toLowerCase()) {
    case 'platinum':
      return 'bg-gradient-to-r from-gray-400 to-gray-600'
    case 'gold':
      return 'bg-gradient-to-r from-old-money-gold to-yellow-600'
    case 'silver':
      return 'bg-gradient-to-r from-gray-300 to-gray-500'
    default:
      return 'bg-gradient-to-r from-orange-400 to-orange-600'
  }
}