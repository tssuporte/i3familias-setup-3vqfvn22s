import { useState, useRef, useEffect } from 'react'
import { Info, Send, Loader2, Bot, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { useAIAssistant, type Mode } from '@/hooks/use-ai-assistant'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'

const MODES: Mode[] = ['Estudos', 'Cardápio', 'Semana Quebrada']

export default function AssistantPage() {
  const { user } = useAuth()
  const { messages, mode, setMode, loading, sendMessage, clearHistory } = useAIAssistant()
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  const handleSend = async () => {
    if (input.trim().length < 3 || input.trim().length > 500 || loading) return
    const msg = input
    setInput('')
    await sendMessage(msg)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  const isInputValid = input.trim().length >= 3 && input.trim().length <= 500

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-2rem)] max-w-4xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Assistente Familiar</h1>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="sr-only">Informações</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs text-sm">
                O assistente pode ajudar a organizar estudos, planejar refeições com base na sua
                despensa e reorganizar suas tarefas da semana.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            className="text-muted-foreground"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar Histórico
          </Button>
        )}
      </div>

      <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)} className="mb-4">
        <TabsList className="grid w-full grid-cols-3">
          {MODES.map((m) => (
            <TabsTrigger key={m} value={m} disabled={loading}>
              {m}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex-1 bg-card border rounded-lg shadow-sm overflow-hidden flex flex-col mb-4">
        <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto flex flex-col">
          <div
            role="log"
            aria-live="polite"
            className={cn(
              'space-y-6 flex-1',
              messages.length === 0 && 'flex flex-col items-center justify-center',
            )}
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                <img
                  src="https://img.usecurling.com/p/200/200?q=robot&color=blue"
                  alt="Assistente"
                  className="w-32 h-32 mb-4 opacity-50 grayscale"
                />
                <p className="text-lg font-medium text-foreground">Comece uma conversa...</p>
                <p className="text-sm mt-1 max-w-sm">
                  Escolha um modo acima e pergunte sobre organização familiar.
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex gap-3 max-w-[85%] animate-fade-in-up',
                    msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto',
                  )}
                >
                  <Avatar className="h-8 w-8 mt-1 border">
                    {msg.role === 'user' ? (
                      <>
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                      </>
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div
                    className={cn(
                      'px-4 py-3 rounded-2xl whitespace-pre-wrap text-sm',
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                        : 'bg-muted rounded-tl-sm',
                    )}
                  >
                    {msg.content === '' && msg.role === 'assistant' ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-3 bg-background border-t">
          <div className="relative flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte sobre estudos, cardápio ou semana quebrada..."
              className="min-h-[60px] max-h-[120px] resize-none pb-10"
              disabled={loading}
              maxLength={500}
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{input.length}/500</span>
              <Button
                size="icon"
                className="h-8 w-8 rounded-full"
                disabled={!isInputValid || loading}
                onClick={() => void handleSend()}
                aria-label="Enviar mensagem"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
