import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Archive } from 'lucide-react'
import { useFamily } from '@/contexts/FamilyContext'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getNotices,
  createNotice,
  updateNotice,
  type FamilyNotice,
} from '@/services/family_notices'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { format, isBefore, startOfDay } from 'date-fns'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const noticeSchema = z.object({
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  author_name: z.string().min(1, 'Nome do autor é obrigatório'),
  status: z.enum(['active', 'inactive']),
  expiry_date: z.string().optional(),
})

type NoticeFormValues = z.infer<typeof noticeSchema>

export default function Notices() {
  const [notices, setNotices] = useState<FamilyNotice[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingNotice, setEditingNotice] = useState<FamilyNotice | null>(null)

  const { family } = useFamily()
  const { toast } = useToast()

  const form = useForm<NoticeFormValues>({
    resolver: zodResolver(noticeSchema),
    defaultValues: {
      content: '',
      author_name: '',
      status: 'active',
      expiry_date: '',
    },
  })

  const loadNotices = useCallback(async () => {
    if (!family?.id) return
    try {
      const data = await getNotices(family.id)
      setNotices(data)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar avisos',
        description: getErrorMessage(error),
      })
    } finally {
      setLoading(false)
    }
  }, [family?.id, toast])

  useEffect(() => {
    loadNotices()
  }, [loadNotices])

  useRealtime('family_notices', () => {
    loadNotices()
  })

  const handleNew = () => {
    setEditingNotice(null)
    form.reset({
      content: '',
      author_name: '',
      status: 'active',
      expiry_date: '',
    })
    setDialogOpen(true)
  }

  const handleEdit = (notice: FamilyNotice) => {
    setEditingNotice(notice)
    form.reset({
      content: notice.content,
      author_name: notice.author_name,
      status: notice.status,
      expiry_date: notice.expiry_date ? notice.expiry_date.substring(0, 10) : '',
    })
    setDialogOpen(true)
  }

  const handleArchive = async (notice: FamilyNotice) => {
    try {
      await updateNotice(notice.id, { status: 'inactive' })
      toast({ title: 'Aviso arquivado' })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao arquivar',
        description: getErrorMessage(error),
      })
    }
  }

  const onSubmit = async (values: NoticeFormValues) => {
    if (!family?.id) return

    try {
      const dataToSave = {
        ...values,
        family_id: family.id,
        expiry_date: values.expiry_date ? `${values.expiry_date} 00:00:00.000Z` : '',
      }

      if (editingNotice) {
        await updateNotice(editingNotice.id, dataToSave)
        toast({ title: 'Aviso atualizado com sucesso' })
      } else {
        await createNotice(dataToSave)
        toast({ title: 'Aviso criado com sucesso' })
      }
      setDialogOpen(false)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: getErrorMessage(error),
      })
    }
  }

  const isExpired = (dateString?: string) => {
    if (!dateString) return false
    return isBefore(new Date(dateString), startOfDay(new Date()))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Avisos</h1>
        <Button onClick={handleNew}>
          <Plus className="w-4 h-4 mr-2" /> Novo Aviso
        </Button>
      </div>

      {!loading && notices.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground mb-4">Nenhum aviso encontrado.</p>
          <Button variant="outline" onClick={handleNew}>
            Criar o primeiro aviso
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notices.map((notice) => {
            const expired = isExpired(notice.expiry_date)
            return (
              <Card key={notice.id} className={cn('flex flex-col', expired && 'opacity-60')}>
                <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-2">
                    <Badge variant={notice.status === 'active' ? 'default' : 'secondary'}>
                      {notice.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                    {expired && <Badge variant="destructive">Expirado</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="whitespace-pre-wrap">{notice.content}</p>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground flex items-end justify-between border-t pt-4">
                  <div className="space-y-1">
                    <div>Por: {notice.author_name}</div>
                    <div>Em: {format(new Date(notice.created), 'dd/MM/yyyy')}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(notice)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    {notice.status === 'active' && (
                      <Button variant="ghost" size="icon" onClick={() => handleArchive(notice)}>
                        <Archive className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingNotice ? 'Editar Aviso' : 'Novo Aviso'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conteúdo</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Escreva o aviso aqui..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="author_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Autor</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="inactive">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expiry_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expira em (opcional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
