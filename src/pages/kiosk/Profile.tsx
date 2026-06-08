import { useEffect, useState } from 'react'
import { KioskPageLayout } from '@/components/kiosk/KioskPageLayout'
import pb from '@/lib/pocketbase/client'
import { getOrCreateStarsLevel, getStarsHistory } from '@/services/starsService'
import { calculateAge } from '@/utils/ageUtils'
import { StarsProgress } from '@/components/stars/StarsProgress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Star, History, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useSearchParams } from 'react-router-dom'

export default function KioskProfile() {
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [member, setMember] = useState<any>(null)
  const [starsLevel, setStarsLevel] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const memberId = searchParams.get('memberId')
        if (!memberId) {
          throw new Error('Nenhum membro selecionado. Por favor, volte e selecione seu perfil.')
        }

        const memberData = await pb.collection('family_members').getOne(memberId)
        setMember(memberData)

        const levelData = await getOrCreateStarsLevel(memberData.family_id, memberId)
        setStarsLevel(levelData)

        const historyData = await getStarsHistory(memberId, 1, 5)
        setTransactions(historyData.items)
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar o perfil.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <KioskPageLayout title="Meu Perfil">
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-16 h-16 animate-spin text-primary" />
          <p className="text-2xl font-semibold text-primary animate-pulse">Carregando perfil...</p>
        </div>
      </KioskPageLayout>
    )
  }

  if (error || !member) {
    return (
      <KioskPageLayout title="Meu Perfil">
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-center px-4">
          <AlertCircle className="w-20 h-20 text-destructive" />
          <h2 className="text-3xl font-bold text-destructive">Ops!</h2>
          <p className="text-xl text-muted-foreground">{error}</p>
        </div>
      </KioskPageLayout>
    )
  }

  const initials = member.name.substring(0, 2).toUpperCase()
  const age = calculateAge(member.birth_date)

  return (
    <KioskPageLayout title="Meu Perfil">
      <div className="max-w-4xl mx-auto w-full space-y-8 p-4 pb-12">
        {/* Profile Header */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 shadow-lg">
          <CardContent className="p-8 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
              <AvatarImage src={member.photo_url} alt={member.name} className="object-cover" />
              <AvatarFallback className="text-4xl bg-primary text-primary-foreground font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-2">
                {member.name}
              </h1>
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-background/80 shadow-sm border text-lg font-medium text-muted-foreground">
                {age} anos
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stars Dashboard */}
        {starsLevel && (
          <div className="transform transition-transform hover:scale-[1.01] duration-300">
            <StarsProgress
              totalEarned={starsLevel.stars_total_earned || 0}
              balance={starsLevel.stars_balance || 0}
            />
          </div>
        )}

        {/* Recent Activity */}
        <Card className="shadow-md border-muted">
          <CardHeader className="bg-muted/30 border-b pb-4">
            <CardTitle className="text-2xl flex items-center justify-center sm:justify-start gap-3">
              <History className="w-8 h-8 text-primary" />
              Últimas Conquistas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {transactions.length > 0 ? (
              <div className="divide-y">
                {transactions.map((tx) => {
                  const isEarned = tx.transaction_type === 'earned'
                  const isPenalty = tx.transaction_type === 'penalty'

                  return (
                    <div
                      key={tx.id}
                      className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col text-center sm:text-left">
                        <span className="text-xl font-semibold text-foreground">{tx.reason}</span>
                        <span className="text-base text-muted-foreground mt-1">
                          {format(new Date(tx.created), "dd 'de' MMMM 'às' HH:mm", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      <div
                        className={`flex items-center justify-center gap-2 text-3xl font-bold px-4 py-2 rounded-xl ${
                          isEarned
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : isPenalty
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        }`}
                      >
                        {isEarned ? '+' : '-'}
                        {tx.amount}
                        <Star className="w-8 h-8 fill-current" />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground text-xl">
                Você ainda não tem histórico de estrelas. Comece a completar tarefas!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </KioskPageLayout>
  )
}
