import { useEffect, useState } from 'react'
import { useFamily } from '@/contexts/FamilyContext'
import { getPendingRedemptions, approveRedemption, rejectRedemption } from '@/services/starsService'
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
    <div className="max-w-4xl mx-auto p-8 space-y-6">
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
          <p className="text-muted-foreground mt-1">
            Aprove ou rejeite as solicitações de recompensa das crianças.
          </p>
        </div>
      </div>

      <div className="space-y-4">
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
            <p className="text-sm text-muted-foreground mt-1">
              Não há solicitações pendentes no momento.
            </p>
          </div>
        ) : (
          redemptions.map((redemption) => {
            const child = redemption.expand?.member_id
            const reward = redemption.expand?.reward_id

            return (
              <div
                key={redemption.id}
                className="bg-card p-6 border-l-4 border-l-primary rounded-lg shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{child?.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Solicitou: <span className="font-medium text-foreground">{reward?.name}</span>
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Star className="h-4 w-4 fill-current text-primary" />
                      {reward?.cost}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(redemption.requested_at), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1 sm:flex-none"
                    onClick={() => handleReject(redemption.id)}
                    disabled={processingId === redemption.id}
                  >
                    <X className="h-4 w-4 mr-1" /> Rejeitar
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 sm:flex-none bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => handleApprove(redemption.id)}
                    disabled={processingId === redemption.id}
                  >
                    <Check className="h-4 w-4 mr-1" /> Aprovar
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
