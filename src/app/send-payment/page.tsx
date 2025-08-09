'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AmountPad } from '@/components/mobile/amount-pad'
import { StepProgress } from '@/components/mobile/step-progress'
import { BottomNavigation } from '@/components/mobile/bottom-navigation'
import { ArrowLeft, Check } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Recipient {
  id: string
  name: string
  account: string
  type: 'frequent' | 'recent'
}

const mockRecipients: Recipient[] = [
  { id: '1', name: 'Shanghai Trading Co.', account: '0x742d35...af17', type: 'frequent' },
  { id: '2', name: 'Global Shipping Ltd', account: '0x8ba1f1...7002', type: 'frequent' },
  { id: '3', name: 'Fornecedor ABC', account: 'PIX: 12.345.678/0001-90', type: 'recent' },
  { id: '4', name: 'Importadora XYZ', account: 'PIX: 98.765.432/0001-10', type: 'recent' },
]

export default function SendPaymentPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedCurrency, setSelectedCurrency] = useState<'BRL' | 'USD'>('USD')
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null)
  const [amount, setAmount] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [shipmentNumber, setShipmentNumber] = useState('')
  const [description, setDescription] = useState('')

  const steps = [
    'Select Currency',
    'Choose Recipient',
    'Enter Amount',
    'Add Details',
    'Review & Sign'
  ]

  const createPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      })
      if (!response.ok) throw new Error('Failed to create payment')
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] })
      router.push(`/transaction/${data.transactionId}?created=true`)
    },
  })

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      router.push('/dashboard')
    }
  }

  const handleCreatePayment = async () => {
    if (!selectedRecipient || !amount) return

    const numericAmount = parseFloat(amount) / 100
    const paymentData = {
      currency: selectedCurrency,
      amount: numericAmount,
      recipientName: selectedRecipient.name,
      recipientAccount: selectedRecipient.account,
      invoiceNumber: invoiceNumber || undefined,
      shipmentNumber: shipmentNumber || undefined,
      description: description || undefined,
    }

    createPaymentMutation.mutate(paymentData)
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedCurrency
      case 2: return selectedRecipient
      case 3: return amount && parseFloat(amount) > 0
      case 4: return true // Details are optional
      case 5: return true
      default: return false
    }
  }

  return (
    <div className="min-h-screen bg-hermes-cream pb-20">
      <div className="mobile-container">
        {/* Header */}
        <div className="flex items-center justify-between py-6 safe-area-top">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-white rounded-xl transition-colors touch-target"
          >
            <ArrowLeft className="w-6 h-6 text-old-money-navy" />
          </button>
          <h1 className="text-xl font-bold text-old-money-navy">Send Payment</h1>
          <div className="w-10" />
        </div>

        {/* Progress */}
        <StepProgress
          currentStep={currentStep}
          totalSteps={5}
          steps={steps}
        />

        {/* Step Content */}
        <div className="space-y-6 mb-6">
          {/* Step 1: Currency Selection */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-lg font-semibold text-old-money-navy mb-4">
                Select Currency
              </h2>
              <div className="space-y-3">
                {(['USD', 'BRL'] as const).map((currency) => (
                  <Card
                    key={currency}
                    className={`cursor-pointer transition-all ${
                      selectedCurrency === currency
                        ? 'ring-2 ring-hermes-orange bg-hermes-cream'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedCurrency(currency)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">
                            {currency === 'USD' ? '🇺🇸' : '🇧🇷'}
                          </span>
                          <div>
                            <div className="font-semibold text-old-money-navy">
                              {currency === 'USD' ? 'US Dollar' : 'Brazilian Real'}
                            </div>
                            <div className="text-sm text-old-money-gray">
                              {currency}
                            </div>
                          </div>
                        </div>
                        {selectedCurrency === currency && (
                          <Check className="w-6 h-6 text-hermes-orange" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Recipient Selection */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-lg font-semibold text-old-money-navy mb-4">
                Choose Recipient
              </h2>
              <div className="space-y-3">
                {mockRecipients
                  .filter(r => selectedCurrency === 'USD' ? r.account.startsWith('0x') : r.account.startsWith('PIX'))
                  .map((recipient) => (
                  <Card
                    key={recipient.id}
                    className={`cursor-pointer transition-all ${
                      selectedRecipient?.id === recipient.id
                        ? 'ring-2 ring-hermes-orange bg-hermes-cream'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedRecipient(recipient)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-old-money-navy">
                            {recipient.name}
                          </div>
                          <div className="text-sm text-old-money-gray">
                            {recipient.account}
                          </div>
                          <div className="text-xs text-hermes-orange mt-1">
                            {recipient.type === 'frequent' ? 'Frequent' : 'Recent'}
                          </div>
                        </div>
                        {selectedRecipient?.id === recipient.id && (
                          <Check className="w-6 h-6 text-hermes-orange" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Amount Entry */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-lg font-semibold text-old-money-navy mb-4">
                Enter Amount
              </h2>
              <AmountPad
                value={amount}
                onChange={setAmount}
                currency={selectedCurrency}
                maxAmount={selectedCurrency === 'USD' ? 50000 : 200000}
              />
            </div>
          )}

          {/* Step 4: Details */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-lg font-semibold text-old-money-navy mb-4">
                Payment Details
              </h2>
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-old-money-navy mb-2">
                      Invoice Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="input-mobile"
                      placeholder="INV-2024-001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-old-money-navy mb-2">
                      Shipment Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={shipmentNumber}
                      onChange={(e) => setShipmentNumber(e.target.value)}
                      className="input-mobile"
                      placeholder="SHIP-GL-2024-001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-old-money-navy mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="input-mobile min-h-[100px] resize-none"
                      placeholder="Payment description..."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && selectedRecipient && (
            <div>
              <h2 className="text-lg font-semibold text-old-money-navy mb-4">
                Review & Sign
              </h2>
              <Card className="border-2 border-hermes-orange/20">
                <CardContent className="p-6 space-y-4">
                  <div className="text-center">
                    <div className="amount-display text-hermes-orange">
                      {formatCurrency(parseFloat(amount) / 100, selectedCurrency)}
                    </div>
                    <div className="text-sm text-old-money-gray mt-1">
                      to {selectedRecipient.name}
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-old-money-gray">Currency</span>
                      <span className="font-medium">{selectedCurrency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-old-money-gray">Recipient</span>
                      <span className="font-medium text-right">{selectedRecipient.account}</span>
                    </div>
                    {invoiceNumber && (
                      <div className="flex justify-between">
                        <span className="text-old-money-gray">Invoice</span>
                        <span className="font-medium">{invoiceNumber}</span>
                      </div>
                    )}
                    {shipmentNumber && (
                      <div className="flex justify-between">
                        <span className="text-old-money-gray">Shipment</span>
                        <span className="font-medium">{shipmentNumber}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-old-money-gray">Service Fee</span>
                      <span className="font-medium">
                        {formatCurrency(parseFloat(amount) / 100 * 0.0025, selectedCurrency)}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4 bg-hermes-cream/50 -mx-6 px-6 rounded-b-2xl">
                    <div className="text-sm text-old-money-gray mb-2">
                      ⚡ MPC Multi-Signature Required
                    </div>
                    <div className="text-sm text-old-money-navy">
                      This payment will require 2 signatures for security. Your signature will be collected automatically.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {currentStep < 5 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="w-full"
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={handleCreatePayment}
              disabled={createPaymentMutation.isPending}
              className="w-full"
            >
              {createPaymentMutation.isPending ? 'Creating Payment...' : 'Create Payment & Sign'}
            </Button>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}