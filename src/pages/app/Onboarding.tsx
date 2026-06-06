import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFamily } from '@/contexts/FamilyContext'
import { createFamily, addFamilyMember } from '@/services/familyService'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Loader2, Plus, Trash2 } from 'lucide-react'

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

  const handleStep1 = () => {
    if (!familyData.name.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, insira o nome da família.',
        variant: 'destructive',
      })
      return
    }
    setStep(2)
  }

  const handleStep2 = () => {
    if (!currentChild.name.trim() || !currentChild.birth_date) {
      toast({
        title: 'Erro',
        description: 'Nome e data de nascimento são obrigatórios.',
        variant: 'destructive',
      })
      return
    }
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
    if (adultsList.length === 0 && !currentAdult.name.trim()) {
      toast({
        title: 'Erro',
        description: 'Adicione pelo menos um adulto.',
        variant: 'destructive',
      })
      return
    }
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Configuração da Família</CardTitle>
          <CardDescription>
            Passo {step} de 5 -{' '}
            {step === 1
              ? 'Dados Básicos'
              : step === 2
                ? 'Primeiro Filho(a)'
                : step === 3
                  ? 'Mais Filhos'
                  : step === 4
                    ? 'Responsáveis'
                    : 'Revisão'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="space-y-2">
                <Label htmlFor="familyName">Nome da Família</Label>
                <Input
                  id="familyName"
                  placeholder="Ex: Família Silva"
                  value={familyData.name}
                  onChange={(e) => setFamilyData({ ...familyData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Fuso Horário</Label>
                <Select
                  value={familyData.timezone}
                  onValueChange={(val) => setFamilyData({ ...familyData, timezone: val })}
                >
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Sao_Paulo">Horário de Brasília (BRT)</SelectItem>
                    <SelectItem value="America/Manaus">Manaus (AMT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Moeda</Label>
                <Select
                  value={familyData.currency}
                  onValueChange={(val) => setFamilyData({ ...familyData, currency: val })}
                >
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">Real (R$)</SelectItem>
                    <SelectItem value="USD">Dólar ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in-up">
              <p className="text-sm text-muted-foreground">
                Vamos cadastrar as crianças para personalizar a experiência delas.
              </p>
              <div className="space-y-2">
                <Label>Nome da Criança</Label>
                <Input
                  placeholder="Ex: João"
                  value={currentChild.name}
                  onChange={(e) => setCurrentChild({ ...currentChild, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Nascimento</Label>
                <Input
                  type="date"
                  value={currentChild.birth_date}
                  onChange={(e) => setCurrentChild({ ...currentChild, birth_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Modelo de Educação</Label>
                <Select
                  value={currentChild.education_type}
                  onValueChange={(val) => setCurrentChild({ ...currentChild, education_type: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="traditional">Escola Tradicional</SelectItem>
                    <SelectItem value="homeschooling">Homeschooling</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Restrições Alimentares (Opcional)</Label>
                <Input
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
            <div className="space-y-4 animate-fade-in-up">
              <p className="text-sm text-muted-foreground">
                Você possui mais filhos para adicionar?
              </p>
              {childrenList.length > 0 && (
                <div className="bg-muted p-3 rounded-md mb-4 space-y-2">
                  <h4 className="font-semibold text-sm">Crianças Adicionadas:</h4>
                  {childrenList.map((c, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center text-sm bg-background px-3 py-2 rounded border"
                    >
                      <span>{c.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => setChildrenList(childrenList.filter((_, idx) => idx !== i))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2 p-4 border border-dashed rounded-md">
                <h4 className="font-medium text-sm">Adicionar outra criança</h4>
                <div className="space-y-2 mt-2">
                  <Label>Nome</Label>
                  <Input
                    placeholder="Nome"
                    value={currentChild.name}
                    onChange={(e) => setCurrentChild({ ...currentChild, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2 mt-2">
                  <Label>Data de Nascimento</Label>
                  <Input
                    type="date"
                    value={currentChild.birth_date}
                    onChange={(e) =>
                      setCurrentChild({ ...currentChild, birth_date: e.target.value })
                    }
                  />
                </div>
                <Button variant="secondary" className="w-full mt-4" onClick={handleAddMoreChild}>
                  <Plus className="h-4 w-4 mr-2" /> Adicionar à lista
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-fade-in-up">
              <p className="text-sm text-muted-foreground">
                Agora, vamos adicionar os adultos responsáveis.
              </p>
              {adultsList.length > 0 && (
                <div className="bg-muted p-3 rounded-md mb-4 space-y-2">
                  <h4 className="font-semibold text-sm">Adultos Adicionados:</h4>
                  {adultsList.map((a, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center text-sm bg-background px-3 py-2 rounded border"
                    >
                      <span>
                        {a.name} ({a.role})
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => setAdultsList(adultsList.filter((_, idx) => idx !== i))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2 p-4 border border-dashed rounded-md">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    placeholder="Ex: Maria"
                    value={currentAdult.name}
                    onChange={(e) => setCurrentAdult({ ...currentAdult, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2 mt-2">
                  <Label>Papel na Família</Label>
                  <Select
                    value={currentAdult.role}
                    onValueChange={(val) => setCurrentAdult({ ...currentAdult, role: val })}
                  >
                    <SelectTrigger>
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
                <Button variant="secondary" className="w-full mt-4" onClick={handleAddAdult}>
                  <Plus className="h-4 w-4 mr-2" /> Adicionar Responsável
                </Button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4 animate-fade-in-up text-sm">
              <p className="text-muted-foreground">Confira os dados antes de finalizar.</p>

              <div className="p-3 bg-muted rounded-md space-y-1">
                <h4 className="font-semibold">Família</h4>
                <p>
                  Nome: <span className="font-medium">{familyData.name}</span>
                </p>
                <p>
                  Fuso: <span className="font-medium">{familyData.timezone}</span> | Moeda:{' '}
                  <span className="font-medium">{familyData.currency}</span>
                </p>
              </div>

              <div className="p-3 bg-muted rounded-md space-y-1">
                <h4 className="font-semibold">Crianças ({childrenList.length})</h4>
                <ul className="list-disc pl-4">
                  {childrenList.map((c, i) => (
                    <li key={i}>
                      {c.name} - Nasc: {c.birth_date}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-muted rounded-md space-y-1">
                <h4 className="font-semibold">Adultos ({adultsList.length})</h4>
                <ul className="list-disc pl-4">
                  {adultsList.map((a, i) => (
                    <li key={i}>
                      {a.name} ({a.role})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t p-4">
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            disabled={step === 1 || loading}
          >
            Voltar
          </Button>

          {step === 1 && <Button onClick={handleStep1}>Avançar</Button>}
          {step === 2 && <Button onClick={handleStep2}>Avançar</Button>}
          {step === 3 && (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleSkipChild}>
                Pular
              </Button>
              <Button onClick={() => setStep(4)} disabled={childrenList.length === 0}>
                Avançar
              </Button>
            </div>
          )}
          {step === 4 && <Button onClick={handleStep4}>Avançar</Button>}
          {step === 5 && (
            <Button onClick={submitFamily} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Concluir Cadastro
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
