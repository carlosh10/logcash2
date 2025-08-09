'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Plus, ArrowRight, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BalanceCard } from '@/components/mobile/balance-card'
import { TransactionItem } from '@/components/mobile/transaction-item'
import { BottomNavigation } from '@/components/mobile/bottom-navigation'

interface DashboardData {
  balances: {
    brl: number
    usd: number
    tier: string
  }
  pendingTransactions: number
  recentTransactions: Array<{
    id: string
    type: 'send' | 'receive' | 'conversion'
    currency: 'BRL' | 'USD'
    amount: number
    status: string
    recipientName?: string
    createdAt: string
    requiredSignatures?: number
    collectedSignatures?: number
  }>
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [balancesVisible, setBalancesVisible] = useState(true)

  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard')
      if (!response.ok) throw new Error('Failed to fetch dashboard data')
      return response.json()
    },
    enabled: !!session,
  })

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
          <div className="w-16 h-16 bg-hermes-gradient rounded-3xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">L</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-hermes-cream pb-20">
      <div className="mobile-container">
        {/* Header */}
        <div className="flex items-center justify-between py-6 safe-area-top">
          <div>
            <h1 className="text-2xl font-bold text-old-money-navy">Log.Cash</h1>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-old-money-gray">Tier:</span>
              <span className="text-sm font-semibold text-old-money-gold">
                {dashboardData?.balances.tier?.toUpperCase() || 'GOLD'} ⭐
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-3 bg-white rounded-2xl shadow-sm touch-target">
              <Bell className="w-5 h-5 text-old-money-gray" />
            </button>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="space-y-4 mb-6">
          <h2 className="text-lg font-semibold text-old-money-navy">YOUR BALANCES</h2>
          
          <div className="space-y-4">
            <BalanceCard
              currency="BRL"
              amount={dashboardData?.balances.brl || 850000}
              isVisible={balancesVisible}
              onToggleVisibility={() => setBalancesVisible(!balancesVisible)}
              tier={dashboardData?.balances.tier || 'gold'}
            />
            
            <BalanceCard
              currency="USD"
              amount={dashboardData?.balances.usd || 125000}
              isVisible={balancesVisible}
              onToggleVisibility={() => setBalancesVisible(!balancesVisible)}
              tier={dashboardData?.balances.tier || 'gold'}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button
            className="h-16 text-base font-semibold"
            onClick={() => router.push('/add-usd')}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add USD
          </Button>
          
          <Button
            variant="secondary"
            className="h-16 text-base font-semibold"
            onClick={() => router.push('/send-payment')}
          >
            <ArrowRight className="w-5 h-5 mr-2" />
            Send Payment
          </Button>
        </div>

        {/* Pending Approvals */}
        {dashboardData && dashboardData.pendingTransactions > 0 && (
          <Card className="mb-6 border-l-4 border-l-yellow-400">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-old-money-navy">
                    PENDING APPROVALS ({dashboardData.pendingTransactions})
                  </h3>
                  <p className="text-sm text-old-money-gray">
                    Transactions waiting for your signature
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/approvals')}
                  className="text-hermes-orange"
                >
                  View All →
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-old-money-navy">RECENT ACTIVITY</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/transactions')}
              className="text-hermes-orange"
            >
              View All
            </Button>
          </div>
          
          <div className="space-y-3">
            {dashboardData?.recentTransactions?.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={{
                  ...transaction,
                  createdAt: new Date(transaction.createdAt)
                }}
                onClick={() => router.push(`/transaction/${transaction.id}`)}
              />
            )) || (
              // Fallback mock data
              <div className="space-y-3">
                <TransactionItem
                  transaction={{
                    id: '1',
                    type: 'receive',
                    currency: 'BRL',
                    amount: 50000,
                    status: 'pending_signature_2',
                    recipientName: 'Cliente Importador',
                    createdAt: new Date('2024-12-09T14:30:00.000Z'),
                    requiredSignatures: 2,
                    collectedSignatures: 1,
                  }}
                />
                <TransactionItem
                  transaction={{
                    id: '2',
                    type: 'send',
                    currency: 'USD',
                    amount: 18000,
                    status: 'complete',
                    recipientName: 'Shanghai Trading Co.',
                    createdAt: new Date('2024-12-09T12:30:00.000Z'),
                    requiredSignatures: 2,
                    collectedSignatures: 2,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNavigation pendingApprovals={dashboardData?.pendingTransactions || 0} />
    </div>
  )
}