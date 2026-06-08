import pb from '@/lib/pocketbase/client'
import type { RecordModel } from 'pocketbase'

export interface FinanceAccount extends RecordModel {
  family_id: string
  name: string
  type: 'checking' | 'savings' | 'credit' | 'cash'
  balance: number
  currency: string
}

export interface FinanceTransaction extends RecordModel {
  family_id: string
  account_id: string
  amount: number
  type: 'income' | 'expense'
  category: string
  description: string
  date: string
  created_by?: string
  expand?: {
    account_id?: FinanceAccount
  }
}

export const getAccounts = (familyId: string) => {
  return pb.collection('finance_accounts').getFullList<FinanceAccount>({
    filter: `family_id = "${familyId}"`,
    sort: 'name',
  })
}

export const getTransactions = (familyId: string, accountId?: string) => {
  let filter = `family_id = "${familyId}"`
  if (accountId && accountId !== 'all') {
    filter += ` && account_id = "${accountId}"`
  }
  return pb.collection('finance_transactions').getList<FinanceTransaction>(1, 10, {
    filter,
    sort: '-date',
    expand: 'account_id',
  })
}

export const getMonthlySummary = async (familyId: string) => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const lastDay = new Date(year, month, 0).getDate()

  const pad = (n: number) => n.toString().padStart(2, '0')
  const startStr = `${year}-${pad(month)}-01 00:00:00.000Z`
  const endStr = `${year}-${pad(month)}-${pad(lastDay)} 23:59:59.999Z`

  const txs = await pb.collection('finance_transactions').getFullList<FinanceTransaction>({
    filter: `family_id = "${familyId}" && date >= "${startStr}" && date <= "${endStr}"`,
  })

  let income = 0
  let expense = 0
  for (const tx of txs) {
    if (tx.type === 'income') income += tx.amount
    else if (tx.type === 'expense') expense += tx.amount
  }
  return { income, expense }
}

export const createTransaction = async (data: Partial<FinanceTransaction>) => {
  const tx = await pb.collection('finance_transactions').create<FinanceTransaction>(data)
  if (data.account_id && data.amount) {
    const acc = await pb.collection('finance_accounts').getOne<FinanceAccount>(data.account_id)
    const amount = Number(data.amount) || 0
    const newBalance = data.type === 'income' ? acc.balance + amount : acc.balance - amount
    await pb.collection('finance_accounts').update(acc.id, { balance: newBalance })
  }
  return tx
}

export const createAccount = async (data: Partial<FinanceAccount>) => {
  return pb.collection('finance_accounts').create<FinanceAccount>(data)
}
