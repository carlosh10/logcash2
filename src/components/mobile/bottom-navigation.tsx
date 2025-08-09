'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Send, PenTool, Wallet, User } from 'lucide-react'

interface NavItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  route: string
  badge?: number
}

interface BottomNavigationProps {
  pendingApprovals?: number
}

export function BottomNavigation({ pendingApprovals = 0 }: BottomNavigationProps) {
  const pathname = usePathname()

  const tabs: NavItem[] = [
    { icon: Home, label: 'Home', route: '/dashboard' },
    { icon: Send, label: 'Send', route: '/send-payment' },
    { icon: PenTool, label: 'Sign', route: '/approvals', badge: pendingApprovals },
    { icon: Wallet, label: 'Wallet', route: '/wallet' },
    { icon: User, label: 'Profile', route: '/profile' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.route
          const Icon = tab.icon

          return (
            <Link
              key={tab.route}
              href={tab.route}
              className="flex flex-col items-center justify-center p-2 touch-target min-w-[60px]"
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 ${
                    isActive ? 'text-hermes-orange' : 'text-old-money-gray'
                  }`}
                />
                {tab.badge && tab.badge > 0 && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </div>
                )}
              </div>
              <span
                className={`text-xs mt-1 font-medium ${
                  isActive ? 'text-hermes-orange' : 'text-old-money-gray'
                }`}
              >
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}