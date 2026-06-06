import { useEffect, useState } from 'react'
import { useFamily } from '@/contexts/FamilyContext'
import { getRewards, getOrCreateStarsLevel, requestReward } from '@/services/starsService'
import { StarsProgress } from '@/components/stars/StarsProgress'
import { StarsHistory } from '@/components/stars/StarsHistory'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Star, Gift, ShieldCheck, History } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Link } from 'react-router-dom'

export default function Rewards() {
  const { family, members } = useFamily()
  const { toast } = useToast()

  const children = members.filter((m) => m.member_type === 'child')
  const [selectedChildId, setSelectedChildId] = useState<string>(
    children.length > 0 ? children[0].id : '',
  )

  const [levelData, setLevelData] = useState<any>(null)
  const [rewards, setRewards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isRequesting, setIsRequesting] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  const fetchData = async () => {
    if (!family || !selectedChildId) return
    setLoading(true)
    try {
      const [level, rew] = await Promise.all([
        getOrCreateStarsLevel(family.id, selectedChildId),
        getRewards(family.id),
      ])
      setLevelData(level)
      setRewards(rew)
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [family, selectedChildId])

  const handleRequest = async (rewardId: string, cost: number) => {
    if (!family || !selectedChildId || !levelData) return
    if (levelData.stars_balance < cost) {
      toast({
        title: 'Saldo Insuficiente',
        description: 'Você não tem estrelas suficientes para esta recompensa.',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsRequesting(true)
      await requestReward(family.id, selectedChildId, rewardId)
      toast({
        title: 'Sucesso',
        description: 'Recompensa solicitada com sucesso! Aguarde a aprovação.',
        className: 'animate-in fade-in duration-300',
      })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setIsRequesting(false)
    }
  }

  if (!family) return null

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Gift className="h-8 w-8 text-primary" />
            Loja de Recompensas
          </h1>
          <p className="text-muted-foreground mt-1">Troque suas estrelas por prêmios incríveis!</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link to="/app/rewards/pending">
            <Button variant="outline" className="gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Gerenciar</span> Resgates
            </Button>
          </Link>
          <Button variant="outline" size="icon" onClick={() => setIsHistoryOpen(true)}>
            <History className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {children.length > 0 ? (
        <div className="bg-card border rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 shadow-sm">
          <label className="font-medium text-sm">Visualizando loja para:</label>
          <Select value={selectedChildId} onValueChange={setSelectedChildId}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Selecione a criança" />
            </SelectTrigger>
            <SelectContent>
              {children.map((child) => (
                <SelectItem key={child.id} value={child.id}>
                  {child.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="p-8 text-center border border-dashed rounded-lg bg-muted/50">
          <p className="text-muted-foreground">
            Adicione crianças à família para usar a loja de recompensas.
          </p>
        </div>
      )}

      {selectedChildId && levelData && (
        <>
          <StarsProgress
            totalEarned={levelData.stars_total_earned}
            balance={levelData.stars_balance}
          />

          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6">Prêmios Disponíveis</h2>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 rounded-lg bg-muted animate-pulse"></div>
                ))}
              </div>
            ) : rewards.length === 0 ? (
              <div className="text-center p-12 border border-dashed rounded-xl bg-card">
                <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium">Nenhuma recompensa cadastrada</h3>
                <p className="text-muted-foreground mt-1">
                  Os adultos precisam cadastrar prêmios para a loja.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewards.map((reward) => (
                  <Card
                    key={reward.id}
                    className="bg-card p-6 rounded-lg shadow-md hover:bg-secondary cursor-pointer active:scale-[0.98] transition-transform duration-200 flex flex-col"
                  >
                    {reward.image_url ? (
                      <img
                        src={reward.image_url}
                        alt={reward.name}
                        className="w-full h-[200px] object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-full h-[200px] flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/20 rounded-md">
                        <Gift className="h-16 w-16 text-indigo-200 dark:text-indigo-800" />
                      </div>
                    )}

                    <div className="flex-1 mt-4">
                      {reward.category && (
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-1 block">
                          {reward.category}
                        </span>
                      )}
                      <h3 className="text-lg font-semibold">{reward.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                        <Star className="h-4 w-4 fill-current text-primary" />
                        {reward.cost} estrelas
                      </p>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
                          variant={levelData.stars_balance >= reward.cost ? 'default' : 'secondary'}
                        >
                          Ver Detalhes
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md p-8 bg-card animate-in fade-in slide-in-from-bottom-4 duration-300 rounded-lg">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold">{reward.name}</DialogTitle>
                          <DialogDescription className="text-lg text-primary font-medium flex items-center gap-1 mt-1">
                            <Star className="h-5 w-5 fill-current" />
                            {reward.cost} estrelas
                          </DialogDescription>
                        </DialogHeader>

                        <div className="py-2">
                          {reward.image_url && (
                            <img
                              src={reward.image_url}
                              alt={reward.name}
                              className="w-full h-[300px] object-cover rounded-lg"
                            />
                          )}
                          <p className="text-base text-foreground mt-4">
                            {reward.description || 'Sem descrição.'}
                          </p>

                          {levelData.stars_balance < reward.cost && (
                            <p className="text-sm text-destructive font-medium mt-4">
                              Faltam {reward.cost - levelData.stars_balance} estrelas para resgatar.
                            </p>
                          )}
                        </div>

                        <DialogFooter>
                          <Button
                            onClick={() => handleRequest(reward.id, reward.cost)}
                            disabled={levelData.stars_balance < reward.cost || isRequesting}
                            className="w-full mt-8 bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            {isRequesting ? 'Solicitando...' : 'Solicitar Resgate'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto p-0 border-0 bg-transparent shadow-none">
          <div className="bg-card rounded-lg overflow-hidden flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="p-8 pb-0">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Histórico de Estrelas</DialogTitle>
                <DialogDescription>Acompanhe seus ganhos e gastos recentes.</DialogDescription>
              </DialogHeader>
            </div>
            {selectedChildId && <StarsHistory memberId={selectedChildId} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
