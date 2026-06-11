import { useState, useRef, useEffect } from 'react'
import { BookOpen, Send, Trash2, GraduationCap, PenTool, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useSchoolHelper } from '@/hooks/use-school-helper'
import { cn } from '@/lib/utils'

export default function Studies() {
  const { messages, loading, sendMessage, clearHistory } = useSchoolHelper()
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || loading) return
    const message = input.trim()
    setInput('')
    await sendMessage(message)
  }

  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [messages])

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
            <GraduationCap className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
              Tutor Escolar
            </h1>
            <p className="text-sm text-muted-foreground">Seu assistente de estudos particular</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={clearHistory}
          className="text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Limpar Histórico
        </Button>
      </div>

      <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-900/50 dark:text-yellow-200">
        <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        <AlertTitle className="font-semibold">Lembrete</AlertTitle>
        <AlertDescription>
          O tutor explica os conceitos mas não faz a lição por você!
        </AlertDescription>
      </Alert>

      <Card className="flex-1 overflow-hidden border-blue-200 dark:border-blue-900/50 shadow-sm">
        <CardContent className="p-0 flex h-full flex-col bg-slate-50/50 dark:bg-slate-900/20">
          <ScrollArea ref={scrollRef} className="flex-1 p-4">
            <div className="flex flex-col space-y-4">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center space-y-3 py-12 text-center text-muted-foreground opacity-50">
                  <BookOpen className="h-16 w-16 text-blue-300 dark:text-blue-800" />
                  <p className="text-lg font-medium text-blue-600/50 dark:text-blue-400/50">
                    Nenhuma mensagem ainda
                  </p>
                  <p className="text-sm max-w-sm">
                    Estou aqui para ajudar com matemática, ciências, história e muito mais!
                  </p>
                </div>
              ) : (
                messages.map((m) => {
                  const isAssistantEmpty = m.role === 'assistant' && !m.content
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
                      <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                    </div>
                  )
                })
              )}
            </div>
          </ScrollArea>

          <div className="p-4 bg-white dark:bg-slate-950 border-t border-blue-100 dark:border-blue-900/30">
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <Input
                placeholder="Pergunte sobre qualquer matéria escolar..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 border-blue-200 dark:border-blue-800 focus-visible:ring-blue-500 dark:bg-slate-900"
                disabled={loading}
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
    </div>
  )
}
