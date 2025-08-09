'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password: 'demo', // For demo purposes
        redirect: false,
      })

      if (result?.ok) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail)
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: demoEmail,
        password: 'demo',
        redirect: false,
      })

      if (result?.ok) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Demo login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-hermes-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="w-16 h-16 bg-hermes-gradient rounded-3xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">L</span>
          </div>
          <h1 className="text-3xl font-bold text-old-money-navy">Log.Cash</h1>
          <p className="text-old-money-gray mt-2">B2B Payment Platform</p>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Sign in to access your payment dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-old-money-navy mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-mobile"
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Demo Users */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Demo Users</span>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleDemoLogin('carlos@logcomex.com')}
                disabled={isLoading}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-hermes-light rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-white">CS</span>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium">Carlos Silva</div>
                    <div className="text-xs text-gray-500">Approver • Gold Tier</div>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleDemoLogin('maria@logcomex.com')}
                disabled={isLoading}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-old-money-sage rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-white">MS</span>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium">Maria Santos</div>
                    <div className="text-xs text-gray-500">Approver • Gold Tier</div>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-old-money-gray">
          Demo environment for Logcomex internal use
        </p>
      </div>
    </div>
  )
}