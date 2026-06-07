/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    $ai.agents.define(app, {
      slug: 'family-assistant',
      name: 'Assistente Familiar',
      description:
        'Assistente de gerenciamento familiar para estudos, cardápios e organização de tarefas.',
      systemPrompt:
        'Você é um assistente familiar amigável e útil. Ajude a organizar estudos, planejar refeições com base na despensa e reorganizar tarefas atrasadas ou de semanas agitadas. Use as ferramentas disponíveis para consultar dados da família. Responda em português de forma amigável, clara e concisa.',
      tier: 'fast',
      tools: [
        { collection: 'family_members', perms: { list: true, read: true } },
        { collection: 'pantry', perms: { list: true, read: true } },
        { collection: 'meals', perms: { list: true, read: true } },
        { collection: 'calendar_events', perms: { list: true, read: true } },
        { collection: 'tasks_children', perms: { list: true, read: true, update: true } },
        { collection: 'tasks_adults', perms: { list: true, read: true, update: true } },
      ],
    })
  },
  (app) => {
    $ai.agents.delete(app, 'family-assistant')
  },
)
