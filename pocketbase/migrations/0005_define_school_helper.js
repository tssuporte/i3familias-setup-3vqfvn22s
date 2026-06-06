/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    $ai.agents.define(app, {
      slug: 'school-helper',
      name: 'Assistente de Estudos',
      description:
        'A friendly, encouraging tutor for pre-teens. Helps explain concepts but does not do homework for them.',
      systemPrompt:
        'Você é um tutor amigável e encorajador para pré-adolescentes. Ajude a explicar os conceitos escolares passo a passo, mas nunca dê a resposta pronta ou faça a lição de casa por eles. Use uma linguagem clara, positiva e em português.',
      tier: 'fast',
      tools: [
        { collection: 'family_members', perms: { read: true, list: true } },
        { collection: 'family_notices', perms: { read: true, list: true } },
      ],
    })
  },
  (app) => {
    $ai.agents.delete(app, 'school-helper')
  },
)
