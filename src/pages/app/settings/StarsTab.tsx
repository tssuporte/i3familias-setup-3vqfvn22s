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
import type { SettingsValues } from '@/hooks/use-settings'

export function StarsTab() {
  const form = useFormContext<SettingsValues>()

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="starDefaultValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor Padrão de Estrela</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="starMaxLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Limite Máximo de Estrelas</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="starLatePenalty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Penalidade por Atraso</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="starDishonestyPenalty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Penalidade por Desonestidade</FormLabel>
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
        name="starMonthlyReset"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-card">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Resetar Estrelas Mensalmente</FormLabel>
              <FormDescription>
                Os saldos de estrelas voltarão a zero no primeiro dia do mês.
              </FormDescription>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  )
}
