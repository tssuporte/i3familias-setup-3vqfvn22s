import { useEffect, useState } from 'react'
import { getStarsHistory } from '@/services/starsService'
import { ArrowDownRight, ArrowUpRight, AlertCircle, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function StarsHistory({ memberId }: { memberId: string }) {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = async (pageNumber: number) => {
    try {
      setLoading(true)
      const res = await getStarsHistory(memberId, pageNumber, 10)
      if (pageNumber === 1) {
        setHistory(res.items)
      } else {
        setHistory((prev) => [...prev, ...res.items])
      }
      setHasMore(res.page < res.totalPages)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory(1)
  }, [memberId])

  if (loading && page === 1) {
    return (
      <div className="flex justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="h-8 w-8 text-destructive mb-2" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => fetchHistory(1)}>
          Tentar Novamente
        </Button>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Nenhum histórico de estrelas encontrado.
      </div>
    )
  }

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-0 pt-0 pb-4">
        <CardTitle className="text-lg">Histórico de Transações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-0 pb-0">
        {history.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card"
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-full ${tx.transaction_type === 'earned' ? 'bg-green-100 text-green-600' : tx.transaction_type === 'spent' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}
              >
                {tx.transaction_type === 'earned' ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">{tx.reason}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(tx.created), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                </p>
              </div>
            </div>
            <div
              className={`font-bold ${tx.transaction_type === 'earned' ? 'text-green-600' : tx.transaction_type === 'spent' ? 'text-blue-600' : 'text-red-600'}`}
            >
              {tx.transaction_type === 'earned' ? '+' : '-'}
              {tx.amount}
            </div>
          </div>
        ))}
        {hasMore && (
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              const next = page + 1
              setPage(next)
              fetchHistory(next)
            }}
            disabled={loading}
          >
            {loading ? 'Carregando...' : 'Ver Mais'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
