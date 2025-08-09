'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BottomNavigation } from '@/components/mobile/bottom-navigation'
import { 
  ArrowLeft, 
  Wallet, 
  Shield, 
  ExternalLink, 
  Copy, 
  Users,
  Activity,
  Coins
} from 'lucide-react'
import { formatCurrency, truncateAddress } from '@/lib/utils'
import { useState } from 'react'

interface WalletData {
  mpcWallet: {
    vaultId: string
    walletId: string
    walletAddress: string
    provider: string
    threshold: number
    totalSigners: number
    status: string
  }
  balances: {
    USDC: string
    USDT: string
  }
  pendingTransactions: Array<{
    id: string
    status: string
    amount: string
    asset: string
    createdAt: string
  }>
  recentActivity: Array<{
    txHash: string
    amount: string
    asset: string
    status: string
    timestamp: string
  }>
}

export default function WalletPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [copiedAddress, setCopiedAddress] = useState(false)

  const { data: walletData, isLoading } = useQuery<WalletData>({
    queryKey: ['wallet-status'],
    queryFn: async () => {
      const response = await fetch('/api/wallet/status')
      if (!response.ok) throw new Error('Failed to fetch wallet data')
      return response.json()
    },
    enabled: !!session,
    refetchInterval: 10000, // Refresh every 10 seconds
  })

  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address)
      setCopiedAddress(true)
      setTimeout(() => setCopiedAddress(false), 2000)
    } catch (error) {
      console.error('Failed to copy address:', error)
    }
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
          <Wallet className="w-16 h-16 text-hermes-orange mx-auto mb-4" />
          <p className="text-old-money-gray">Loading wallet...</p>
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
          <h1 className="text-xl font-bold text-old-money-navy">MPC Wallet</h1>
          <div className="w-10" />
        </div>

        {walletData?.mpcWallet ? (
          <div className="space-y-6">
            {/* Vault Status */}
            <Card className="border-l-4 border-l-hermes-orange">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-6 h-6 text-hermes-orange" />
                  <span>Fireblocks Vault</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-old-money-gray">Status</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      walletData.mpcWallet.status === 'ACTIVE' 
                        ? 'bg-old-money-sage animate-pulse' 
                        : 'bg-gray-400'
                    }`} />
                    <span className="font-medium text-old-money-navy">
                      {walletData.mpcWallet.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-old-money-gray">Vault ID</span>
                  <span className="font-mono text-sm text-old-money-navy">
                    {truncateAddress(walletData.mpcWallet.vaultId, 8)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-old-money-gray">Multi-Sig Setup</span>
                  <span className="font-medium text-old-money-navy">
                    {walletData.mpcWallet.threshold}-of-{walletData.mpcWallet.totalSigners}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-old-money-gray">Provider</span>
                  <span className="font-medium text-old-money-navy capitalize">
                    {walletData.mpcWallet.provider}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Wallet Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wallet className="w-6 h-6 text-hermes-orange" />
                  <span>Ethereum Address</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-hermes-cream rounded-2xl p-4">
                  <div className="font-mono text-sm text-old-money-navy break-all mb-3">
                    {walletData.mpcWallet.walletAddress}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyAddress(walletData.mpcWallet.walletAddress)}
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {copiedAddress ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://etherscan.io/address/${walletData.mpcWallet.walletAddress}`, '_blank')}
                      className="flex-1"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Etherscan
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stablecoin Balances */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Coins className="w-6 h-6 text-hermes-orange" />
                  <span>Stablecoin Balances</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-hermes-cream rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">UC</span>
                    </div>
                    <div>
                      <div className="font-medium text-old-money-navy">USDC</div>
                      <div className="text-xs text-old-money-gray">USD Coin</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-old-money-navy">
                      ${parseFloat(walletData.balances.USDC || '0').toLocaleString()}
                    </div>
                    <div className="text-xs text-old-money-gray">USDC</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-hermes-cream rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">UT</span>
                    </div>
                    <div>
                      <div className="font-medium text-old-money-navy">USDT</div>
                      <div className="text-xs text-old-money-gray">Tether USD</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-old-money-navy">
                      ${parseFloat(walletData.balances.USDT || '0').toLocaleString()}
                    </div>
                    <div className="text-xs text-old-money-gray">USDT</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Signers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-6 h-6 text-hermes-orange" />
                  <span>Current Signers</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Carlos Silva', 'Maria Santos', 'João Oliveira'].map((signer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-hermes-cream rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-hermes-gradient rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {signer.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-old-money-navy">{signer}</div>
                          <div className="text-xs text-old-money-gray">Authorized Signer</div>
                        </div>
                      </div>
                      <div className="w-3 h-3 bg-old-money-sage rounded-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pending Blockchain Transactions */}
            {walletData.pendingTransactions && walletData.pendingTransactions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-6 h-6 text-hermes-orange" />
                    <span>Pending Transactions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {walletData.pendingTransactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <div>
                          <div className="font-medium text-old-money-navy">
                            {tx.amount} {tx.asset}
                          </div>
                          <div className="text-xs text-old-money-gray">
                            Status: {tx.status}
                          </div>
                        </div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Gas Fee Estimates */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-old-money-navy mb-3">Current Network Fees</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-old-money-gray">USDC Transfer</span>
                    <span className="text-old-money-navy">~$2.50</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-old-money-gray">USDT Transfer</span>
                    <span className="text-old-money-navy">~$3.20</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-old-money-gray">Network</span>
                    <span className="text-old-money-navy">Ethereum Mainnet</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-16">
            <Wallet className="w-16 h-16 text-old-money-gray mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-old-money-navy mb-2">
              No MPC Wallet Found
            </h2>
            <p className="text-old-money-gray mb-6">
              Contact your administrator to set up MPC wallet access
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  )
}