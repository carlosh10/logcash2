import './globals.css'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import { Providers } from '@/components/providers'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Log.Cash - B2B Payment Platform',
  description: 'Dual currency payment platform for Brazilian import/export companies',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Log.Cash',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#F37021',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className={`${inter.className} antialiased overscroll-none`} suppressHydrationWarning>
        <Providers>
          <div className="min-h-screen bg-hermes-cream">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}