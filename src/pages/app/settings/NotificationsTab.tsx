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

export function NotificationsTab() {
  const form = useFormContext<SettingsValues>()

  return (
    <div className="space-y-6 max-w-2xl">
      <FormField
        control={form.control}
        name="notifyUpcomingTasks"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-card">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Notificar Tarefas Próximas</FormLabel>
              <FormDescription>Envia alerta antes de uma tarefa vencer.</FormDescription>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="notifyTaskHoursBefore"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Horas de Antecedência para Tarefas</FormLabel>
            <FormControl>
              <Input type="number" {...field} className="w-full md:w-1/2" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="notifyStarsEarned"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-card">
              <FormLabel className="text-base">Notificar Estrelas Ganhas</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notifyPantryExpiry"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-card">
              <FormLabel className="text-base">Notificar Validade Despensa</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="notifyMealReady"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-card">
            <FormLabel className="text-base">Notificar Cardápio Pronto</FormLabel>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="dailySummaryTime"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Horário de Resumo Diário</FormLabel>
            <FormDescription>Horário em que a família receberá o resumo do dia.</FormDescription>
            <FormControl>
              <Input type="time" {...field} className="w-full md:w-1/2" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
