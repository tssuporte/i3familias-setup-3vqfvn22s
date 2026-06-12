export interface BnccTopic {
  id: string
  area: string
  component: string
  topic: string
  subtopic: string
  enabled: boolean
}

function genTopics(
  prefix: string,
  count: number,
  area: string,
  component: string,
  topic: string,
): BnccTopic[] {
  return Array.from({ length: count }, (_, i) => {
    const num = (i + 1).toString().padStart(2, '0')
    return {
      id: `${prefix}-${num}`,
      area,
      component,
      topic,
      subtopic: `${component} - Subtópico ${num}`,
      enabled: true,
    }
  })
}

export const BNCC_BY_YEAR: Record<string, { label: string; topics: BnccTopic[] }> = {
  pre: {
    label: 'Pré-escola',
    topics: [
      ...genTopics('pre-lp', 5, 'Linguagens', 'Língua Portuguesa', 'Oralidade e Escrita'),
      ...genTopics('pre-mt', 5, 'Matemática', 'Matemática', 'Noções de Quantidade'),
    ],
  },
  ef1: {
    label: '1º ano — Ensino Fundamental',
    topics: [
      ...genTopics('ef1-lp', 5, 'Linguagens', 'Língua Portuguesa', 'Leitura e Escrita'),
      ...genTopics('ef1-mt', 5, 'Matemática', 'Matemática', 'Números e Operações'),
    ],
  },
  ef2: {
    label: '2º ano — Ensino Fundamental',
    topics: [
      ...genTopics('ef2-lp', 5, 'Linguagens', 'Língua Portuguesa', 'Leitura e Escrita'),
      ...genTopics('ef2-mt', 5, 'Matemática', 'Matemática', 'Números e Operações'),
    ],
  },
  ef3: {
    label: '3º ano — Ensino Fundamental',
    topics: [
      ...genTopics('ef3-lp', 5, 'Linguagens', 'Língua Portuguesa', 'Práticas de Linguagem'),
      ...genTopics('ef3-mt', 5, 'Matemática', 'Matemática', 'Geometria e Grandezas'),
    ],
  },
  ef4: {
    label: '4º ano — Ensino Fundamental',
    topics: [
      ...genTopics('ef4-lp', 5, 'Linguagens', 'Língua Portuguesa', 'Práticas de Linguagem'),
      ...genTopics('ef4-mt', 5, 'Matemática', 'Matemática', 'Geometria e Grandezas'),
    ],
  },
  ef5: {
    label: '5º ano — Ensino Fundamental',
    topics: [
      ...genTopics('ef5-lp', 5, 'Linguagens', 'Língua Portuguesa', 'Análise Linguística'),
      ...genTopics('ef5-mt', 5, 'Matemática', 'Matemática', 'Álgebra e Probabilidade'),
    ],
  },
  ef6: {
    label: '6º ano — Ensino Fundamental',
    topics: [
      ...genTopics('ef6-lp', 5, 'Linguagens', 'Língua Portuguesa', 'Análise Linguística'),
      ...genTopics('ef6-mt', 5, 'Matemática', 'Matemática', 'Álgebra e Probabilidade'),
    ],
  },
  ef7: {
    label: '7º ano — Ensino Fundamental',
    topics: [
      ...genTopics('ef7-lp', 5, 'Linguagens', 'Língua Portuguesa', 'Sintaxe'),
      ...genTopics('ef7-mt', 5, 'Matemática', 'Matemática', 'Equações'),
    ],
  },
  ef8: {
    label: '8º ano — Ensino Fundamental',
    topics: [
      ...genTopics('ef8-lp', 5, 'Linguagens', 'Língua Portuguesa', 'Sintaxe e Morfologia'),
      ...genTopics('ef8-mt', 5, 'Matemática', 'Matemática', 'Equações e Sistemas'),
    ],
  },
  ef9: {
    label: '9º ano — Ensino Fundamental',
    topics: [
      ...genTopics('ef9-lp', 5, 'Linguagens', 'Língua Portuguesa', 'Análise Literária'),
      ...genTopics('ef9-mt', 5, 'Matemática', 'Matemática', 'Funções'),
    ],
  },
  em1: {
    label: '1º ano — Ensino Médio',
    topics: [
      ...genTopics('em1-lp', 5, 'Linguagens', 'Língua Portuguesa', 'Literatura'),
      ...genTopics('em1-mt', 5, 'Matemática', 'Matemática', 'Funções e Conjuntos'),
    ],
  },
  em2: {
    label: '2º ano — Ensino Médio',
    topics: [
      ...genTopics('em2-lp', 5, 'Linguagens', 'Língua Portuguesa', 'Literatura Brasileira'),
      ...genTopics('em2-mt', 5, 'Matemática', 'Matemática', 'Geometria Espacial'),
    ],
  },
  em3: {
    label: '3º ano — Ensino Médio',
    topics: [
      ...genTopics('em3-lp', 5, 'Linguagens', 'Língua Portuguesa', 'Redação e ENEM'),
      ...genTopics('em3-mt', 5, 'Matemática', 'Matemática', 'Revisão Geral e ENEM'),
    ],
  },
}

export function getBnccTopicsForYear(schoolYear: string) {
  return BNCC_BY_YEAR[schoolYear] || BNCC_BY_YEAR['ef1']
}

// Keep backward compatibility for other files
export const BNCC_TOPICS_BY_AGE = {
  '6-7': BNCC_BY_YEAR['ef1'],
  '8-9': BNCC_BY_YEAR['ef3'],
  '10-11': BNCC_BY_YEAR['ef5'],
  '12': BNCC_BY_YEAR['ef7'],
  '13+': BNCC_BY_YEAR['ef9'],
}

export function getBnccTopicsForAge(age: number) {
  if (age <= 7) return BNCC_TOPICS_BY_AGE['6-7']
  if (age <= 9) return BNCC_TOPICS_BY_AGE['8-9']
  if (age <= 11) return BNCC_TOPICS_BY_AGE['10-11']
  if (age <= 12) return BNCC_TOPICS_BY_AGE['12']
  return BNCC_TOPICS_BY_AGE['13+']
}
