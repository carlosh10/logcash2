import { NextRequest, NextResponse } from 'next/server'
import { initializeMockData } from '@/lib/mock-data'

export async function POST(request: NextRequest) {
  try {
    console.log('Initializing mock data...')
    const result = await initializeMockData()
    
    if (result) {
      return NextResponse.json({
        success: true,
        message: 'Mock data initialized successfully',
        data: {
          company: result.company.name,
          users: result.users.length,
          transactions: result.transactions.length,
          mpcVault: result.paymentAccount.mpcWallet?.vaultId,
        }
      })
    } else {
      return NextResponse.json({
        success: true,
        message: 'Mock data already exists'
      })
    }
  } catch (error) {
    console.error('Init API error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to initialize mock data',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}