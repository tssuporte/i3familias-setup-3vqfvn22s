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

export const BNCC_TOPICS_BY_AGE = {
  '6-7': {
    label: '1º e 2º ano — Ensino Fundamental',
    topics: [
      ...genTopics('lp1', 22, 'Linguagens', 'Língua Portuguesa', 'Leitura e Escrita'),
      ...genTopics('mt1', 20, 'Matemática', 'Matemática', 'Números e Operações'),
      ...genTopics('ci1', 10, 'Ciências da Natureza', 'Ciências', 'Vida e Evolução'),
      ...genTopics('hi1', 4, 'Ciências Humanas', 'História', 'Mundo Pessoal e Social'),
      ...genTopics('ge1', 4, 'Ciências Humanas', 'Geografia', 'O Sujeito e seu Lugar no Mundo'),
    ],
  },
  '8-9': {
    label: '3º e 4º ano — Ensino Fundamental',
    topics: [
      ...genTopics('lp3', 22, 'Linguagens', 'Língua Portuguesa', 'Práticas de Linguagem'),
      ...genTopics('mt3', 22, 'Matemática', 'Matemática', 'Geometria e Grandezas'),
      ...genTopics('ci3', 12, 'Ciências da Natureza', 'Ciências', 'Terra e Universo'),
    ],
  },
  '10-11': {
    label: '5º e 6º ano — Ensino Fundamental',
    topics: [
      ...genTopics('lp5', 22, 'Linguagens', 'Língua Portuguesa', 'Análise Linguística'),
      ...genTopics('mt5', 22, 'Matemática', 'Matemática', 'Álgebra e Probabilidade'),
    ],
  },
  '12': {
    label: '7º ano — Ensino Fundamental',
    topics: [
      ...genTopics('lp7', 9, 'Linguagens', 'Língua Portuguesa', 'Sintaxe'),
      ...genTopics('mt7', 7, 'Matemática', 'Matemática', 'Equações'),
      ...genTopics('ci7', 3, 'Ciências da Natureza', 'Ciências', 'Energia'),
      ...genTopics('hi7', 2, 'Ciências Humanas', 'História', 'História do Brasil'),
      ...genTopics('ge7', 1, 'Ciências Humanas', 'Geografia', 'Espaço Geográfico'),
      ...genTopics('en7', 2, 'Linguagens', 'Língua Inglesa', 'Vocabulário'),
    ],
  },
  '13+': {
    label: '8º e 9º ano / Ensino Médio',
    topics: [
      ...genTopics('lp8', 9, 'Linguagens', 'Literatura/ENEM', 'Análise Literária'),
      ...genTopics('mt8', 8, 'Matemática', 'Matemática', 'Funções'),
      ...genTopics('ph8', 4, 'Ciências da Natureza', 'Física', 'Cinemática'),
      ...genTopics('ch8', 3, 'Ciências da Natureza', 'Química', 'Estrutura Atômica'),
      ...genTopics('bi8', 2, 'Ciências da Natureza', 'Biologia', 'Genética'),
      ...genTopics('hi8', 2, 'Ciências Humanas', 'História', 'História Contemporânea'),
      ...genTopics('ge8', 1, 'Ciências Humanas', 'Geografia', 'Geopolítica'),
      ...genTopics('en8', 2, 'Linguagens', 'Língua Inglesa', 'Interpretação Avançada'),
    ],
  },
}

export function getBnccTopicsForAge(age: number) {
  if (age <= 7) return BNCC_TOPICS_BY_AGE['6-7']
  if (age <= 9) return BNCC_TOPICS_BY_AGE['8-9']
  if (age <= 11) return BNCC_TOPICS_BY_AGE['10-11']
  if (age <= 12) return BNCC_TOPICS_BY_AGE['12']
  return BNCC_TOPICS_BY_AGE['13+']
}
