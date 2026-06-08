import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { useTheme } from '@/hooks/use-theme'

import { useSettings, settingsSchema, type SettingsValues } from '@/hooks/use-settings'
import { GeneralTab } from './settings/GeneralTab'
import { StarsTab } from './settings/StarsTab'
import { MealPantryTab } from './settings/MealPantryTab'
import { NotificationsTab } from './settings/NotificationsTab'
import { IntegrationsTab } from './settings/IntegrationsTab'
import { FamilyTab } from './settings/FamilyTab'
import { AITab } from './settings/AITab'

export default function Settings() {
  const { loading, settings, saveSettings } = useSettings()
  const { setTheme } = useTheme()

  const form = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings,
  })

  useEffect(() => {
    if (!loading) {
      form.reset(settings)
    }
  }, [loading, settings, form])

  const onSubmit = async (data: SettingsValues) => {
    try {
      await saveSettings(data)
      setTheme(data.darkMode ? 'dark' : 'light')
      toast.success('Configurações salvas com sucesso!')
    } catch (e) {
      toast.error('Não foi possível salvar configurações.', {
        action: { label: 'Tentar Novamente', onClick: () => form.handleSubmit(onSubmit)() },
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <div className="space-y-2">
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-[400px] w-full max-w-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="gerais" className="w-full">
            <TabsList className="flex w-full flex-wrap justify-start h-auto bg-transparent p-0 border-b rounded-none gap-4">
              <TabsTrigger
                value="gerais"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-2"
              >
                Gerais
              </TabsTrigger>
              <TabsTrigger
                value="estrelas"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-2"
              >
                Estrelas
              </TabsTrigger>
              <TabsTrigger
                value="cardapio"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-2"
              >
                Cardápio e Despensa
              </TabsTrigger>
              <TabsTrigger
                value="notificacoes"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-2"
              >
                Notificações
              </TabsTrigger>
              <TabsTrigger
                value="integracao"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-2"
              >
                Integração
              </TabsTrigger>
              <TabsTrigger
                value="familia"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-2"
              >
                Família
              </TabsTrigger>
              <TabsTrigger
                value="ai"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-2"
              >
                Inteligência Artificial
              </TabsTrigger>
            </TabsList>

            <div className="mt-8">
              <TabsContent value="gerais">
                <GeneralTab />
              </TabsContent>
              <TabsContent value="estrelas">
                <StarsTab />
              </TabsContent>
              <TabsContent value="cardapio">
                <MealPantryTab />
              </TabsContent>
              <TabsContent value="notificacoes">
                <NotificationsTab />
              </TabsContent>
              <TabsContent value="integracao">
                <IntegrationsTab />
              </TabsContent>
              <TabsContent value="familia">
                <FamilyTab />
              </TabsContent>
              <TabsContent value="ai">
                <AITab />
              </TabsContent>
            </div>
          </Tabs>

          <div className="flex justify-start max-w-2xl pt-4">
            <Button type="submit" size="lg" className="w-full md:w-auto">
              Salvar Configurações
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
