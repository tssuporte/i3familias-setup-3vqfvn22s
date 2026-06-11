export type BnccArea =
  | 'Linguagens'
  | 'Matemática'
  | 'Ciências da Natureza'
  | 'Ciências Humanas'
  | 'Ensino Religioso'

export interface BnccTopic {
  id: string
  area: BnccArea
  label: string
}

export const bnccData: Record<string, BnccTopic[]> = {
  '6-7': [
    {
      id: 'port-12',
      area: 'Linguagens',
      label: 'Língua Portuguesa (Alfabetização, leitura e escrita básica)',
    },
    {
      id: 'mat-12',
      area: 'Matemática',
      label: 'Matemática (Números naturais, adição e subtração, noções de geometria)',
    },
    {
      id: 'ci-12',
      area: 'Ciências da Natureza',
      label: 'Ciências (O corpo humano, seres vivos no ambiente)',
    },
    {
      id: 'hist-12',
      area: 'Ciências Humanas',
      label: 'História (A criança e seu entorno, o tempo e a vida cotidiana)',
    },
    {
      id: 'geo-12',
      area: 'Ciências Humanas',
      label: 'Geografia (A vida em casa e na escola, noções espaciais)',
    },
    { id: 'arte-12', area: 'Linguagens', label: 'Arte (Artes visuais, dança, música)' },
  ],
  '8-9': [
    {
      id: 'port-34',
      area: 'Linguagens',
      label: 'Língua Portuguesa (Leitura, interpretação e produção de textos)',
    },
    {
      id: 'mat-34',
      area: 'Matemática',
      label: 'Matemática (Multiplicação, divisão, frações simples, sistema monetário)',
    },
    {
      id: 'ci-34',
      area: 'Ciências da Natureza',
      label: 'Ciências (Misturas, características dos animais, pontos cardeais)',
    },
    {
      id: 'hist-34',
      area: 'Ciências Humanas',
      label: 'História (A cidade, o campo, migrações e história local)',
    },
    {
      id: 'geo-34',
      area: 'Ciências Humanas',
      label: 'Geografia (O município, paisagens urbanas e rurais)',
    },
  ],
  '10-11': [
    {
      id: 'port-56',
      area: 'Linguagens',
      label: 'Língua Portuguesa (Gêneros textuais, gramática, literatura)',
    },
    {
      id: 'mat-56',
      area: 'Matemática',
      label: 'Matemática (Frações, decimais, geometria avançada, porcentagem)',
    },
    {
      id: 'ci-56',
      area: 'Ciências da Natureza',
      label: 'Ciências (Propriedades dos materiais, nutrição, ecossistemas)',
    },
    {
      id: 'hist-56',
      area: 'Ciências Humanas',
      label: 'História (Brasil Colônia, cidadania, antiguidade clássica)',
    },
    {
      id: 'geo-56',
      area: 'Ciências Humanas',
      label: 'Geografia (Dinâmica populacional, clima e vegetação)',
    },
  ],
  '12': [
    {
      id: 'port-7',
      area: 'Linguagens',
      label: 'Língua Portuguesa (Argumentação, sintaxe, figuras de linguagem)',
    },
    {
      id: 'mat-7',
      area: 'Matemática',
      label: 'Matemática (Álgebra, equações, proporções, estatística básica)',
    },
    {
      id: 'ci-7',
      area: 'Ciências da Natureza',
      label: 'Ciências (Máquinas simples, diversidade de ecossistemas)',
    },
    {
      id: 'hist-7',
      area: 'Ciências Humanas',
      label: 'História (Idade Média, Renascimento, Brasil Império)',
    },
    {
      id: 'geo-7',
      area: 'Ciências Humanas',
      label: 'Geografia (Formação territorial do Brasil, biomas, urbanização)',
    },
  ],
  '13+': [
    {
      id: 'port-89',
      area: 'Linguagens',
      label: 'Língua Portuguesa (Produção dissertativa, gramática normativa avançada)',
    },
    {
      id: 'mat-89',
      area: 'Matemática',
      label: 'Matemática (Sistemas de equações, funções, teorema de Pitágoras)',
    },
    {
      id: 'ci-89',
      area: 'Ciências da Natureza',
      label: 'Ciências (Física e Química introdutórias, genética, evolução)',
    },
    {
      id: 'hist-89',
      area: 'Ciências Humanas',
      label: 'História (Revolução Industrial, Guerras Mundiais, Brasil República)',
    },
    {
      id: 'geo-89',
      area: 'Ciências Humanas',
      label: 'Geografia (Geopolítica, economia global, questões ambientais)',
    },
  ],
}

export function getTopicsForAge(age: number): BnccTopic[] {
  if (age <= 7) return bnccData['6-7']
  if (age <= 9) return bnccData['8-9']
  if (age <= 11) return bnccData['10-11']
  if (age === 12) return bnccData['12']
  return bnccData['13+']
}
