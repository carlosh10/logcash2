'use client'

import { useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BottomNavigation } from '@/components/mobile/bottom-navigation'
import { 
  ArrowLeft, 
  User, 
  Shield, 
  Settings, 
  HelpCircle, 
  LogOut,
  Building,
  Star,
  Key
} from 'lucide-react'

export default function ProfilePage() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session) {
      router.push('/login')
    }
  }, [session, router])

  if (!session) {
    return null
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' })
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
          <h1 className="text-xl font-bold text-old-money-navy">Profile</h1>
          <div className="w-10" />
        </div>

        <div className="space-y-6">
          {/* User Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-hermes-gradient rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {session.user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-old-money-navy">
                    {session.user.name}
                  </h2>
                  <p className="text-old-money-gray">{session.user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-hermes-cream rounded-2xl">
                  <Building className="w-6 h-6 text-hermes-orange mx-auto mb-1" />
                  <div className="text-xs text-old-money-gray">Company</div>
                  <div className="text-sm font-semibold text-old-money-navy">Logcomex</div>
                </div>
                <div className="text-center p-3 bg-hermes-cream rounded-2xl">
                  <Star className="w-6 h-6 text-old-money-gold mx-auto mb-1" />
                  <div className="text-xs text-old-money-gray">Tier</div>
                  <div className="text-sm font-semibold text-old-money-navy">
                    {(session.user as any).companyTier?.toUpperCase() || 'GOLD'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-hermes-orange" />
                <span>Account Permissions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-hermes-cream rounded-xl">
                <div className="flex items-center space-x-3">
                  <Key className="w-5 h-5 text-old-money-sage" />
                  <div>
                    <div className="font-medium text-old-money-navy">Payment Approval</div>
                    <div className="text-xs text-old-money-gray">Can sign transactions</div>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  (session.user as any).canApprove ? 'bg-old-money-sage' : 'bg-gray-400'
                }`} />
              </div>

              <div className="flex items-center justify-between p-3 bg-hermes-cream rounded-xl">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-hermes-orange" />
                  <div>
                    <div className="font-medium text-old-money-navy">MPC Key Share</div>
                    <div className="text-xs text-old-money-gray">Authorized signer</div>
                  </div>
                </div>
                <div className="w-3 h-3 bg-old-money-sage rounded-full" />
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-hermes-orange" />
                <span>Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 hover:bg-hermes-cream rounded-xl transition-colors">
                <div className="flex items-center space-x-3">
                  <Settings className="w-5 h-5 text-old-money-gray" />
                  <span className="text-old-money-navy">Account Settings</span>
                </div>
                <span className="text-old-money-gray">→</span>
              </button>

              <button className="w-full flex items-center justify-between p-3 hover:bg-hermes-cream rounded-xl transition-colors">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-old-money-gray" />
                  <span className="text-old-money-navy">Security Settings</span>
                </div>
                <span className="text-old-money-gray">→</span>
              </button>

              <button className="w-full flex items-center justify-between p-3 hover:bg-hermes-cream rounded-xl transition-colors">
                <div className="flex items-center space-x-3">
                  <HelpCircle className="w-5 h-5 text-old-money-gray" />
                  <span className="text-old-money-navy">Help & Support</span>
                </div>
                <span className="text-old-money-gray">→</span>
              </button>
            </CardContent>
          </Card>

          {/* App Info */}
          <Card>
            <CardContent className="p-4 text-center space-y-2">
              <div className="w-12 h-12 bg-hermes-gradient rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-white">L</span>
              </div>
              <h3 className="font-semibold text-old-money-navy">Log.Cash</h3>
              <p className="text-sm text-old-money-gray">Version 1.0.0</p>
              <p className="text-xs text-old-money-gray">
                B2B Payment Platform for Brazilian Import/Export Companies
              </p>
              <p className="text-xs text-old-money-gray">
                © 2024 Logcomex. All rights reserved.
              </p>
            </CardContent>
          </Card>

          {/* Sign Out */}
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center space-x-2 border-red-200 text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}