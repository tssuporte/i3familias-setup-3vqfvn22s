import { useState, useMemo } from 'react'
import { Search, Plus, ShoppingBasket, X } from 'lucide-react'
import { usePantry } from '@/hooks/use-pantry'
import { PantryItemCard } from './PantryItemCard'
import { PantryModal } from './PantryModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import type { PantryItem } from '@/services/pantry'
import { isPast, differenceInDays, startOfDay, parseISO } from 'date-fns'

export default function Pantry() {
  const { items, loading, addItem, editItem, removeItem, updateQuantity } = usePantry()

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null)

  const categories = useMemo(() => {
    const cats = new Set(items.map((i) => i.category).filter(Boolean))
    return Array.from(cats) as string[]
  }, [items])

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false
      if (statusFilter !== 'all') {
        if (!item.expiry_date) return false
        const date = startOfDay(parseISO(item.expiry_date))
        const today = startOfDay(new Date())
        const isExp = isPast(date) && date.getTime() < today.getTime()
        const diff = differenceInDays(date, today)
        if (statusFilter === 'expired' && !isExp) return false
        if (statusFilter === 'expiring' && (isExp || diff > 7)) return false
        if (statusFilter === 'ok' && (isExp || diff <= 7)) return false
      }
      return true
    })
  }, [items, search, categoryFilter, statusFilter])

  const handleSave = async (data: Partial<PantryItem>) => {
    if (editingItem) {
      return editItem(editingItem.id, data)
    }
    return addItem(data)
  }

  const openAddModal = () => {
    setEditingItem(null)
    setModalOpen(true)
  }

  const openEditModal = (item: PantryItem) => {
    setEditingItem(item)
    setModalOpen(true)
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Despensa</h1>
        <Button onClick={openAddModal} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Adicionar
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar itens..."
            className="pl-9 pr-9 bg-background/50 focus:bg-background transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={loading}
          />
          {search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => setSearch('')}
            >
              <X className="w-4 h-4" />
              <span className="sr-only">Limpar busca</span>
            </Button>
          )}
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter} disabled={loading}>
          <SelectTrigger className="w-full sm:w-[180px] bg-secondary border-transparent hover:bg-secondary/80 focus:ring-primary transition-colors">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent className="animate-in fade-in-80 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
            <SelectItem value="all">Todas Categorias</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter} disabled={loading}>
          <SelectTrigger className="w-full sm:w-[180px] bg-secondary border-transparent hover:bg-secondary/80 focus:ring-primary transition-colors">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="animate-in fade-in-80 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="ok">No prazo</SelectItem>
            <SelectItem value="expiring">Vence em breve</SelectItem>
            <SelectItem value="expired">Vencido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[280px] rounded-xl" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up bg-card/40 border border-dashed rounded-2xl shadow-sm p-6 mt-8">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
            <ShoppingBasket className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-[20px] font-bold mb-3 text-foreground">Sua despensa está vazia</h2>
          <p className="text-[14px] text-muted-foreground mb-8 max-w-md">
            Você ainda não possui itens cadastrados na despensa ou nenhum item corresponde aos
            filtros selecionados.
          </p>
          <Button
            onClick={openAddModal}
            size="lg"
            className="px-8 shadow-md hover:shadow-lg transition-all"
          >
            Adicionar Item
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <PantryItemCard
              key={item.id}
              item={item}
              onEdit={openEditModal}
              onDelete={removeItem}
              onMarkUsed={updateQuantity}
            />
          ))}
        </div>
      )}

      <PantryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        item={editingItem}
        onSave={handleSave}
      />
    </div>
  )
}
