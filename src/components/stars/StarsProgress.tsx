import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Star } from 'lucide-react'

export function getLevelInfo(total: number) {
  if (total >= 1000) return { level: 5, current: total, next: null, min: 1000 }
  if (total >= 500) return { level: 4, current: total, next: 1000, min: 500 }
  if (total >= 250) return { level: 3, current: total, next: 500, min: 250 }
  if (total >= 100) return { level: 2, current: total, next: 250, min: 100 }
  return { level: 1, current: total, next: 100, min: 0 }
}

export function StarsProgress({ totalEarned, balance }: { totalEarned: number; balance: number }) {
  const { level, current, next, min } = getLevelInfo(totalEarned)
  const progress = next ? ((current - min) / (next - min)) * 100 : 100

  return (
    <Card className="bg-card">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-lg font-semibold text-foreground mb-1">Saldo Atual</p>
            <div className="flex items-center justify-center md:justify-start gap-2 text-primary">
              <Star className="w-8 h-8 fill-current" />
              <span className="text-3xl font-bold">{balance}</span>
            </div>
          </div>
          <div className="flex-1 w-full max-w-sm text-center md:text-right">
            <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-primary text-white font-bold mb-3 shadow-sm">
              Nível {level}
            </div>
            <Progress value={progress} className="h-2 mt-4 bg-secondary" />
            {next ? (
              <p className="text-xs font-medium text-muted-foreground mt-2">
                Faltam {next - current} estrelas para o Nível {level + 1}
              </p>
            ) : (
              <p className="text-xs font-medium text-muted-foreground mt-2">
                Nível Máximo Atingido!
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
