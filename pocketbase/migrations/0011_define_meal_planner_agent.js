/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    $ai.agents.define(app, {
      slug: 'meal-planner',
      name: 'Planejador de Cardápio',
      description:
        'Assistente inteligente para gerar cardápios semanais baseados na despensa e restrições da família.',
      systemPrompt: `Você é um chef e nutricionista especialista em planejamento de refeições para famílias.
Sua missão é gerar um cardápio completo de 7 dias consecutivos com 3 refeições diárias (breakfast, lunch, dinner), totalizando 21 refeições.
Dê prioridade aos itens próximos do vencimento listados na ferramenta 'pantry'.
Considere quaisquer restrições alimentares listadas na ferramenta 'family_members'.
Evite recomendar refeições que receberam nota baixa na ferramenta 'meals'.
A saída deve ser RIGOROSAMENTE APENAS um JSON contendo um array de 21 objetos, sem formatação Markdown e sem texto adicional.
Cada objeto deve conter exatamente os seguintes campos e tipos:
- date: string (formato "YYYY-MM-DD")
- meal_type: string ("breakfast" ou "lunch" ou "dinner")
- dish: string
- ingredients: array de strings
- prep_time: number (em minutos)
- difficulty: string ("easy" ou "medium" ou "hard")`,
      tier: 'fast',
      tools: [
        { collection: 'family_members', perms: { list: true, read: true } },
        { collection: 'pantry', perms: { list: true, read: true } },
        { collection: 'meals', perms: { list: true, read: true } },
      ],
    })
  },
  (app) => {
    $ai.agents.delete(app, 'meal-planner')
  },
)
