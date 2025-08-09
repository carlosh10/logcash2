'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AmountPad } from '@/components/mobile/amount-pad'
import { BottomNavigation } from '@/components/mobile/bottom-navigation'
import { BottomSheet } from '@/components/mobile/bottom-sheet'
import { 
  ArrowLeft, 
  DollarSign, 
  ArrowRight,
  Copy,
  QrCode,
  RefreshCw,
  CheckCircle2
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface ConversionData {
  fxRate: number
  fee: number
  pixKey: string
}

export default function AddUsdPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [brlAmount, setBrlAmount] = useState('')
  const [showQrSheet, setShowQrSheet] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pixCopied, setPixCopied] = useState(false)

  const { data: conversionData } = useQuery<ConversionData>({
    queryKey: ['fx-conversion'],
    queryFn: async () => {
      const response = await fetch('/api/fx/rates')
      if (!response.ok) throw new Error('Failed to fetch conversion data')
      return response.json()
    },
    enabled: !!session,
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const getBrlNumericAmount = () => {
    return brlAmount ? parseFloat(brlAmount) / 100 : 0
  }

  const getUsdAmount = () => {
    const brlValue = getBrlNumericAmount()
    const rate = conversionData?.fxRate || 5.2
    return brlValue / rate
  }

  const getFee = () => {
    const brlValue = getBrlNumericAmount()
    const feeRate = conversionData?.fee || 0.015 // 1.5%
    return brlValue * feeRate
  }

  const getNetBrlAmount = () => {
    return getBrlNumericAmount() + getFee()
  }

  const handleContinue = () => {
    if (getBrlNumericAmount() < 1000) return // Minimum R$ 1,000
    setShowQrSheet(true)
  }

  const copyPixKey = async () => {
    const pixKey = conversionData?.pixKey || '12345678000190'
    try {
      await navigator.clipboard.writeText(pixKey)
      setPixCopied(true)
      setTimeout(() => setPixCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy PIX key:', error)
    }
  }

  const simulatePixPayment = () => {
    setShowQrSheet(false)
    setShowConfirmation(true)
    
    // Simulate processing time
    setTimeout(() => {
      router.push('/dashboard?usd_added=true')
    }, 3000)
  }

  useEffect(() => {
    if (!session) {
      router.push('/login')
    }
  }, [session, router])

  if (!session) {
    return null
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
          <h1 className="text-xl font-bold text-old-money-navy">Add USD</h1>
          <button className="p-2 hover:bg-white rounded-xl transition-colors touch-target">
            <RefreshCw className="w-5 h-5 text-old-money-gray" />
          </button>
        </div>

        {/* Conversion Info */}
        <Card className="mb-6 border-l-4 border-l-hermes-orange">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-old-money-gray">Exchange Rate (BRL → USD)</span>
              <span className="font-semibold text-old-money-navy">
                {conversionData?.fxRate.toFixed(4) || '5.2000'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-old-money-gray">Conversion Fee</span>
              <span className="font-semibold text-old-money-navy">
                {((conversionData?.fee || 0.015) * 100).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Amount Input */}
        <div className="mb-6">
          <AmountPad
            value={brlAmount}
            onChange={setBrlAmount}
            currency="BRL"
            maxAmount={500000} // Max R$ 500k per conversion
          />
        </div>

        {/* Conversion Preview */}
        {brlAmount && getBrlNumericAmount() > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-center text-lg">Conversion Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-hermes-cream rounded-2xl">
                <div className="text-center">
                  <div className="text-sm text-old-money-gray mb-1">You Send</div>
                  <div className="font-bold text-xl text-old-money-navy">
                    {formatCurrency(getNetBrlAmount(), 'BRL')}
                  </div>
                  <div className="text-xs text-old-money-gray">
                    (includes {formatCurrency(getFee(), 'BRL')} fee)
                  </div>
                </div>

                <div className="px-4">
                  <ArrowRight className="w-6 h-6 text-hermes-orange" />
                </div>

                <div className="text-center">
                  <div className="text-sm text-old-money-gray mb-1">You Receive</div>
                  <div className="font-bold text-xl text-hermes-orange">
                    {formatCurrency(getUsdAmount(), 'USD')}
                  </div>
                  <div className="text-xs text-old-money-gray">in your USD account</div>
                </div>
              </div>

              <div className="text-center text-sm text-old-money-gray">
                Rate: 1 USD = {conversionData?.fxRate.toFixed(4) || '5.2000'} BRL
              </div>
            </CardContent>
          </Card>
        )}

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={getBrlNumericAmount() < 1000}
          className="w-full mb-4"
        >
          {getBrlNumericAmount() < 1000
            ? 'Minimum R$ 1,000'
            : `Continue with PIX Payment`
          }
        </Button>

        {getBrlNumericAmount() >= 1000 && (
          <div className="text-center text-sm text-old-money-gray">
            You'll pay via PIX and receive USD in ~5 minutes
          </div>
        )}
      </div>

      {/* PIX Payment Sheet */}
      <BottomSheet
        isOpen={showQrSheet}
        onClose={() => setShowQrSheet(false)}
        title="PIX Payment"
        className="max-h-[80vh]"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-48 h-48 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-24 h-24 text-white" />
            </div>
            <p className="text-sm text-old-money-gray">
              Scan this QR code with your banking app
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-old-money-gray">Amount to Pay</span>
              <span className="font-semibold text-old-money-navy">
                {formatCurrency(getNetBrlAmount(), 'BRL')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-old-money-gray">PIX Key</span>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm text-old-money-navy">
                  {conversionData?.pixKey || '12345678000190'}
                </span>
                <button
                  onClick={copyPixKey}
                  className="p-1 hover:bg-gray-100 rounded touch-target"
                >
                  <Copy className="w-4 h-4 text-hermes-orange" />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button onClick={simulatePixPayment} className="w-full">
              I've Made the PIX Payment
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowQrSheet(false)}
              className="w-full"
            >
              Cancel
            </Button>
          </div>

          <div className="text-center text-xs text-old-money-gray">
            After payment confirmation, USD will be added to your account within 5 minutes
          </div>
        </div>
      </BottomSheet>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-old-money-sage rounded-full flex items-center justify-center mx-auto animate-bounce-subtle">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              
              <div>
                <h3 className="font-semibold text-old-money-navy mb-2">
                  Processing Payment
                </h3>
                <p className="text-sm text-old-money-gray">
                  Your PIX payment is being confirmed. USD will be added to your account shortly.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-hermes-gradient h-2 rounded-full animate-pulse" style={{width: '75%'}} />
                </div>
                <p className="text-xs text-old-money-gray">
                  Processing... Please wait
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <BottomNavigation />
    </div>
  )
}