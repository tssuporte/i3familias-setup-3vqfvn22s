import { useFormContext } from 'react-hook-form'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import type { SettingsValues } from '@/hooks/use-settings'

export function MealPantryTab() {
  const form = useFormContext<SettingsValues>()

  return (
    <div className="space-y-6 max-w-2xl">
      <FormField
        control={form.control}
        name="mealAutoGenerate"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-card">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Gerar Cardápio Automaticamente</FormLabel>
              <FormDescription>
                Cria um cardápio com base nos itens disponíveis na despensa.
              </FormDescription>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="mealDays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dias de Cardápio</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pantryExpiryAlertDays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alertar Validade (dias)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="pantryMinStock"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estoque Mínimo Padrão</FormLabel>
            <FormControl>
              <Input type="number" {...field} className="w-full md:w-1/2" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="pantryCustomCategories"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Categorias Customizadas</FormLabel>
            <FormDescription>
              Separe por vírgulas (ex: Laticínios, Congelados, Bebidas)
            </FormDescription>
            <FormControl>
              <Textarea {...field} placeholder="Carnes, Laticínios, Bebidas..." />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
