import { useEffect, useState } from 'react'
import { getStarsHistory } from '@/services/starsService'
import { AlertCircle, RefreshCw } from 'lucide-react'
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
    <div className="max-w-4xl mx-auto p-8 w-full">
      <div className="space-y-4">
        {history.map((tx) => {
          let typeStyles = ''
          let sign = ''
          if (tx.transaction_type === 'earned') {
            typeStyles = 'border-l-4 border-l-green-500 text-green-600'
            sign = '+'
          } else if (tx.transaction_type === 'spent') {
            typeStyles = 'border-l-4 border-l-red-500 text-red-600'
            sign = '-'
          } else {
            typeStyles = 'border-l-4 border-l-orange-500 text-orange-600'
            sign = '-'
          }

          return (
            <div
              key={tx.id}
              className={`bg-card p-6 rounded-lg shadow-sm flex items-center justify-between gap-4 ${typeStyles}`}
            >
              <div className="flex flex-col">
                <span className="text-base text-foreground">{tx.reason}</span>
                <span className="text-xs text-muted-foreground mt-1">
                  {format(new Date(tx.created), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
              <div className="text-lg font-semibold whitespace-nowrap">
                {sign}
                {tx.amount}
              </div>
            </div>
          )
        })}

        {hasMore && (
          <Button
            variant="ghost"
            className="w-full mt-4"
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
      </div>
    </div>
  )
}
