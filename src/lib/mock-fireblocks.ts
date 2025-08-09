import { generateId, generateAddress, generateHash } from './utils'

export interface FireblocksVault {
  vaultId: string
  walletAddress: string
  threshold: number
  maxSigners: number
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING'
  createdAt: Date
}

export interface FireblocksTransaction {
  txId: string
  vaultId: string
  status: 'PENDING_SIGNATURE' | 'READY_TO_BROADCAST' | 'SUBMITTED' | 'COMPLETED' | 'FAILED'
  requiredSignatures: number
  collectedSignatures: number
  signatureStatus: Array<{
    userId: string
    timestamp: Date
    keyShare: string
  }>
  amount: string
  destination: string
  asset: 'USDC' | 'USDT'
  networkFee: string
  blockchainTxHash?: string
  estimatedTime?: string
  createdAt: Date
}

export interface SignatureResult {
  txId: string
  signatureAdded: boolean
  collectedSignatures: number
  status: 'PENDING_SIGNATURE' | 'READY_TO_BROADCAST'
}

export interface BroadcastResult {
  txId: string
  blockchainTxHash: string
  status: 'SUBMITTED'
  estimatedTime: string
}

class MockFireblocks {
  private vaults = new Map<string, FireblocksVault>()
  private transactions = new Map<string, FireblocksTransaction>()

  async createVault(companyId: string): Promise<FireblocksVault> {
    const vault: FireblocksVault = {
      vaultId: `vault_${generateId()}`,
      walletAddress: `0x${generateAddress()}`,
      threshold: 2,
      maxSigners: 3,
      status: 'ACTIVE',
      createdAt: new Date(),
    }

    this.vaults.set(vault.vaultId, vault)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return vault
  }

  async createTransaction(params: {
    vaultId: string
    amount: string
    destination: string
    asset: 'USDC' | 'USDT'
  }): Promise<FireblocksTransaction> {
    const vault = this.vaults.get(params.vaultId)
    if (!vault) {
      throw new Error(`Vault ${params.vaultId} not found`)
    }

    const transaction: FireblocksTransaction = {
      txId: `fb_tx_${generateId()}`,
      vaultId: params.vaultId,
      status: 'PENDING_SIGNATURE',
      requiredSignatures: 2,
      collectedSignatures: 0,
      signatureStatus: [],
      amount: params.amount,
      destination: params.destination,
      asset: params.asset,
      networkFee: this.calculateNetworkFee(params.asset),
      createdAt: new Date(),
    }

    this.transactions.set(transaction.txId, transaction)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 150))
    
    return transaction
  }

  async signTransaction(txId: string, userId: string, keyShare: string): Promise<SignatureResult> {
    const transaction = this.transactions.get(txId)
    if (!transaction) {
      throw new Error(`Transaction ${txId} not found`)
    }

    if (transaction.status !== 'PENDING_SIGNATURE') {
      throw new Error(`Transaction ${txId} is not pending signature`)
    }

    // Check if user already signed
    const existingSignature = transaction.signatureStatus.find(sig => sig.userId === userId)
    if (existingSignature) {
      throw new Error(`User ${userId} has already signed this transaction`)
    }

    // Add signature
    transaction.signatureStatus.push({
      userId,
      timestamp: new Date(),
      keyShare,
    })
    
    transaction.collectedSignatures = transaction.signatureStatus.length

    // Update status if we have enough signatures
    if (transaction.collectedSignatures >= transaction.requiredSignatures) {
      transaction.status = 'READY_TO_BROADCAST'
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200))

    return {
      txId,
      signatureAdded: true,
      collectedSignatures: transaction.collectedSignatures,
      status: transaction.status as 'PENDING_SIGNATURE' | 'READY_TO_BROADCAST',
    }
  }

  async broadcastTransaction(txId: string): Promise<BroadcastResult> {
    const transaction = this.transactions.get(txId)
    if (!transaction) {
      throw new Error(`Transaction ${txId} not found`)
    }

    if (transaction.status !== 'READY_TO_BROADCAST') {
      throw new Error(`Transaction ${txId} is not ready to broadcast`)
    }

    // Generate blockchain transaction hash
    const blockchainTxHash = `0x${generateHash()}`
    transaction.blockchainTxHash = blockchainTxHash
    transaction.status = 'SUBMITTED'
    transaction.estimatedTime = '2-5 minutes'

    // Simulate blockchain confirmation after delay
    setTimeout(() => {
      if (this.transactions.has(txId)) {
        const tx = this.transactions.get(txId)!
        tx.status = 'COMPLETED'
      }
    }, 30000) // 30 seconds for demo

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))

    return {
      txId,
      blockchainTxHash,
      status: 'SUBMITTED',
      estimatedTime: '2-5 minutes',
    }
  }

  async getTransaction(txId: string): Promise<FireblocksTransaction | null> {
    const transaction = this.transactions.get(txId)
    if (!transaction) {
      return null
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 50))
    
    return transaction
  }

  async getVault(vaultId: string): Promise<FireblocksVault | null> {
    const vault = this.vaults.get(vaultId)
    if (!vault) {
      return null
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 50))
    
    return vault
  }

  async getVaultBalance(vaultId: string): Promise<{
    USDC: string
    USDT: string
  }> {
    const vault = this.vaults.get(vaultId)
    if (!vault) {
      throw new Error(`Vault ${vaultId} not found`)
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))

    // Return mock balances
    return {
      USDC: (Math.random() * 100000).toFixed(2),
      USDT: (Math.random() * 50000).toFixed(2),
    }
  }

  private calculateNetworkFee(asset: 'USDC' | 'USDT'): string {
    // Mock network fees based on asset
    const baseFee = asset === 'USDC' ? 2.5 : 3.0
    const variation = (Math.random() - 0.5) * 1.0 // ±$0.50 variation
    return (baseFee + variation).toFixed(2)
  }

  // Utility method to simulate webhook notifications
  simulateWebhook(txId: string, status: string) {
    console.log(`[MOCK WEBHOOK] Transaction ${txId} status: ${status}`)
    // In a real implementation, this would call your webhook endpoint
  }
}

// Singleton instance
export const mockFireblocks = new MockFireblocks()

// Helper functions for testing
export const createMockVault = async (companyId: string) => {
  return await mockFireblocks.createVault(companyId)
}

export const createMockTransaction = async (params: {
  vaultId: string
  amount: string
  destination: string
  asset: 'USDC' | 'USDT'
}) => {
  return await mockFireblocks.createTransaction(params)
}

export const signMockTransaction = async (txId: string, userId: string, keyShare: string) => {
  return await mockFireblocks.signTransaction(txId, userId, keyShare)
}

export const broadcastMockTransaction = async (txId: string) => {
  return await mockFireblocks.broadcastTransaction(txId)
}