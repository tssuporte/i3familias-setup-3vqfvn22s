import { useEffect, useState } from 'react'
import {
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  CreditCard,
  Landmark,
  Coins,
} from 'lucide-react'
import { useFamily } from '@/contexts/FamilyContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import {
  getAccounts,
  getTransactions,
  getMonthlySummary,
  createTransaction,
  createAccount,
  type FinanceAccount,
  type FinanceTransaction,
} from '@/services/finances'

export default function Finances() {
  const { currentFamily } = useFamily()
  const { toast } = useToast()

  const [accounts, setAccounts] = useState<FinanceAccount[]>([])
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([])
  const [summary, setSummary] = useState({ income: 0, expense: 0 })
  const [loading, setLoading] = useState(true)

  const [filterAccount, setFilterAccount] = useState<string>('all')

  const [openNewAccount, setOpenNewAccount] = useState(false)
  const [openNewTransaction, setOpenNewTransaction] = useState(false)

  const [txType, setTxType] = useState<'income' | 'expense'>('expense')
  const [txAmount, setTxAmount] = useState('')
  const [txCategory, setTxCategory] = useState('')
  const [txDescription, setTxDescription] = useState('')
  const [txDate, setTxDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [txAccount, setTxAccount] = useState('')

  const [accName, setAccName] = useState('')
  const [accType, setAccType] = useState<'checking' | 'savings' | 'credit' | 'cash'>('checking')
  const [accBalance, setAccBalance] = useState('')

  const loadData = async () => {
    if (!currentFamily) return
    try {
      setLoading(true)
      const [accs, txsData, summ] = await Promise.all([
        getAccounts(currentFamily.id),
        getTransactions(currentFamily.id, filterAccount),
        getMonthlySummary(currentFamily.id),
      ])
      setAccounts(accs)
      setTransactions(txsData.items)
      setSummary(summ)
    } catch (err) {
      toast({ title: 'Erro ao carregar dados', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [currentFamily, filterAccount])

  useRealtime('finance_accounts', () => {
    loadData()
  })
  useRealtime('finance_transactions', () => {
    loadData()
  })

  const handleCreateAccount = async () => {
    if (!currentFamily || !accName) return
    try {
      await createAccount({
        family_id: currentFamily.id,
        name: accName,
        type: accType,
        balance: parseFloat(accBalance) || 0,
        currency: 'BRL',
      })
      setOpenNewAccount(false)
      setAccName('')
      setAccBalance('')
      toast({ title: 'Conta criada com sucesso!' })
    } catch (err) {
      toast({ title: 'Erro ao criar conta', variant: 'destructive' })
    }
  }

  const handleCreateTransaction = async () => {
    if (!currentFamily || !txAmount || !txDate || !txAccount) return
    try {
      await createTransaction({
        family_id: currentFamily.id,
        account_id: txAccount,
        amount: parseFloat(txAmount),
        type: txType,
        category: txCategory,
        description: txDescription,
        date: new Date(txDate).toISOString(),
      })
      setOpenNewTransaction(false)
      setTxAmount('')
      setTxCategory('')
      setTxDescription('')
      toast({ title: 'Transação registrada!' })
    } catch (err) {
      toast({ title: 'Erro ao registrar transação', variant: 'destructive' })
    }
  }

  const formatCurrency = (val: number, currency = 'BRL') =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(val)

  return (
    <div className="space-y-8 pb-10 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Finanças</h1>
        <div className="flex gap-2">
          <Dialog open={openNewAccount} onOpenChange={setOpenNewAccount}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" /> Nova Conta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Conta</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input value={accName} onChange={(e) => setAccName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={accType} onValueChange={(v: any) => setAccType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Corrente</SelectItem>
                      <SelectItem value="savings">Poupança</SelectItem>
                      <SelectItem value="credit">Crédito</SelectItem>
                      <SelectItem value="cash">Dinheiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Saldo Inicial</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={accBalance}
                    onChange={(e) => setAccBalance(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateAccount} disabled={!accName}>
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={openNewTransaction} onOpenChange={setOpenNewTransaction}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" /> Nova Transação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Transação</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select value={txType} onValueChange={(v: any) => setTxType(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Entrada</SelectItem>
                        <SelectItem value="expense">Saída</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Valor</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={txAmount}
                      onChange={(e) => setTxAmount(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Conta</Label>
                  <Select value={txAccount} onValueChange={setTxAccount}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input type="date" value={txDate} onChange={(e) => setTxDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Input value={txCategory} onChange={(e) => setTxCategory(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input value={txDescription} onChange={(e) => setTxDescription(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleCreateTransaction}
                  disabled={!txAmount || !txDate || !txAccount}
                >
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas do Mês</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-emerald-500">
                {formatCurrency(summary.income)}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saídas do Mês</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-rose-500">
                {formatCurrency(summary.expense)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Minhas Contas</h2>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : accounts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Nenhuma conta cadastrada.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {accounts.map((acc) => {
              const Icon =
                acc.type === 'checking'
                  ? Landmark
                  : acc.type === 'savings'
                    ? Wallet
                    : acc.type === 'credit'
                      ? CreditCard
                      : Coins
              return (
                <Card key={acc.id}>
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-full">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{acc.name}</p>
                      <p className="text-xl font-bold">
                        {formatCurrency(acc.balance, acc.currency || 'BRL')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h2 className="text-xl font-semibold">Últimas Transações</h2>
          <Select value={filterAccount} onValueChange={setFilterAccount}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todas as contas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Contas</SelectItem>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                Nenhuma transação encontrada.
              </div>
            ) : (
              <div className="divide-y">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-muted/50 transition-colors gap-2"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {tx.description || tx.category || 'Sem descrição'}
                      </span>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span>{format(new Date(tx.date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                        <span>•</span>
                        <span>{tx.expand?.account_id?.name}</span>
                        {tx.category && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <Badge variant="secondary" className="font-normal">
                              {tx.category}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                    <div
                      className={`font-semibold shrink-0 ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
