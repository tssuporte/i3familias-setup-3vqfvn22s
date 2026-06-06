import { useState } from 'react'
import { BookOpen, MessageSquare, TrendingUp, Trophy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { LineChart, Line, XAxis, ResponsiveContainer } from 'recharts'
import pb from '@/lib/pocketbase/client'

const CHART_DATA = [
  { day: 'Seg', pontos: 10 },
  { day: 'Ter', pontos: 25 },
  { day: 'Qua', pontos: 20 },
  { day: 'Qui', pontos: 40 },
  { day: 'Sex', pontos: 35 },
  { day: 'Sab', pontos: 50 },
]

export function ChildInterface10to12({ member }: { member: any }) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    {
      role: 'assistant',
      content: 'Olá! Sou seu Assistente de Estudos. Como posso ajudar com a escola hoje?',
    },
  ])
  const [chatInput, setChatInput] = useState('')
  const [loadingChat, setLoadingChat] = useState(false)

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return
    const userMsg = chatInput.trim()
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }])
    setChatInput('')
    setLoadingChat(true)

    try {
      const res = await pb.send('/backend/v1/school-helper/chat', {
        method: 'POST',
        body: JSON.stringify({ message: userMsg }),
      })
      setMessages((prev) => [...prev, { role: 'assistant', content: res.content }])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Desculpe, estou com problemas técnicos agora.' },
      ])
    } finally {
      setLoadingChat(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Minha Agenda de Estudos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center border border-blue-100 dark:border-blue-900 gap-2">
                <span className="font-medium">Matemática - Revisão para Prova</span>
                <span className="text-sm bg-white dark:bg-slate-900 px-2 py-1 rounded shadow-sm w-max">
                  Hoje 15:00
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Meu Desempenho
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ChartContainer
                  config={{ pontos: { label: 'Pontos', color: 'hsl(var(--primary))' } }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={CHART_DATA}>
                      <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="pontos"
                        stroke="var(--color-pontos)"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                Ranking da Semana
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-2 font-bold bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                <span>1. Você</span>
                <span>50 pts</span>
              </div>
              <div className="flex items-center justify-between p-2 text-muted-foreground">
                <span>2. Ana</span>
                <span>42 pts</span>
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col h-[400px]">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="flex items-center text-lg">
                <MessageSquare className="w-5 h-5 mr-2 text-primary" />
                Assistente Escolar
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                          m.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-none'
                            : 'bg-muted rounded-bl-none'
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {loadingChat && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-2xl rounded-bl-none px-4 py-2 text-sm animate-pulse">
                        Digitando...
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="p-3 border-t bg-slate-50 dark:bg-slate-900/50 flex space-x-2">
                <Input
                  placeholder="Faça uma pergunta..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={loadingChat}
                />
                <Button onClick={handleSendMessage} disabled={loadingChat || !chatInput.trim()}>
                  Enviar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
