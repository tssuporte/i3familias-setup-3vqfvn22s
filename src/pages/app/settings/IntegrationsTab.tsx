import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarIcon, MessageCircle, Download, Upload, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function IntegrationsTab() {
  const [loading, setLoading] = useState(false)

  const handleAction = (message: string) => {
    if (loading) return
    setLoading(true)
    setTimeout(() => {
      toast.success(message)
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Conexões Externas</CardTitle>
          <CardDescription>
            Vincule outros serviços à sua conta para facilitar sua gestão.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 border rounded-md">
                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">Google Calendar</p>
                <p className="text-xs text-muted-foreground">
                  Sincronize tarefas e eventos de toda a família.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('Redirecionando para o Google Calendar...')}
            >
              Conectar
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 border rounded-md">
                <MessageCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">WhatsApp</p>
                <p className="text-xs text-muted-foreground">
                  Receba alertas rápidos diretamente no seu número.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('Iniciando conexão com WhatsApp...')}
            >
              Conectar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dados e Privacidade</CardTitle>
          <CardDescription>Gerencie suas informações pessoais de forma segura.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => handleAction('Preparando exportação de dados...')}
            >
              <Download className="mr-2 h-4 w-4" /> Exportar Dados
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => handleAction('Por favor, selecione um arquivo válido')}
            >
              <Upload className="mr-2 h-4 w-4" /> Importar Dados
            </Button>
          </div>

          <div className="pt-4 border-t">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" /> Deletar Conta
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa ação não pode ser desfeita. Isso irá deletar permanentemente sua conta, as
                    informações da sua família e todos os dados associados armazenados nos nossos
                    servidores.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => handleAction('Sua solicitação de deleção foi agendada.')}
                  >
                    Sim, deletar conta
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
