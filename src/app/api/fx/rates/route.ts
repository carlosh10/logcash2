import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock FX rates - in production, this would fetch from a real FX API
    const mockRates = {
      fxRate: 5.2341 + (Math.random() - 0.5) * 0.1, // BRL per USD with some variation
      fee: 0.015, // 1.5% conversion fee
      pixKey: '12345678000190', // Company's PIX key (CNPJ format)
      spread: 0.02, // 2% spread
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(mockRates)
  } catch (error) {
    console.error('FX rates API error:', error)
    return NextResponse.json({ error: 'Failed to fetch FX rates' }, { status: 500 })
  }
}