import { useState, useRef, useEffect, useMemo } from 'react'
import {
  BookOpen,
  Send,
  Trash2,
  GraduationCap,
  PenTool,
  Save,
  BarChart3,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useSchoolHelper } from '@/hooks/use-school-helper'
import { useFamily } from '@/contexts/FamilyContext'
import { getBnccTopicsForYear, BnccTopic } from '@/data/bncc'
import {
  getStudyPlan,
  createStudyPlan,
  updateStudyPlan,
  getTopicProgress,
  saveStudyEvaluation,
} from '@/services/study_plans'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

export default function Studies() {
  const { family, members } = useFamily()
  const { toast } = useToast()

  const children = useMemo(() => members.filter((m) => m.member_type === 'child'), [members])
  const [selectedChildId, setSelectedChildId] = useState<string>('')

  useEffect(() => {
    if (!selectedChildId && children.length > 0) {
      setSelectedChildId(children[0].id)
    }
  }, [children, selectedChildId])

  const selectedChild = useMemo(
    () => children.find((c) => c.id === selectedChildId),
    [children, selectedChildId],
  )
  const schoolYear = selectedChild?.school_year || 'ef1'

  const availableTopics = useMemo(() => {
    const data = getBnccTopicsForYear(schoolYear)
    return data ? data.topics : []
  }, [schoolYear])

  const [activeTab, setActiveTab] = useState('plan')
  const [studyPlan, setStudyPlan] = useState<any>(null)
  const [enabledTopics, setEnabledTopics] = useState<string[]>([])
  const [parentNotes, setParentNotes] = useState('')
  const [progressData, setProgressData] = useState<any[]>([])
  const [isPlanLoading, setIsPlanLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTopicId, setActiveTopicId] = useState<string>('general')

  useEffect(() => {
    async function loadPlan() {
      if (!selectedChildId) return
      setIsPlanLoading(true)
      try {
        const currentYear = new Date().getFullYear()
        let plan = await getStudyPlan(selectedChildId, currentYear)

        if (!plan) {
          // Prepopulate with all available topics for that grade
          const defaultTopics = availableTopics.map((t) => t.id)
          plan = await createStudyPlan({
            family_id: family?.id,
            member_id: selectedChildId,
            year: currentYear,
            bncc_topics: defaultTopics,
            parent_notes: '',
          })
        }

        setStudyPlan(plan)
        setEnabledTopics(plan.bncc_topics || [])
        setParentNotes(plan.parent_notes || '')

        const progress = await getTopicProgress(selectedChildId, plan.id)
        setProgressData(progress)
      } catch (err) {
        console.error('Failed to load study plan', err)
      } finally {
        setIsPlanLoading(false)
      }
    }
    loadPlan()
  }, [selectedChildId, family?.id, availableTopics])

  const handleEvaluation = async (evData: any) => {
    if (!studyPlan || !activeTopicId || activeTopicId === 'general') return
    const topic = availableTopics.find((t) => t.id === activeTopicId)
    if (!topic) return

    try {
      await saveStudyEvaluation({
        study_plan_id: studyPlan.id,
        member_id: selectedChildId,
        topic_id: topic.id,
        topic_label: topic.subtopic,
        evaluation: evData,
      })
      const progress = await getTopicProgress(selectedChildId, studyPlan.id)
      setProgressData(progress)
    } catch (error) {
      console.error('Failed to save evaluation', error)
    }
  }

  const { messages, loading, sendMessage, clearHistory } = useSchoolHelper(handleEvaluation)
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || loading) return
    const message = input.trim()
    setInput('')

    let contentToSend = message
    if (activeTopicId !== 'general') {
      const topic = availableTopics.find((t) => t.id === activeTopicId)
      if (topic) {
        contentToSend = `[Contexto - Aluno: ${selectedChild?.name}, Série: ${schoolYear}, Tópico Foco: ${topic.topic} / ${topic.subtopic}]\n${message}`
      }
    } else {
      contentToSend = `[Contexto - Aluno: ${selectedChild?.name}, Série: ${schoolYear}, Tópico Foco: Geral]\n${message}`
    }

    await sendMessage(contentToSend)
  }

  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [messages])

  const handleSavePlan = async () => {
    if (!studyPlan) return
    setIsSaving(true)
    try {
      await updateStudyPlan(studyPlan.id, {
        bncc_topics: enabledTopics,
        parent_notes: parentNotes,
      })
      toast({ title: 'Plano salvo', description: 'O plano letivo foi atualizado com sucesso.' })
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao salvar o plano.' })
    } finally {
      setIsSaving(false)
    }
  }

  const toggleTopic = (id: string, checked: boolean) => {
    if (checked) setEnabledTopics((prev) => [...prev, id])
    else setEnabledTopics((prev) => prev.filter((t) => t !== id))
  }

  const groupedTopics = useMemo(() => {
    const groups: Record<string, BnccTopic[]> = {}
    availableTopics.forEach((t) => {
      if (!groups[t.area]) groups[t.area] = []
      groups[t.area].push(t)
    })
    return groups
  }, [availableTopics])

  const summary = useMemo(() => {
    const totalEnabled = enabledTopics.length
    const started = progressData.length
    const consolidated = progressData.filter((p) => p.mastery_level >= 3).length
    const advanced = progressData.filter((p) => p.mastery_level === 4).length
    return { totalEnabled, started, consolidated, advanced }
  }, [enabledTopics, progressData])

  function displayContent(raw: string) {
    let clean = raw.replace(/\[AVALIACAO\][\s\S]*?\[\/AVALIACAO\]/g, '')
    clean = clean.replace(/\[Contexto -[^\]]*\]\n?/g, '')
    return clean.trim()
  }

  function getProgressColor(level: number) {
    switch (level) {
      case 1:
        return 'bg-slate-400 dark:bg-slate-500' // Introduced
      case 2:
        return 'bg-blue-500' // In Development
      case 3:
        return 'bg-green-500' // Consolidated
      case 4:
        return 'bg-yellow-500' // Advanced
      default:
        return 'bg-gray-200 dark:bg-gray-800'
    }
  }

  function getProgressValue(level: number) {
    switch (level) {
      case 1:
        return 10
      case 2:
        return 40
      case 3:
        return 75
      case 4:
        return 100
      default:
        return 0
    }
  }

  function getLevelLabel(level: number) {
    switch (level) {
      case 1:
        return 'Introduzido'
      case 2:
        return 'Em desenvolvimento'
      case 3:
        return 'Consolidado'
      case 4:
        return 'Avançado'
      default:
        return 'Não iniciado'
    }
  }

  const areaColors: Record<string, string> = {
    Linguagens: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    Matemática: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    'Ciências da Natureza': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    'Ciências Humanas': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
            <GraduationCap className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
              Tutor Escolar
            </h1>
            <p className="text-sm text-muted-foreground">Plano letivo e assistente de estudos</p>
          </div>
        </div>

        {children.length > 0 && (
          <div className="flex items-center gap-2">
            <Label className="whitespace-nowrap">Aluno:</Label>
            <Select value={selectedChildId} onValueChange={setSelectedChildId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {children.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {!selectedChild?.school_year && children.length > 0 && (
        <Alert variant="destructive" className="flex-shrink-0">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Atenção</AlertTitle>
          <AlertDescription>
            O aluno não possui um ano escolar configurado em seu perfil. O plano letivo padrão (1º
            ano EF) será utilizado.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-full sm:w-auto self-start">
          <TabsTrigger value="plan">
            <BookOpen className="w-4 h-4 mr-2" />
            Plano Letivo
          </TabsTrigger>
          <TabsTrigger value="tutor">
            <GraduationCap className="w-4 h-4 mr-2" />
            Tutor IA
          </TabsTrigger>
          <TabsTrigger value="progress">
            <BarChart3 className="w-4 h-4 mr-2" />
            Progresso
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 min-h-0 mt-4">
          <TabsContent value="plan" className="h-full m-0">
            {isPlanLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-[200px] w-full" />
                <Skeleton className="h-[200px] w-full" />
              </div>
            ) : (
              <ScrollArea className="h-full pr-4">
                <div className="space-y-6 pb-4">
                  {Object.entries(groupedTopics).map(([area, topics]) => (
                    <div key={area}>
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="font-semibold text-lg">{area}</h3>
                        <span
                          className={cn(
                            'text-xs font-medium px-2 py-0.5 rounded-full',
                            areaColors[area] || 'bg-secondary text-secondary-foreground',
                          )}
                        >
                          BNCC
                        </span>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {topics.map((t) => (
                          <div
                            key={t.id}
                            className="flex items-start space-x-3 border border-border p-3 rounded-md bg-card"
                          >
                            <Checkbox
                              id={`topic-${t.id}`}
                              checked={enabledTopics.includes(t.id)}
                              onCheckedChange={(c) => toggleTopic(t.id, c as boolean)}
                            />
                            <div className="space-y-1 leading-none">
                              <Label
                                htmlFor={`topic-${t.id}`}
                                className="text-sm cursor-pointer leading-tight font-medium"
                              >
                                {t.topic}
                              </Label>
                              <p className="text-xs text-muted-foreground mt-1 leading-snug">
                                {t.subtopic}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 border-t border-border mt-4">
                    <h3 className="font-semibold text-lg mb-1">
                      Ênfases e observações (Parent Notes)
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Adicione informações que o tutor deve saber sobre o estilo de aprendizado ou
                      dificuldades do aluno.
                    </p>
                    <Textarea
                      value={parentNotes}
                      onChange={(e) => setParentNotes(e.target.value)}
                      placeholder="Ex: Tem dificuldade com matemática básica. Gosta muito de dinossauros..."
                      className="min-h-[100px] resize-none"
                    />
                  </div>

                  <Button onClick={handleSavePlan} disabled={isSaving} className="w-full sm:w-auto">
                    {isSaving ? (
                      <span className="animate-spin mr-2">⏳</span>
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Salvar Plano
                  </Button>
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="tutor" className="h-full m-0 flex flex-col">
            <Alert className="mb-4 bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-800 flex-shrink-0">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Foco de Estudo</AlertTitle>
              <AlertDescription>
                O tutor foca nos tópicos ativos do plano letivo e realiza avaliações silenciosas
                para medir o progresso.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-3 mb-4 items-start sm:items-center flex-shrink-0">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Label className="whitespace-nowrap font-medium">Tópico Ativo:</Label>
                <Select value={activeTopicId} onValueChange={setActiveTopicId}>
                  <SelectTrigger className="w-full sm:w-[350px]">
                    <SelectValue placeholder="Selecione um tópico..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Assunto Geral</SelectItem>
                    {enabledTopics.map((id) => {
                      const t = availableTopics.find((x) => x.id === id)
                      return t ? (
                        <SelectItem key={id} value={id}>
                          {t.topic} - {t.subtopic.substring(0, 30)}...
                        </SelectItem>
                      ) : null
                    })}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={clearHistory}
                className="w-full sm:w-auto sm:ml-auto text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Limpar Histórico
              </Button>
            </div>

            <Card className="flex-1 overflow-hidden border-blue-200 dark:border-blue-900/50 shadow-sm flex flex-col min-h-0">
              <CardContent className="p-0 flex h-full flex-col bg-slate-50/50 dark:bg-slate-900/20">
                <ScrollArea ref={scrollRef} className="flex-1 p-4">
                  <div className="flex flex-col space-y-4">
                    {messages.length === 0 ? (
                      <div className="flex h-full flex-col items-center justify-center space-y-3 py-12 text-center text-muted-foreground opacity-50">
                        <BookOpen className="h-16 w-16 text-blue-300 dark:text-blue-800" />
                        <p className="text-lg font-medium text-blue-600/50 dark:text-blue-400/50">
                          Pronto para aprender!
                        </p>
                        <p className="text-sm max-w-sm">
                          Selecione um tópico acima e faça uma pergunta para iniciarmos os estudos.
                        </p>
                      </div>
                    ) : (
                      messages.map((m) => {
                        const contentToDisplay = displayContent(m.content)
                        const isAssistantEmpty = m.role === 'assistant' && !contentToDisplay

                        if (isAssistantEmpty && loading) {
                          return (
                            <div
                              key={m.id}
                              className="flex w-max max-w-[85%] items-center gap-2 self-start rounded-2xl bg-white dark:bg-slate-800 border border-blue-100 dark:border-blue-900/30 px-4 py-3 text-sm shadow-sm rounded-tl-sm text-muted-foreground animate-fade-in-up"
                            >
                              <PenTool className="h-4 w-4 animate-bounce text-blue-500" />
                              <span>Pensando...</span>
                            </div>
                          )
                        }

                        if (!contentToDisplay) return null

                        return (
                          <div
                            key={m.id}
                            className={cn(
                              'flex w-max max-w-[85%] flex-col gap-2 rounded-2xl px-4 py-3 text-sm animate-fade-in-up',
                              m.role === 'user'
                                ? 'self-end bg-blue-600 text-primary-foreground rounded-tr-sm'
                                : 'self-start bg-white dark:bg-slate-800 text-foreground border border-blue-100 dark:border-blue-900/30 shadow-sm rounded-tl-sm',
                            )}
                          >
                            <div className="whitespace-pre-wrap leading-relaxed">
                              {contentToDisplay}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </ScrollArea>

                <div className="p-4 bg-white dark:bg-slate-950 border-t border-blue-100 dark:border-blue-900/30">
                  <form onSubmit={handleSend} className="flex items-center gap-2">
                    <Input
                      placeholder="Faça uma pergunta ao tutor..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="flex-1 border-blue-200 dark:border-blue-800 focus-visible:ring-blue-500 dark:bg-slate-900"
                      disabled={
                        loading || (activeTopicId !== 'general' && enabledTopics.length === 0)
                      }
                    />
                    <Button
                      type="submit"
                      disabled={!input.trim() || loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Send className="h-4 w-4" />
                      <span className="sr-only">Enviar</span>
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="h-full m-0">
            {isPlanLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-[200px] w-full" />
                <Skeleton className="h-[200px] w-full" />
              </div>
            ) : (
              <ScrollArea className="h-full pr-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-blue-600">{summary.totalEnabled}</div>
                      <p className="text-xs text-muted-foreground mt-1">Tópicos Ativos</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-emerald-600">{summary.started}</div>
                      <p className="text-xs text-muted-foreground mt-1">Iniciados</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {summary.consolidated}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Consolidados</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-amber-500">{summary.advanced}</div>
                      <p className="text-xs text-muted-foreground mt-1">Avançados</p>
                    </CardContent>
                  </Card>
                </div>

                {enabledTopics.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    Nenhum tópico ativo no plano letivo.
                  </div>
                ) : (
                  <div className="space-y-4 pb-4">
                    {enabledTopics.map((id) => {
                      const topic = availableTopics.find((t) => t.id === id)
                      if (!topic) return null
                      const prog = progressData.find((p) => p.topic_id === id)
                      const level = prog?.mastery_level || 0
                      const color = getProgressColor(level)
                      const value = getProgressValue(level)
                      const sessions = prog?.sessions_count || 0

                      return (
                        <Card key={id}>
                          <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                              <div className="font-medium text-sm leading-tight max-w-[80%]">
                                <span
                                  className={cn(
                                    'text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm mr-2',
                                    areaColors[topic.area] ||
                                      'bg-secondary text-secondary-foreground',
                                  )}
                                >
                                  {topic.area}
                                </span>
                                {topic.topic} -{' '}
                                <span className="text-muted-foreground font-normal">
                                  {topic.subtopic}
                                </span>
                              </div>
                              <div
                                className={cn(
                                  'text-xs font-semibold whitespace-nowrap px-2 py-1 rounded-md text-white',
                                  color,
                                )}
                              >
                                {getLevelLabel(level)}
                              </div>
                            </div>
                            <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden mb-3">
                              <div
                                className={cn(
                                  'h-full transition-all duration-1000 ease-out',
                                  color,
                                )}
                                style={{ width: `${value}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Sessões concluídas: {sessions}</span>
                              {prog?.last_session_at ? (
                                <span>
                                  Última: {new Date(prog.last_session_at).toLocaleDateString()}
                                </span>
                              ) : (
                                <span>Nenhuma sessão</span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
