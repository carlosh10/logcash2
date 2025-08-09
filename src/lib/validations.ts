import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const paymentSchema = z.object({
  currency: z.enum(['BRL', 'USD'], {
    required_error: 'Currency is required',
  }),
  amount: z.number().positive('Amount must be greater than 0'),
  recipientName: z.string().min(1, 'Recipient name is required'),
  recipientAccount: z.string().min(1, 'Recipient account is required'),
  invoiceNumber: z.string().optional(),
  shipmentNumber: z.string().optional(),
  description: z.string().optional(),
})

export const fxConversionSchema = z.object({
  fromCurrency: z.enum(['BRL', 'USD']),
  toCurrency: z.enum(['BRL', 'USD']),
  amount: z.number().positive('Amount must be greater than 0'),
})

export const signatureSchema = z.object({
  transactionId: z.string().min(1, 'Transaction ID is required'),
  action: z.enum(['approve', 'reject']),
  mpcKeyShare: z.string().optional(),
})

export const userProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
})

export const companySchema = z.object({
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'Invalid CNPJ format'),
  name: z.string().min(1, 'Company name is required'),
  tier: z.enum(['bronze', 'silver', 'gold', 'platinum']).default('bronze'),
})

export const mpcWalletSchema = z.object({
  vaultId: z.string().min(1, 'Vault ID is required'),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  threshold: z.number().min(2, 'Minimum threshold is 2'),
  totalSigners: z.number().min(3, 'Minimum total signers is 3'),
})

export const pixPaymentSchema = z.object({
  pixKey: z.string().min(1, 'PIX key is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  description: z.string().optional(),
})

export const addressValidationSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
})

export const amountValidationSchema = z.object({
  amount: z.string().refine(
    (val) => {
      const num = parseFloat(val) / 100
      return !isNaN(num) && num > 0
    },
    'Invalid amount'
  ),
})

// Type exports
export type LoginInput = z.infer<typeof loginSchema>
export type PaymentInput = z.infer<typeof paymentSchema>
export type FxConversionInput = z.infer<typeof fxConversionSchema>
export type SignatureInput = z.infer<typeof signatureSchema>
export type UserProfileInput = z.infer<typeof userProfileSchema>
export type CompanyInput = z.infer<typeof companySchema>
export type MpcWalletInput = z.infer<typeof mpcWalletSchema>
export type PixPaymentInput = z.infer<typeof pixPaymentSchema>
export type AddressValidationInput = z.infer<typeof addressValidationSchema>
export type AmountValidationInput = z.infer<typeof amountValidationSchema>