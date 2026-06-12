import { useState, useEffect } from 'react'
import { useFamily } from '@/contexts/FamilyContext'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import {
  Plus,
  Pencil,
  Trash2,
  KeyRound,
  UserCheck,
  Clock,
  ShieldOff,
  Eye,
  EyeOff,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getFamilyMemberAccounts,
  createMemberAccount,
  resetMemberPassword,
  deleteMemberAccount,
} from '@/services/member_accounts'
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

  const familyId = members.length > 0 ? members[0].family_id : null

  const [accounts, setAccounts] = useState<any[]>([])
  const [loadingAccounts, setLoadingAccounts] = useState(true)

  const [accessDialogOpen, setAccessDialogOpen] = useState(false)
  const [accessMode, setAccessMode] = useState<'create' | 'reset'>('create')
  const [selectedMember, setSelectedMember] = useState<any>(null)
  const [accessForm, setAccessForm] = useState({
    username: '',
    password: '',
    role: 'child',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isSavingAccess, setIsSavingAccess] = useState(false)

  const loadAccounts = async () => {
    if (!familyId) {
      setLoadingAccounts(false)
      return
    }
    try {
      const data = await getFamilyMemberAccounts(familyId)
      setAccounts(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingAccounts(false)
    }
  }

  useEffect(() => {
    loadAccounts()
  }, [familyId])

  const openAccessDialog = (member: any, mode: 'create' | 'reset') => {
    setSelectedMember(member)
    setAccessMode(mode)

    if (mode === 'create') {
      const generatedUsername = member.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '.')
      setAccessForm({
        username: generatedUsername,
        password: '',
        role: member.member_type === 'adult' ? 'adult' : 'child',
      })
    } else {
      const account = accounts.find((a) => a.member_id === member.id)
      setAccessForm({
        username: account?.username || '',
        password: '',
        role: account?.role || 'child',
      })
    }

    setShowPassword(false)
    setAccessDialogOpen(true)
  }

  const handleSaveAccess = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!familyId || !selectedMember) return

    setIsSavingAccess(true)
    try {
      if (accessMode === 'create') {
        await createMemberAccount({
          family_id: familyId,
          member_id: selectedMember.id,
          username: accessForm.username,
          email: accessForm.username,
          password: accessForm.password,
          passwordConfirm: accessForm.password,
          role: accessForm.role,
        })
        toast({ title: 'Acesso criado com sucesso!' })
      } else {
        const account = accounts.find((a) => a.member_id === selectedMember.id)
        if (account) {
          await resetMemberPassword(account.id, accessForm.password)
          toast({ title: 'Senha redefinida com sucesso!' })
        }
      }
      setAccessDialogOpen(false)
      loadAccounts()
    } catch (err: any) {
      toast({ title: 'Erro ao salvar acesso', description: err.message, variant: 'destructive' })
    } finally {
      setIsSavingAccess(false)
    }
  }

  const handleDeleteAccess = async (memberId: string) => {
    const account = accounts.find((a) => a.member_id === memberId)
    if (!account) return

    try {
      await deleteMemberAccount(account.id)
      toast({ title: 'Acesso removido com sucesso.' })
      loadAccounts()
    } catch (err: any) {
      toast({ title: 'Erro ao remover acesso', description: err.message, variant: 'destructive' })
    }
  }

  const [formData, setFormData] = useState({
    name: '',
    birth_date: '',
    member_type: 'child',
    role: '',
    education_type: 'traditional',
    school_year: '',
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
      school_year: '',
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
      school_year: m.school_year || '',
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
        school_year:
          formData.member_type === 'child' && formData.school_year ? formData.school_year : null,
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

    const schoolYearLabel = (val: string) => {
      if (val === 'pre') return 'Pré-escola'
      if (val?.startsWith('ef')) return `${val.replace('ef', '')}º EF`
      if (val?.startsWith('em')) return `${val.replace('em', '')}º EM`
      return val
    }

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
                {m.member_type === 'child' && m.school_year && (
                  <Badge variant="outline">{schoolYearLabel(m.school_year)}</Badge>
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
                <>
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
                  <div className="space-y-2 pt-2">
                    <Label>Ano Escolar Atual</Label>
                    <Select
                      value={formData.school_year || undefined}
                      onValueChange={(v) => setFormData({ ...formData, school_year: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o ano escolar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pre">Pré-escola (4-5 anos)</SelectItem>
                        <SelectItem value="ef1">1º ano — Ensino Fundamental</SelectItem>
                        <SelectItem value="ef2">2º ano — Ensino Fundamental</SelectItem>
                        <SelectItem value="ef3">3º ano — Ensino Fundamental</SelectItem>
                        <SelectItem value="ef4">4º ano — Ensino Fundamental</SelectItem>
                        <SelectItem value="ef5">5º ano — Ensino Fundamental</SelectItem>
                        <SelectItem value="ef6">6º ano — Ensino Fundamental</SelectItem>
                        <SelectItem value="ef7">7º ano — Ensino Fundamental</SelectItem>
                        <SelectItem value="ef8">8º ano — Ensino Fundamental</SelectItem>
                        <SelectItem value="ef9">9º ano — Ensino Fundamental</SelectItem>
                        <SelectItem value="em1">1º ano — Ensino Médio</SelectItem>
                        <SelectItem value="em2">2º ano — Ensino Médio</SelectItem>
                        <SelectItem value="em3">3º ano — Ensino Médio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
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

      <div className="space-y-4 pt-8">
        <div className="flex items-center gap-2 border-b pb-2">
          <KeyRound className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">Controle de Acesso</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Gerencie contas de acesso individual para os membros da sua família.
        </p>

        {loadingAccounts ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((member) => {
              const account = accounts.find((a) => a.member_id === member.id)
              const initials = (member.name || 'U')
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase()

              return (
                <Card key={member.id} className="relative overflow-hidden">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.photo_url} />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium leading-none">{member.name}</h4>
                          {account ? (
                            <div className="flex items-center gap-2 mt-1.5">
                              <UserCheck className="h-3.5 w-3.5 text-green-600" />
                              <span className="text-xs font-medium text-green-600">
                                @{account.username}
                              </span>
                              <Badge variant="outline" className="text-[10px] h-4 px-1">
                                {account.role === 'admin'
                                  ? 'Admin'
                                  : account.role === 'adult'
                                    ? 'Adulto'
                                    : 'Criança'}
                              </Badge>
                            </div>
                          ) : (
                            <div className="mt-1">
                              <span className="text-xs text-muted-foreground">
                                Sem acesso configurado
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:ml-auto">
                        {account ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openAccessDialog(member, 'reset')}
                            >
                              Redefinir Senha
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                  <ShieldOff className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remover Acesso</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja remover o acesso de {member.name}? Eles
                                    não poderão mais fazer login.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-500 text-white hover:bg-red-600"
                                    onClick={() => handleDeleteAccess(member.id)}
                                  >
                                    Remover
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openAccessDialog(member, 'create')}
                          >
                            Criar Acesso
                          </Button>
                        )}
                      </div>
                    </div>

                    {account && account.updated && (
                      <div className="flex items-center gap-1 mt-3 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Atualizado em {new Date(account.updated).toLocaleDateString()}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <Dialog open={accessDialogOpen} onOpenChange={setAccessDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {accessMode === 'create' ? 'Criar Acesso' : 'Redefinir Senha'}
            </DialogTitle>
            {selectedMember && (
              <p className="text-sm text-muted-foreground mt-1">
                Para o membro:{' '}
                <span className="font-medium text-foreground">{selectedMember.name}</span>
              </p>
            )}
          </DialogHeader>
          <form onSubmit={handleSaveAccess} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>E-mail / Nome de Usuário</Label>
              <Input
                value={accessForm.username}
                onChange={(e) =>
                  setAccessForm({
                    ...accessForm,
                    username: e.target.value.toLowerCase().replace(/\s+/g, '.'),
                  })
                }
                disabled={accessMode === 'reset'}
                placeholder="ex: joao.silva@email.com"
                required
              />
            </div>

            {accessMode === 'create' && (
              <div className="space-y-2">
                <Label>Função / Permissão</Label>
                <Select
                  value={accessForm.role}
                  onValueChange={(v) => setAccessForm({ ...accessForm, role: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="child">Criança (Limitado)</SelectItem>
                    <SelectItem value="adult">Adulto</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Nova Senha</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={accessForm.password}
                  onChange={(e) => setAccessForm({ ...accessForm, password: e.target.value })}
                  placeholder="Mínimo 8 caracteres"
                  minLength={8}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-4"
              disabled={
                isSavingAccess || accessForm.username.length === 0 || accessForm.password.length < 8
              }
            >
              {isSavingAccess ? 'Salvando...' : 'Salvar Acesso'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
