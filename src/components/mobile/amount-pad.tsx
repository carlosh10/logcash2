'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { Delete } from 'lucide-react'

interface AmountPadProps {
  value: string
  onChange: (value: string) => void
  currency: 'BRL' | 'USD'
  maxAmount?: number
}

export function AmountPad({ value, onChange, currency, maxAmount = 999999999 }: AmountPadProps) {
  const handleNumberClick = (num: string) => {
    const newValue = value + num
    const numericValue = parseFloat(newValue) / 100
    
    if (numericValue <= maxAmount) {
      onChange(newValue)
    }
  }

  const handleDelete = () => {
    const newValue = value.slice(0, -1)
    onChange(newValue)
  }

  const handleClear = () => {
    onChange('')
  }

  const getFormattedAmount = () => {
    if (!value) return formatCurrency(0, currency)
    const numericValue = parseFloat(value) / 100
    return formatCurrency(numericValue, currency)
  }

  const numbers = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['00', '0', 'delete']
  ]

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg">
      {/* Amount Display */}
      <div className="text-center mb-8">
        <div className="amount-display mb-2">
          {getFormattedAmount()}
        </div>
        <div className="text-sm text-old-money-gray">
          {currency === 'BRL' ? 'Reais Brasileiros' : 'US Dollars'}
        </div>
      </div>

      {/* Number Pad */}
      <div className="grid grid-cols-3 gap-4">
        {numbers.flat().map((item, index) => (
          <button
            key={index}
            className={`
              h-16 rounded-2xl font-semibold text-xl transition-all duration-150 touch-target
              ${item === 'delete' 
                ? 'bg-gray-100 text-old-money-gray active:bg-gray-200' 
                : 'bg-hermes-cream text-old-money-navy active:bg-hermes-sand hover:bg-hermes-sand'
              }
            `}
            onClick={() => {
              if (item === 'delete') {
                handleDelete()
              } else {
                handleNumberClick(item)
              }
            }}
          >
            {item === 'delete' ? (
              <Delete className="w-6 h-6 mx-auto" />
            ) : (
              item
            )}
          </button>
        ))}
      </div>

      {/* Clear Button */}
      {value && (
        <button
          className="w-full mt-4 py-3 text-hermes-orange font-medium rounded-2xl bg-hermes-cream active:bg-hermes-sand transition-colors"
          onClick={handleClear}
        >
          Clear
        </button>
      )}
    </div>
  )
}