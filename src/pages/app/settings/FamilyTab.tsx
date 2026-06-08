import { useState } from 'react'
import { useFamily } from '@/contexts/FamilyContext'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { differenceInYears } from 'date-fns'

export function FamilyTab() {
  const { members, addMember, updateMember, refreshFamily } = useFamily()
  const { toast } = useToast()

  const adults = members.filter((m) => m.member_type === 'adult')
  const children = members.filter((m) => m.member_type === 'child')

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    birth_date: '',
    member_type: 'child',
    role: '',
    education_type: 'traditional',
    dietary_restrictions: '',
    pin_code: '',
    photo_url: '',
  })

  const resetForm = () => {
    setFormData({
      name: '',
      birth_date: '',
      member_type: 'child',
      role: '',
      education_type: 'traditional',
      dietary_restrictions: '',
      pin_code: '',
      photo_url: '',
    })
    setEditingId(null)
  }

  const openEdit = (m: any) => {
    setFormData({
      name: m.name || '',
      birth_date: m.birth_date ? m.birth_date.substring(0, 10) : '',
      member_type: m.member_type || 'child',
      role: m.role || '',
      education_type: m.education_type || 'traditional',
      dietary_restrictions: m.dietary_restrictions || '',
      pin_code: m.pin_code || '',
      photo_url: m.photo_url || '',
    })
    setEditingId(m.id)
    setOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!formData.name.trim() || !formData.birth_date) {
      toast({ title: 'Preencha nome e data de nascimento.', variant: 'destructive' })
      return
    }

    if (formData.pin_code && !/^\d{4}$/.test(formData.pin_code)) {
      toast({ title: 'O PIN deve ter exatos 4 dígitos numéricos.', variant: 'destructive' })
      return
    }

    try {
      const dataToSave = {
        ...formData,
        education_type: formData.member_type === 'child' ? formData.education_type : null,
        birth_date: new Date(`${formData.birth_date}T12:00:00Z`).toISOString(),
      }

      if (editingId) {
        await updateMember(editingId, dataToSave)
        toast({ title: 'Membro atualizado com sucesso!' })
      } else {
        await addMember(dataToSave)
        toast({ title: 'Membro adicionado com sucesso!' })
      }
      setOpen(false)
      resetForm()
      await refreshFamily()
    } catch (err: any) {
      toast({ title: 'Erro ao salvar membro', description: err.message, variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await pb.collection('family_members').delete(id)
      await refreshFamily()
      toast({ title: 'Membro removido com sucesso.' })
    } catch (err: any) {
      toast({ title: 'Erro ao remover membro', description: err.message, variant: 'destructive' })
    }
  }

  const renderMember = (m: any) => {
    const age = m.birth_date ? differenceInYears(new Date(), new Date(m.birth_date)) : '?'
    const initials = (m.name || 'U')
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()

    return (
      <Card key={m.id} className="relative overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={m.photo_url} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{m.name}</h3>
                <div className="flex space-x-2">
                  <Button type="button" variant="ghost" size="icon" onClick={() => openEdit(m)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button type="button" variant="ghost" size="icon" className="text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover membro</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja remover {m.name}? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-500 text-white hover:bg-red-600"
                          onClick={() => handleDelete(m.id)}
                        >
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {age} anos • {m.role || m.member_type}
              </p>

              <div className="flex flex-wrap gap-2 mt-2">
                {m.pin_code && <Badge variant="secondary">PIN: ****</Badge>}
                {m.member_type === 'child' && m.education_type && (
                  <Badge variant="outline">
                    {m.education_type === 'homeschooling' ? 'Homeschooling' : 'Tradicional'}
                  </Badge>
                )}
                {m.dietary_restrictions && (
                  <Badge
                    variant="destructive"
                    className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-none"
                  >
                    Restrições Alimentares
                  </Badge>
                )}
              </div>

              {m.dietary_restrictions && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  <span className="font-medium">Notas alimentares:</span> {m.dietary_restrictions}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Membros da Família</h2>
          <p className="text-sm text-muted-foreground">Gerencie quem faz parte da sua casa.</p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(val) => {
            if (!val) resetForm()
            setOpen(val)
          }}
        >
          <DialogTrigger asChild>
            <Button type="button" onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" /> Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Membro' : 'Novo Membro'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Nome Completo *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Data de Nascimento *</Label>
                  <Input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Membro</Label>
                  <Select
                    value={formData.member_type}
                    onValueChange={(v) => setFormData({ ...formData, member_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adult">Adulto</SelectItem>
                      <SelectItem value="child">Criança</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Papel (ex: Mãe, Filho)</Label>
                  <Input
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>PIN (4 dígitos)</Label>
                  <Input
                    value={formData.pin_code}
                    maxLength={4}
                    onChange={(e) =>
                      setFormData({ ...formData, pin_code: e.target.value.replace(/\D/g, '') })
                    }
                    placeholder="Ex: 1234"
                  />
                </div>
              </div>

              {formData.member_type === 'child' && (
                <div className="space-y-2 border-t pt-4">
                  <Label>Tipo de Educação</Label>
                  <Select
                    value={formData.education_type}
                    onValueChange={(v) => setFormData({ ...formData, education_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="traditional">Escola Tradicional</SelectItem>
                      <SelectItem value="homeschooling">Homeschooling</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2 border-t pt-4">
                <Label>Foto (URL)</Label>
                <Input
                  value={formData.photo_url}
                  onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2 border-t pt-4">
                <Label>Restrições Alimentares / Alergias</Label>
                <Textarea
                  value={formData.dietary_restrictions}
                  onChange={(e) =>
                    setFormData({ ...formData, dietary_restrictions: e.target.value })
                  }
                  placeholder="Ex: Intolerância à lactose, vegetariano..."
                  className="resize-none"
                />
              </div>

              <Button type="submit" className="w-full mt-4">
                {editingId ? 'Salvar Alterações' : 'Adicionar Membro'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-muted-foreground border-b pb-2">Adultos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {adults.map(renderMember)}
          {adults.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-2">Nenhum adulto cadastrado.</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-muted-foreground border-b pb-2">
          Crianças e Adolescentes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {children.map(renderMember)}
          {children.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-2">Nenhuma criança cadastrada.</p>
          )}
        </div>
      </div>
    </div>
  )
}
