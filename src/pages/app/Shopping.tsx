import { useState, useMemo, useEffect } from 'react'
import { useShoppingList } from '@/hooks/use-shopping-list'
import { ShoppingItem } from '@/services/shopping'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Trash2, Edit, Plus, Wand2, RefreshCcw, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  quantity: z.coerce.number().min(0.01, 'Quantidade deve ser maior que zero'),
  unit: z.string().min(1, 'Unidade é obrigatória'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  estimated_price: z.coerce.number().min(0, 'Preço deve ser maior ou igual a zero'),
})

type FormValues = z.infer<typeof schema>

export default function Shopping() {
  const {
    items,
    loading,
    error,
    generating,
    budget,
    totalCost,
    addItem,
    updateItem,
    removeItem,
    clearPurchased,
    generateList,
    fetchItems,
  } = useShoppingList()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      quantity: 1,
      unit: 'un',
      category: 'Geral',
      estimated_price: 0,
    },
  })

  const watchName = form.watch('name')

  useEffect(() => {
    if (!editingItem && watchName) {
      const lowerName = watchName.toLowerCase()
      let suggestedCategory = ''

      const categoriesMap: Record<string, string[]> = {
        Mercearia: ['arroz', 'feijão', 'macarrão', 'óleo', 'azeite', 'açúcar', 'sal', 'café'],
        Limpeza: ['detergente', 'sabão', 'amaciante', 'desinfetante', 'esponja', 'água sanitária'],
        Higiene: [
          'shampoo',
          'sabonete',
          'creme',
          'condicionador',
          'pasta',
          'escova',
          'desodorante',
        ],
        Hortifruti: ['maçã', 'banana', 'alface', 'tomate', 'cebola', 'alho', 'batata', 'cenoura'],
        Açougue: ['carne', 'frango', 'peixe', 'bife', 'linguiça', 'salsicha'],
        'Frios e Laticínios': ['leite', 'queijo', 'manteiga', 'presunto', 'iogurte', 'requeijão'],
        Padaria: ['pão', 'bolo', 'torrada', 'biscoito'],
        Bebidas: ['suco', 'refrigerante', 'cerveja', 'água', 'vinho'],
      }

      for (const [category, keywords] of Object.entries(categoriesMap)) {
        if (keywords.some((keyword) => lowerName.includes(keyword))) {
          suggestedCategory = category
          break
        }
      }

      if (suggestedCategory) {
        const currentCat = form.getValues('category')
        if (!currentCat || currentCat === 'Geral') {
          form.setValue('category', suggestedCategory)
        }
      }
    }
  }, [watchName, editingItem, form])

  const openAddModal = () => {
    setEditingItem(null)
    form.reset({ name: '', quantity: 1, unit: 'un', category: 'Geral', estimated_price: 0 })
    setIsModalOpen(true)
  }

  const openEditModal = (item: ShoppingItem) => {
    setEditingItem(item)
    form.reset({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      estimated_price: item.estimated_price || 0,
    })
    setIsModalOpen(true)
  }

  const onSubmit = async (data: FormValues) => {
    if (editingItem) {
      await updateItem(editingItem.id, data)
    } else {
      await addItem(data)
    }
    setIsModalOpen(false)
  }

  const categories = useMemo(() => {
    const cats = Array.from(new Set(items.map((i) => i.category)))
    return cats.sort()
  }, [items])

  const rawPercent = budget > 0 ? (totalCost / budget) * 100 : 0
  const displayPercent = Math.min(rawPercent, 100)
  const progressColor =
    rawPercent < 80 ? 'bg-green-500' : rawPercent <= 100 ? 'bg-yellow-500' : 'bg-red-500'

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Lista de Compras</h1>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={generateList}
            disabled={generating}
            className="flex-1 sm:flex-none"
          >
            {generating ? (
              <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4 mr-2" />
            )}
            Gerar
          </Button>
          <Button variant="secondary" onClick={clearPurchased} className="flex-1 sm:flex-none">
            Limpar Comprados
          </Button>
          <Button onClick={openAddModal} className="flex-1 sm:flex-none">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-sm text-muted-foreground font-medium mb-1">Orçamento Estimado</p>
            <p className="text-2xl font-bold">
              {budget > 0
                ? `R$ ${totalCost.toFixed(2)} de R$ ${budget.toFixed(2)}`
                : `R$ ${totalCost.toFixed(2)}`}
            </p>
          </div>
        </div>
        {budget > 0 && (
          <Progress
            value={displayPercent}
            className="h-2 w-full rounded-full"
            indicatorClassName={progressColor}
          />
        )}
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border rounded-xl border-dashed border-red-200 bg-red-50/50 dark:bg-red-950/10">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => fetchItems(true)} variant="outline">
            Tentar Novamente
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border rounded-xl border-dashed bg-card/50">
          <ShoppingCart className="w-16 h-16 text-primary mb-4 opacity-80" />
          <h3 className="text-xl font-medium mb-2">Lista Vazia</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Sua lista de compras está vazia. Adicione itens para começar!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button onClick={openAddModal} variant="default">
              <Plus className="w-4 h-4 mr-2" /> Adicionar Item
            </Button>
            <Button variant="default" onClick={generateList} disabled={generating}>
              {generating ? (
                <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4 mr-2" />
              )}
              Gerar Lista
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {categories.map((category) => {
            const categoryItems = items.filter((i) => i.category === category)
            const pending = categoryItems.filter((i) => !i.is_purchased)
            const purchased = categoryItems.filter((i) => i.is_purchased)

            if (categoryItems.length === 0) return null

            return (
              <div
                key={category}
                className="flex flex-col border border-border rounded-lg shadow-sm bg-card"
              >
                <h3 className="font-bold text-lg bg-secondary rounded-t-lg p-3 flex items-center justify-between text-secondary-foreground">
                  {category}
                  <span className="text-xs bg-background/50 text-foreground px-2 py-0.5 rounded-full font-medium">
                    {pending.length} pendentes
                  </span>
                </h3>
                <div className="flex flex-col rounded-b-lg overflow-hidden">
                  {[...pending, ...purchased].map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        'group flex items-center justify-between p-3 border-l-2 border-l-secondary border-b border-border last:border-b-0 transition-all',
                        item.is_purchased
                          ? 'opacity-50 text-muted-foreground bg-muted/20'
                          : 'hover:bg-accent hover:shadow-sm bg-card',
                      )}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Checkbox
                          checked={item.is_purchased}
                          onCheckedChange={(checked) =>
                            updateItem(item.id, { is_purchased: !!checked })
                          }
                          className="w-5 h-5 rounded-full flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0 flex items-center justify-between gap-2 sm:gap-4">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span
                              className={cn(
                                'font-medium truncate',
                                item.is_purchased && 'line-through',
                              )}
                            >
                              {item.name}
                            </span>
                            {item.source === 'auto-generated' && (
                              <Wand2 className="w-3 h-3 text-primary flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-3 sm:gap-4 text-right flex-shrink-0">
                            <span className="text-sm opacity-80 whitespace-nowrap">
                              {item.quantity} {item.unit}
                            </span>
                            {item.estimated_price > 0 && (
                              <span className="text-sm font-medium whitespace-nowrap w-16 sm:w-20">
                                R$ {item.estimated_price.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => openEditModal(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar Item' : 'Novo Item'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Nome do Item</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Arroz, Maçã, Detergente..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Quantidade</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Unidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: kg, un, litros" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Categoria</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Mercearia, Limpeza..."
                        {...field}
                        list="categories-list"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estimated_price"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Preço Estimado (Total)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          R$
                        </span>
                        <Input type="number" step="0.01" className="text-right pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <datalist id="categories-list">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
