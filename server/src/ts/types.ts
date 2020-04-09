export interface RegisterPayload {
  fullName: string
  email: string
  username: string
  password: string
  referrer?: string
}

export interface donorPayload {
  email: string
  amount: Number
  reference?: string
  userId: string
}

export interface LoginPayload {
  login: string
  password: string
}

export interface NewDepositPayload {
  userId: string
  amount: string
}

export interface WithdrawalRequestPayload {
  userId: string
  amount: string
  description?: string
}

export interface DepositUpdatePayload {
  txid: string
}

export interface NewUpdateDepositPayload {
  txid: string
  blockNumber: any
  status: any
  txInput: any
}

export interface InvestmentPayload {
  userId: string
  planId: string
  amount: string
  useBonus?: boolean
}

export interface ERC20Contract {
  address:string
  precision:number
}

export interface ProfileUpdatePayload {
  id:string
  email:string
  fullName:string
  btcAddress:string
}

export interface PasswordUpdatePayload {
  id:string
  currentPassword:string
  newPassword:string
}

export interface ReferralPayload {
  userId:string
  referrerId: string
  bonus?:string
  percentage?:string
}

