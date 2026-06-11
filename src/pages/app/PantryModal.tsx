import { useEffect, useRef, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Camera, X, Loader2 } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'
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
import { useToast } from '@/components/ui/use-toast'
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
  const { toast } = useToast()
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { quantity: 1, unit: 'un' },
  })

  const [isScanning, setIsScanning] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [scanError, setScanError] = useState('')
  const scannerRef = useRef<Html5Qrcode | null>(null)

  const stopScanning = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      } catch (e) {
        console.error('Error stopping scanner', e)
      }
    }
    setIsScanning(false)
  }

  const fetchProductInfo = async (barcode: string) => {
    setIsSearching(true)
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
      const data = await res.json()
      if (data.status === 1 && data.product) {
        const p = data.product
        const name = p.product_name_pt || p.product_name || p.generic_name_pt || p.generic_name
        if (name) {
          setValue('name', name, { shouldValidate: true })
        } else {
          toast({
            title: 'Aviso',
            description: 'Produto não encontrado. Preencha o nome manualmente.',
          })
        }

        if (p.categories_tags && p.categories_tags.length > 0) {
          let cat = p.categories_tags[0].replace(/^[a-z]{2}:/, '').replace(/-/g, ' ')
          cat = cat.charAt(0).toUpperCase() + cat.slice(1)
          setValue('category', cat, { shouldValidate: true })
        }

        if (p.quantity) {
          const q = p.quantity.toLowerCase()
          if (q.includes('kg')) setValue('unit', 'kg', { shouldValidate: true })
          else if (q.includes('g')) setValue('unit', 'g', { shouldValidate: true })
          else if (q.includes('ml')) setValue('unit', 'ml', { shouldValidate: true })
          else if (q.includes('l')) setValue('unit', 'l', { shouldValidate: true })
        }
      } else {
        toast({
          title: 'Aviso',
          description: 'Produto não encontrado. Preencha o nome manualmente.',
        })
      }
    } catch (err) {
      toast({ title: 'Aviso', description: 'Produto não encontrado. Preencha o nome manualmente.' })
    } finally {
      setIsSearching(false)
    }
  }

  const startScanning = () => {
    setIsScanning(true)
    setScanError('')
    setTimeout(() => {
      const scanner = new Html5Qrcode('barcode-scanner-container')
      scannerRef.current = scanner
      scanner
        .start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 280, height: 140 } },
          async (decodedText) => {
            await stopScanning()
            await fetchProductInfo(decodedText)
          },
          undefined,
        )
        .catch((err) => {
          console.error(err)
          if (err?.name === 'NotAllowedError' || err?.message?.includes('Permission')) {
            setScanError('Permissão de câmera negada. Verifique as configurações do navegador.')
          } else {
            setScanError('Não foi possível acessar a câmera.')
          }
        })
    }, 300)
  }

  useEffect(() => {
    if (!open) {
      stopScanning()
    }
  }, [open])

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
            <div className="flex items-center justify-between">
              <Label htmlFor="name" className="font-semibold text-sm">
                Nome do produto
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={startScanning}
                className="h-8"
              >
                <Camera className="w-4 h-4 mr-2" />
                Ler código de barras
              </Button>
            </div>

            {isScanning && (
              <div className="bg-muted p-4 rounded-lg space-y-3 mb-4 border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Aponte para o código de barras</span>
                  <Button type="button" variant="ghost" size="sm" onClick={stopScanning}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                {scanError ? (
                  <div className="text-sm text-destructive text-center py-4 bg-destructive/10 rounded">
                    {scanError}
                  </div>
                ) : (
                  <div className="relative rounded overflow-hidden bg-black w-full min-h-[200px] flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-white absolute" />
                    <div id="barcode-scanner-container" className="w-full z-10" />
                  </div>
                )}
              </div>
            )}

            <div className="relative">
              <Input
                id="name"
                {...register('name')}
                placeholder="Ex: Arroz branco"
                className="w-full pr-10"
                disabled={isSearching}
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
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
