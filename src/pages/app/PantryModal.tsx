import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { PantryItem } from '@/services/pantry'

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  quantity: z.coerce.number().min(0.01, 'Quantidade deve ser maior que 0'),
  unit: z.string().min(1, 'Unidade é obrigatória'),
  location: z.string().optional().default(''),
  expiry_date: z.string().optional().default(''),
  min_stock: z.coerce.number().optional().default(0),
  category: z.string().optional().default(''),
})

type FormData = z.infer<typeof schema>

interface PantryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: PantryItem | null
  onSave: (data: Partial<PantryItem>) => Promise<{ success: boolean; errors?: any }>
}

export function PantryModal({ open, onOpenChange, item, onSave }: PantryModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { quantity: 1, unit: 'un' },
  })

  useEffect(() => {
    if (open) {
      if (item) {
        reset({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          location: item.location || '',
          expiry_date: item.expiry_date ? item.expiry_date.split('T')[0] : '',
          min_stock: item.min_stock || 0,
          category: item.category || '',
        })
      } else {
        reset({
          name: '',
          quantity: 1,
          unit: 'un',
          location: '',
          expiry_date: '',
          min_stock: 0,
          category: '',
        })
      }
    }
  }, [open, item, reset])

  const onSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      expiry_date: data.expiry_date ? new Date(data.expiry_date).toISOString() : '',
    }
    const result = await onSave(payload)
    if (result.success) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-xl shadow-2xl p-6">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-bold">
            {item ? 'Editar Item' : 'Adicionar Item'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="name" className="font-semibold text-sm">
              Nome do produto
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Ex: Arroz branco"
              className="w-full"
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="quantity" className="font-semibold text-sm">
                Quantidade
              </Label>
              <Input
                id="quantity"
                type="number"
                step="any"
                {...register('quantity')}
                className="w-full"
              />
              {errors.quantity && (
                <p className="text-sm text-destructive">{errors.quantity.message}</p>
              )}
            </div>
            <div className="space-y-3">
              <Label className="font-semibold text-sm">Unidade</Label>
              <Controller
                control={control}
                name="unit"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="un">Unidade (un)</SelectItem>
                      <SelectItem value="kg">Quilograma (kg)</SelectItem>
                      <SelectItem value="g">Grama (g)</SelectItem>
                      <SelectItem value="l">Litro (l)</SelectItem>
                      <SelectItem value="ml">Mililitro (ml)</SelectItem>
                      <SelectItem value="cx">Caixa (cx)</SelectItem>
                      <SelectItem value="pct">Pacote (pct)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.unit && <p className="text-sm text-destructive">{errors.unit.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="category" className="font-semibold text-sm">
                Categoria
              </Label>
              <Input
                id="category"
                {...register('category')}
                placeholder="Ex: Grãos"
                className="w-full"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="location" className="font-semibold text-sm">
                Localização
              </Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="Ex: Armário 1"
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="expiry_date" className="font-semibold text-sm">
                Data de Validade
              </Label>
              <Input id="expiry_date" type="date" {...register('expiry_date')} className="w-full" />
            </div>
            <div className="space-y-3">
              <Label htmlFor="min_stock" className="font-semibold text-sm">
                Estoque Mínimo
              </Label>
              <Input id="min_stock" type="number" {...register('min_stock')} className="w-full" />
            </div>
          </div>

          <DialogFooter className="pt-4 mt-2 border-t">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100 px-6 font-medium shadow-sm transition-colors"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
