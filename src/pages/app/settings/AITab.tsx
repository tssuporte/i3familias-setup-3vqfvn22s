import { useEffect, useState } from 'react'
import { useFamily } from '@/contexts/FamilyContext'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'

export function AITab() {
  const { family } = useFamily()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settingId, setSettingId] = useState<string | null>(null)

  const [settings, setSettings] = useState({
    assistant_enabled: true,
    default_mode: 'study',
    meal_planner_enabled: true,
    meal_planner_duration: '7',
    tutor_enabled: true,
    tutor_tone: 'friendly',
    custom_instructions: '',
  })

  useEffect(() => {
    async function loadSettings() {
      if (!family) return
      try {
        const record = await pb
          .collection('family_settings')
          .getFirstListItem(`family_id = "${family.id}" && setting_key = "ai_settings"`)
        setSettingId(record.id)
        if (record.setting_value) {
          setSettings((prev) => ({ ...prev, ...record.setting_value }))
        }
      } catch (err: any) {
        // Not found is fine, we use defaults
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [family])

  const handleSave = async () => {
    if (!family) return
    setSaving(true)
    try {
      if (settingId) {
        await pb.collection('family_settings').update(settingId, {
          setting_value: settings,
        })
      } else {
        const record = await pb.collection('family_settings').create({
          family_id: family.id,
          setting_key: 'ai_settings',
          setting_value: settings,
        })
        setSettingId(record.id)
      }
      toast({ title: 'Configurações de IA salvas com sucesso!' })
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar configurações de IA',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Assistente Inteligente</h2>
          <p className="text-sm text-muted-foreground">
            Configure como a IA interage com sua família.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configurações Gerais</CardTitle>
            <CardDescription>Defina o comportamento principal do assistente.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Habilitar Assistente</Label>
                <p className="text-sm text-muted-foreground">Permite o uso da IA pela família.</p>
              </div>
              <Switch
                checked={settings.assistant_enabled}
                onCheckedChange={(v) => updateSetting('assistant_enabled', v)}
              />
            </div>

            <div className="space-y-2">
              <Label>Modo Padrão</Label>
              <Select
                value={settings.default_mode}
                onValueChange={(v) => updateSetting('default_mode', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="study">Estudos</SelectItem>
                  <SelectItem value="meal">Cardápio</SelectItem>
                  <SelectItem value="calendar">Semana Quebrada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Instruções Customizadas (opcional)</Label>
              <Textarea
                placeholder="Ex: Fale sempre de forma encorajadora e lembre as crianças de serem gentis..."
                value={settings.custom_instructions}
                onChange={(e) =>
                  updateSetting('custom_instructions', e.target.value.substring(0, 500))
                }
                maxLength={500}
                className="h-24 resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">
                {settings.custom_instructions.length}/500
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Planejador de Cardápio</CardTitle>
            <CardDescription>Ajustes para a geração automática de refeições.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Habilitar Planejador</Label>
                <p className="text-sm text-muted-foreground">
                  Permite sugerir cardápios baseados na despensa.
                </p>
              </div>
              <Switch
                checked={settings.meal_planner_enabled}
                onCheckedChange={(v) => updateSetting('meal_planner_enabled', v)}
              />
            </div>

            <div className="space-y-2">
              <Label>Duração do Planejamento (dias)</Label>
              <Select
                value={String(settings.meal_planner_duration)}
                onValueChange={(v) => updateSetting('meal_planner_duration', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 dias</SelectItem>
                  <SelectItem value="5">5 dias</SelectItem>
                  <SelectItem value="7">7 dias</SelectItem>
                  <SelectItem value="14">14 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tutor de Estudos</CardTitle>
            <CardDescription>Personalize como a IA ajuda nas tarefas escolares.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Habilitar Tutor</Label>
                <p className="text-sm text-muted-foreground">
                  Assistência guiada para lições de casa.
                </p>
              </div>
              <Switch
                checked={settings.tutor_enabled}
                onCheckedChange={(v) => updateSetting('tutor_enabled', v)}
              />
            </div>

            <div className="space-y-2">
              <Label>Tom do Tutor</Label>
              <Select
                value={settings.tutor_tone}
                onValueChange={(v) => updateSetting('tutor_tone', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="friendly">Amigável</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="socratic">Socrático</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-start pt-4">
        <Button
          type="button"
          size="lg"
          onClick={handleSave}
          disabled={saving}
          className="w-full md:w-auto"
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar Configurações de IA
        </Button>
      </div>
    </div>
  )
}
