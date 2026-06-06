import { useEffect, useState } from 'react'
import { useFamily } from '@/contexts/FamilyContext'
import { getPendingRedemptions, approveRedemption, rejectRedemption } from '@/services/starsService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ShieldCheck, Check, X, ArrowLeft, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function RewardsPending() {
  const { family, members } = useFamily()
  const { toast } = useToast()

  const [redemptions, setRedemptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const adultMember = members.find((m) => m.member_type === 'adult')

  const fetchRedemptions = async () => {
    if (!family) return
    try {
      setLoading(true)
      const data = await getPendingRedemptions(family.id)
      setRedemptions(data)
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRedemptions()
  }, [family])

  const handleApprove = async (id: string) => {
    if (!adultMember) {
      toast({
        title: 'Acesso Negado',
        description: 'Você precisa ser um membro adulto para aprovar.',
        variant: 'destructive',
      })
      return
    }

    try {
      setProcessingId(id)
      await approveRedemption(id, adultMember.id)
      toast({
        title: 'Aprovado',
        description: 'Resgate aprovado com sucesso! As estrelas foram deduzidas.',
      })
      setRedemptions((prev) => prev.filter((r) => r.id !== id))
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (id: string) => {
    try {
      setProcessingId(id)
      await rejectRedemption(id)
      toast({ title: 'Rejeitado', description: 'Resgate rejeitado.' })
      setRedemptions((prev) => prev.filter((r) => r.id !== id))
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setProcessingId(null)
    }
  }

  if (!family) return null

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/app/rewards">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            Gerenciar Resgates
          </h1>
          <p className="text-muted-foreground">
            Aprove ou rejeite as solicitações de recompensa das crianças.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Solicitações Pendentes</CardTitle>
          <CardDescription>Estes resgates estão aguardando sua revisão.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : redemptions.length === 0 ? (
            <div className="text-center p-12 border border-dashed rounded-lg bg-muted/30">
              <ShieldCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium text-muted-foreground">Tudo limpo!</p>
              <p className="text-sm text-muted-foreground">
                Não há solicitações pendentes no momento.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {redemptions.map((redemption) => {
                const child = redemption.expand?.member_id
                const reward = redemption.expand?.reward_id

                return (
                  <div
                    key={redemption.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border bg-card gap-4 shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      {reward?.image_url ? (
                        <img
                          src={reward.image_url}
                          alt={reward.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-indigo-50 flex items-center justify-center">
                          <Star className="h-8 w-8 text-indigo-300" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-lg leading-tight">{reward?.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Solicitado por{' '}
                          <span className="font-medium text-foreground">{child?.name}</span>
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 font-semibold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                            <Star className="h-3 w-3 fill-current" />
                            {reward?.cost} estrelas
                          </span>
                          <span>
                            {format(new Date(redemption.requested_at), "dd/MM/yyyy 'às' HH:mm", {
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleReject(redemption.id)}
                        disabled={processingId === redemption.id}
                      >
                        <X className="h-4 w-4 mr-1" /> Rejeitar
                      </Button>
                      <Button
                        className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(redemption.id)}
                        disabled={processingId === redemption.id}
                      >
                        <Check className="h-4 w-4 mr-1" /> Aprovar
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
