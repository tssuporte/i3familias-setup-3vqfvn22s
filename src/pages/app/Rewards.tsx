import { useEffect, useState } from 'react'
import { useFamily } from '@/contexts/FamilyContext'
import { getRewards, getOrCreateStarsLevel, requestReward } from '@/services/starsService'
import { StarsProgress } from '@/components/stars/StarsProgress'
import { StarsHistory } from '@/components/stars/StarsHistory'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
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
      })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setIsRequesting(false)
    }
  }

  if (!family) return null

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Gift className="h-8 w-8 text-primary" />
            Loja de Recompensas
          </h1>
          <p className="text-muted-foreground">Troque suas estrelas por prêmios incríveis!</p>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 rounded-xl bg-muted animate-pulse"></div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewards.map((reward) => (
                  <Card
                    key={reward.id}
                    className="overflow-hidden flex flex-col hover:shadow-md transition-shadow group"
                  >
                    <div className="h-48 bg-muted relative overflow-hidden">
                      {reward.image_url ? (
                        <img
                          src={reward.image_url}
                          alt={reward.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/20">
                          <Gift className="h-16 w-16 text-indigo-200 dark:text-indigo-800" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/90 backdrop-blur-sm px-3 py-1.5 rounded-full font-bold text-yellow-600 flex items-center gap-1 shadow-sm">
                        <Star className="h-4 w-4 fill-current" />
                        {reward.cost}
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      {reward.category && (
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-1 block">
                          {reward.category}
                        </span>
                      )}
                      <CardTitle className="text-xl">{reward.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {reward.description}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            className="w-full"
                            variant={
                              levelData.stars_balance >= reward.cost ? 'default' : 'secondary'
                            }
                          >
                            Ver Detalhes
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>{reward.name}</DialogTitle>
                            <DialogDescription>Detalhes da recompensa</DialogDescription>
                          </DialogHeader>

                          <div className="py-4 space-y-4">
                            {reward.image_url && (
                              <img
                                src={reward.image_url}
                                alt={reward.name}
                                className="w-full h-48 object-cover rounded-lg"
                              />
                            )}
                            <p className="text-sm">{reward.description || 'Sem descrição.'}</p>

                            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                              <span className="font-medium">Custo:</span>
                              <div className="flex items-center gap-1.5 text-yellow-600 font-bold text-xl">
                                <Star className="h-5 w-5 fill-current" />
                                {reward.cost}
                              </div>
                            </div>

                            {levelData.stars_balance < reward.cost && (
                              <p className="text-sm text-destructive text-center font-medium">
                                Faltam {reward.cost - levelData.stars_balance} estrelas para
                                resgatar.
                              </p>
                            )}
                          </div>

                          <DialogFooter>
                            <Button
                              onClick={() => handleRequest(reward.id, reward.cost)}
                              disabled={levelData.stars_balance < reward.cost || isRequesting}
                              className="w-full sm:w-auto"
                            >
                              {isRequesting ? 'Solicitando...' : 'Solicitar Resgate'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Histórico de Estrelas</DialogTitle>
            <DialogDescription>Acompanhe seus ganhos e gastos recentes.</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            {selectedChildId && <StarsHistory memberId={selectedChildId} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
