export type BankTransferDisplay = {
  bankTransferEnabled: boolean
  configured: boolean
  bankName?: string
  branchName?: string
  accountNumber?: string
  accountHolder?: string
  iban?: string
  currency?: string
  referenceNote?: string
}

export type BankTransferInfo = {
  bankName: string
  accountHolder: string
  iban: string
  ibanCompact: string
  branchName?: string | null
  accountNumber?: string | null
  instructions?: string | null
  paymentReference: string
  orderTotal: number
  currency: string
  amountFormatted: string
}

export type PaytrStartResponse = {
  iframe_token: string
}
