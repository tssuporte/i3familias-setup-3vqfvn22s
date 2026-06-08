import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarIcon, MessageCircle, Download, Upload, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import pb from '@/lib/pocketbase/client'

export function IntegrationsTab() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importSummary, setImportSummary] = useState<{
    members: number
    tasks: number
    events: number
  } | null>(null)

  const handleExport = async () => {
    try {
      setLoading(true)
      const families = await pb.collection('families').getFullList()
      const members = await pb.collection('family_members').getFullList()
      const tasks = await pb.collection('tasks_children').getFullList()
      const events = await pb.collection('calendar_events').getFullList()

      const data = {
        families,
        members,
        tasks,
        events,
        exportedAt: new Date().toISOString(),
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `i3familias-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Dados exportados com sucesso!')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao exportar dados.')
    } finally {
      setLoading(false)
    }
  }

  const handleImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        const data = JSON.parse(content)

        const membersCount = Array.isArray(data.members) ? data.members.length : 0
        const tasksCount = Array.isArray(data.tasks) ? data.tasks.length : 0
        const eventsCount = Array.isArray(data.events) ? data.events.length : 0

        setImportSummary({
          members: membersCount,
          tasks: tasksCount,
          events: eventsCount,
        })
        toast.success('Arquivo lido com sucesso.')
      } catch (error) {
        toast.error('Arquivo JSON inválido.')
        setImportSummary(null)
      }
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
    reader.readAsText(file)
  }

  const handleDeleteAccount = () => {
    pb.authStore.clear()
    navigate('/auth/login')
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
                <p className="font-medium text-sm flex items-center gap-2">
                  Google Calendar
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                    Em breve
                  </Badge>
                </p>
                <p className="text-xs text-muted-foreground">
                  Sincronize tarefas e eventos de toda a família.
                </p>
              </div>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Conectar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Integração em Desenvolvimento</DialogTitle>
                  <DialogDescription>
                    Esta integração está em desenvolvimento. Em breve você poderá sincronizar
                    eventos com o Google Calendar.
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 border rounded-md">
                <MessageCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm flex items-center gap-2">
                  WhatsApp
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                    Em breve
                  </Badge>
                </p>
                <p className="text-xs text-muted-foreground">
                  Receba alertas rápidos diretamente no seu número.
                </p>
              </div>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Conectar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Integração em Desenvolvimento</DialogTitle>
                  <DialogDescription>
                    Esta integração está em desenvolvimento. Em breve você poderá receber
                    notificações no seu WhatsApp.
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
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
              onClick={handleExport}
              disabled={loading}
            >
              <Download className="mr-2 h-4 w-4" /> Exportar Dados
            </Button>

            <input
              type="file"
              accept=".json"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImportChange}
            />
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" /> Importar Dados
            </Button>
          </div>

          {importSummary && (
            <div className="p-4 border rounded-md bg-muted/30">
              <p className="text-sm font-medium mb-2">Resumo da Importação (Pré-visualização):</p>
              <ul className="text-sm text-muted-foreground list-disc list-inside ml-2 space-y-1">
                <li>Encontrado: {importSummary.members} membros</li>
                <li>Encontrado: {importSummary.tasks} tarefas</li>
                <li>Encontrado: {importSummary.events} eventos</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-3">
                A importação real de dados será habilitada em uma atualização futura.
              </p>
            </div>
          )}

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
                    onClick={handleDeleteAccount}
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
