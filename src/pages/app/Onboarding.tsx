import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFamily } from '@/contexts/FamilyContext'
import { createFamily, addFamilyMember } from '@/services/familyService'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Loader2, Plus, Trash2, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Onboarding() {
  const navigate = useNavigate()
  const { family, refreshFamily } = useFamily()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Prevent access if user already completed family setup
    if (family) {
      navigate('/app', { replace: true })
    }
  }, [family, navigate])

  const [familyData, setFamilyData] = useState({
    name: '',
    timezone: 'America/Sao_Paulo',
    currency: 'BRL',
  })

  const [childrenList, setChildrenList] = useState<any[]>([])
  const [currentChild, setCurrentChild] = useState({
    name: '',
    birth_date: '',
    education_type: 'traditional',
    dietary_restrictions: '',
  })

  const [adultsList, setAdultsList] = useState<any[]>([])
  const [currentAdult, setCurrentAdult] = useState({
    name: '',
    role: 'pai',
  })

  // Validation
  const isStep1Valid = familyData.name.trim().length > 0
  const isStep2Valid = currentChild.name.trim().length > 0 && currentChild.birth_date !== ''
  const isStep4Valid = adultsList.length > 0 || currentAdult.name.trim().length > 0

  const handleStep1 = () => {
    if (!isStep1Valid) return
    setStep(2)
  }

  const handleStep2 = () => {
    if (!isStep2Valid) return
    setChildrenList([currentChild])
    setCurrentChild({
      name: '',
      birth_date: '',
      education_type: 'traditional',
      dietary_restrictions: '',
    })
    setStep(3)
  }

  const handleAddMoreChild = () => {
    if (!currentChild.name.trim() || !currentChild.birth_date) {
      toast({
        title: 'Erro',
        description: 'Nome e data de nascimento são obrigatórios.',
        variant: 'destructive',
      })
      return
    }
    setChildrenList([...childrenList, currentChild])
    setCurrentChild({
      name: '',
      birth_date: '',
      education_type: 'traditional',
      dietary_restrictions: '',
    })
  }

  const handleSkipChild = () => {
    setCurrentChild({
      name: '',
      birth_date: '',
      education_type: 'traditional',
      dietary_restrictions: '',
    })
    setStep(4)
  }

  const handleAddAdult = () => {
    if (!currentAdult.name.trim()) {
      toast({ title: 'Erro', description: 'Nome é obrigatório.', variant: 'destructive' })
      return
    }
    setAdultsList([...adultsList, currentAdult])
    setCurrentAdult({ name: '', role: 'pai' })
  }

  const handleStep4 = () => {
    if (!isStep4Valid) return
    if (currentAdult.name.trim()) {
      setAdultsList([...adultsList, currentAdult])
      setCurrentAdult({ name: '', role: 'pai' })
    }
    setStep(5)
  }

  const submitFamily = async () => {
    try {
      setLoading(true)
      const fam = await createFamily(familyData)

      const membersToCreate = [
        ...childrenList.map((c) => ({
          ...c,
          member_type: 'child',
          family_id: fam.id,
          birth_date: new Date(c.birth_date).toISOString(),
        })),
        ...adultsList.map((a) => ({
          ...a,
          member_type: 'adult',
          family_id: fam.id,
          birth_date: new Date('1990-01-01').toISOString(), // Schema requires birth_date
        })),
      ]

      for (const member of membersToCreate) {
        await addFamilyMember(member)
      }

      await refreshFamily()
      toast({ title: 'Sucesso', description: 'Família configurada com sucesso!' })
      navigate('/app')
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const stepsList = [
    { num: 1, label: 'Família' },
    { num: 2, label: 'Crianças' },
    { num: 3, label: 'Mais Filhos' },
    { num: 4, label: 'Responsáveis' },
    { num: 5, label: 'Revisão' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-2xl flex flex-col gap-8">
        {/* Progress Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            {stepsList.map((s) => (
              <div key={s.num} className="flex flex-col items-center gap-2 relative z-10">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-300',
                    step > s.num
                      ? 'bg-primary text-primary-foreground'
                      : step === s.num
                        ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                        : 'bg-secondary text-muted-foreground',
                  )}
                >
                  {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span
                  className={cn(
                    'text-xs hidden sm:block font-medium transition-colors',
                    step >= s.num ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
          <Progress value={(step / 5) * 100} className="h-2" />
        </div>

        <Card className="border-none shadow-xl bg-background overflow-hidden">
          <CardHeader className="bg-muted/30 border-b pb-6">
            <CardTitle className="text-2xl font-bold">
              {step === 1 && 'Bem-vindo! Qual o nome da sua família?'}
              {step === 2 && 'Vamos cadastrar sua primeira criança'}
              {step === 3 && 'Adicionar mais crianças'}
              {step === 4 && 'Quem são os responsáveis?'}
              {step === 5 && 'Quase lá! Revise os dados'}
            </CardTitle>
            <CardDescription className="text-base">
              {step === 1 && 'Para começarmos, precisamos de algumas informações básicas.'}
              {step === 2 && 'Isso nos ajuda a personalizar a experiência para ela.'}
              {step === 3 && 'Você pode adicionar quantos filhos quiser ou pular esta etapa.'}
              {step === 4 && 'Adicione os adultos que farão parte da família.'}
              {step === 5 && 'Verifique se as informações estão corretas antes de concluir.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            {/* Using a key on a wrapper forces re-mount of animations on step change */}
            <div
              key={step}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
            >
              {step === 1 && (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="familyName" className="font-semibold text-sm mb-1">
                      Nome da Família
                    </Label>
                    <Input
                      id="familyName"
                      className="rounded-lg"
                      placeholder="Ex: Família Silva"
                      value={familyData.name}
                      onChange={(e) => setFamilyData({ ...familyData, name: e.target.value })}
                    />
                    {!isStep1Valid && familyData.name.length > 0 && (
                      <p className="text-destructive text-sm mt-1">Insira um nome válido.</p>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex flex-col gap-2 flex-1">
                      <Label htmlFor="timezone" className="font-semibold text-sm mb-1">
                        Fuso Horário
                      </Label>
                      <Select
                        value={familyData.timezone}
                        onValueChange={(val) => setFamilyData({ ...familyData, timezone: val })}
                      >
                        <SelectTrigger id="timezone" className="rounded-lg">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/Sao_Paulo">
                            Horário de Brasília (BRT)
                          </SelectItem>
                          <SelectItem value="America/Manaus">Manaus (AMT)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                      <Label htmlFor="currency" className="font-semibold text-sm mb-1">
                        Moeda
                      </Label>
                      <Select
                        value={familyData.currency}
                        onValueChange={(val) => setFamilyData({ ...familyData, currency: val })}
                      >
                        <SelectTrigger id="currency" className="rounded-lg">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BRL">Real (R$)</SelectItem>
                          <SelectItem value="USD">Dólar ($)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <Label className="font-semibold text-sm mb-1">Nome da Criança</Label>
                    <Input
                      className="rounded-lg"
                      placeholder="Ex: João"
                      value={currentChild.name}
                      onChange={(e) => setCurrentChild({ ...currentChild, name: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex flex-col gap-2 flex-1">
                      <Label className="font-semibold text-sm mb-1">Data de Nascimento</Label>
                      <Input
                        type="date"
                        className="rounded-lg"
                        value={currentChild.birth_date}
                        onChange={(e) =>
                          setCurrentChild({ ...currentChild, birth_date: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                      <Label className="font-semibold text-sm mb-1">Modelo de Educação</Label>
                      <Select
                        value={currentChild.education_type}
                        onValueChange={(val) =>
                          setCurrentChild({ ...currentChild, education_type: val })
                        }
                      >
                        <SelectTrigger className="rounded-lg">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="traditional">Escola Tradicional</SelectItem>
                          <SelectItem value="homeschooling">Homeschooling</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="font-semibold text-sm mb-1">
                      Restrições Alimentares (Opcional)
                    </Label>
                    <Textarea
                      className="rounded-lg min-h-[120px] resize-y"
                      placeholder="Ex: Alergia a amendoim, intolerância à lactose"
                      value={currentChild.dietary_restrictions}
                      onChange={(e) =>
                        setCurrentChild({ ...currentChild, dietary_restrictions: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="flex flex-col gap-6">
                  {childrenList.length > 0 && (
                    <div className="bg-secondary/50 p-4 rounded-xl space-y-3">
                      <h4 className="font-semibold text-sm text-foreground/80 uppercase tracking-wider">
                        Crianças Adicionadas
                      </h4>
                      <div className="flex flex-col gap-2">
                        {childrenList.map((c, i) => (
                          <div
                            key={i}
                            className="flex justify-between items-center bg-background px-4 py-3 rounded-lg border shadow-sm"
                          >
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">{c.name}</span>
                              <span className="text-xs text-muted-foreground">
                                Nasc: {new Date(c.birth_date).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() =>
                                setChildrenList(childrenList.filter((_, idx) => idx !== i))
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-4 p-5 border border-dashed rounded-xl bg-background">
                    <h4 className="font-semibold text-foreground">Nova Criança</h4>
                    <div className="flex flex-col gap-2">
                      <Label className="font-semibold text-sm mb-1">Nome</Label>
                      <Input
                        className="rounded-lg"
                        placeholder="Nome"
                        value={currentChild.name}
                        onChange={(e) => setCurrentChild({ ...currentChild, name: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="font-semibold text-sm mb-1">Data de Nascimento</Label>
                      <Input
                        type="date"
                        className="rounded-lg"
                        value={currentChild.birth_date}
                        onChange={(e) =>
                          setCurrentChild({ ...currentChild, birth_date: e.target.value })
                        }
                      />
                    </div>
                    <Button
                      variant="secondary"
                      className="w-full mt-2 font-medium"
                      onClick={handleAddMoreChild}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Adicionar à lista
                    </Button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="flex flex-col gap-6">
                  {adultsList.length > 0 && (
                    <div className="bg-secondary/50 p-4 rounded-xl space-y-3">
                      <h4 className="font-semibold text-sm text-foreground/80 uppercase tracking-wider">
                        Adultos Adicionados
                      </h4>
                      <div className="flex flex-col gap-2">
                        {adultsList.map((a, i) => (
                          <div
                            key={i}
                            className="flex justify-between items-center bg-background px-4 py-3 rounded-lg border shadow-sm"
                          >
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">{a.name}</span>
                              <span className="text-xs text-muted-foreground capitalize">
                                {a.role}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() =>
                                setAdultsList(adultsList.filter((_, idx) => idx !== i))
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-4 p-5 border border-dashed rounded-xl bg-background">
                    <h4 className="font-semibold text-foreground">Novo Responsável</h4>
                    <div className="flex flex-col gap-2">
                      <Label className="font-semibold text-sm mb-1">Nome</Label>
                      <Input
                        className="rounded-lg"
                        placeholder="Ex: Maria"
                        value={currentAdult.name}
                        onChange={(e) => setCurrentAdult({ ...currentAdult, name: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="font-semibold text-sm mb-1">Papel na Família</Label>
                      <Select
                        value={currentAdult.role}
                        onValueChange={(val) => setCurrentAdult({ ...currentAdult, role: val })}
                      >
                        <SelectTrigger className="rounded-lg">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pai">Pai</SelectItem>
                          <SelectItem value="mae">Mãe</SelectItem>
                          <SelectItem value="avo">Avô/Avó</SelectItem>
                          <SelectItem value="responsavel">Outro Responsável</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="secondary"
                      className="w-full mt-2 font-medium"
                      onClick={handleAddAdult}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Adicionar Responsável
                    </Button>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="flex flex-col gap-4">
                  <div className="p-5 bg-secondary/30 border rounded-xl flex flex-col gap-3">
                    <h4 className="font-bold text-lg text-foreground border-b pb-2">
                      Família {familyData.name}
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                      <div>
                        <p className="text-muted-foreground text-xs uppercase tracking-wider">
                          Fuso Horário
                        </p>
                        <p className="font-medium mt-1">{familyData.timezone}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs uppercase tracking-wider">
                          Moeda
                        </p>
                        <p className="font-medium mt-1">{familyData.currency}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-5 bg-secondary/30 border rounded-xl flex flex-col gap-3">
                      <h4 className="font-bold text-base text-foreground flex items-center gap-2">
                        Crianças{' '}
                        <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                          {childrenList.length}
                        </span>
                      </h4>
                      <div className="flex flex-col gap-2">
                        {childrenList.map((c, i) => (
                          <div key={i} className="text-sm">
                            <p className="font-medium">{c.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(c.birth_date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-5 bg-secondary/30 border rounded-xl flex flex-col gap-3">
                      <h4 className="font-bold text-base text-foreground flex items-center gap-2">
                        Responsáveis{' '}
                        <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                          {adultsList.length}
                        </span>
                      </h4>
                      <div className="flex flex-col gap-2">
                        {adultsList.map((a, i) => (
                          <div key={i} className="text-sm">
                            <p className="font-medium">{a.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{a.role}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 bg-muted/20 border-t p-6">
            <Button
              variant="ghost"
              className={cn(
                'w-full sm:w-auto text-muted-foreground font-medium',
                step === 1 ? 'invisible' : '',
              )}
              onClick={() => setStep(step - 1)}
              disabled={step === 1 || loading}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Voltar
            </Button>

            <div className="flex flex-col-reverse sm:flex-row w-full sm:w-auto gap-3 items-center">
              {step === 3 && (
                <Button
                  variant="ghost"
                  className="w-full sm:w-auto text-muted-foreground font-medium"
                  onClick={handleSkipChild}
                >
                  Pular etapa
                </Button>
              )}

              {step === 1 && (
                <Button
                  className="w-full sm:w-auto font-medium"
                  onClick={handleStep1}
                  disabled={!isStep1Valid}
                >
                  Avançar
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}

              {step === 2 && (
                <Button
                  className="w-full sm:w-auto font-medium"
                  onClick={handleStep2}
                  disabled={!isStep2Valid}
                >
                  Avançar
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}

              {step === 3 && (
                <Button
                  className="w-full sm:w-auto font-medium"
                  onClick={() => setStep(4)}
                  disabled={childrenList.length === 0}
                >
                  Avançar
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}

              {step === 4 && (
                <Button
                  className="w-full sm:w-auto font-medium"
                  onClick={handleStep4}
                  disabled={!isStep4Valid}
                >
                  Avançar
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}

              {step === 5 && (
                <Button
                  className="w-full sm:w-auto font-medium min-w-[140px]"
                  onClick={submitFamily}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Concluir Cadastro
                      <Check className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
