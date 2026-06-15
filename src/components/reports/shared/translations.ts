const ENUM_LABELS: Record<string, string> = {
  // Níveis (risco, engajamento, participação, prioridade, severidade)
  LOW: 'Baixo',
  MEDIUM: 'Médio',
  HIGH: 'Alto',
  CRITICAL: 'Crítico',
  URGENT: 'Urgente',

  // Saúde / desempenho geral
  EXCELLENT: 'Excelente',
  GOOD: 'Bom',
  SATISFACTORY: 'Satisfatório',
  CONCERNING: 'Preocupante',
  NEEDS_IMPROVEMENT: 'Precisa melhorar',
  POOR: 'Ruim',

  // Tendências
  IMPROVING: 'Melhorando',
  STABLE: 'Estável',
  DECLINING: 'Em queda',
  INCREASING: 'Crescente',
  DECREASING: 'Decrescente',
  UP: 'Em alta',
  DOWN: 'Em baixa',

  // Avaliação de risco / grupos-alvo
  LOW_RISK: 'Baixo risco',
  MEDIUM_RISK: 'Risco médio',
  HIGH_RISK: 'Alto risco',
  ALL: 'Todos',

  // Status de conclusão
  NOT_STARTED: 'Não iniciado',
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluído',
  DROPPED_OUT: 'Evadido',

  // Status do aluno
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
  CANCELLED: 'Cancelado',
  ENROLLED: 'Matriculado',

  // Tipos de recomendação / intervenção
  CONTENT_REVIEW: 'Revisão de conteúdo',
  INDIVIDUAL_SUPPORT: 'Apoio individual',
  GROUP_ACTIVITY: 'Atividade em grupo',
  ASSESSMENT_ADJUSTMENT: 'Ajuste de avaliação',
  CONTACT: 'Contato',
  ASSESSMENT: 'Avaliação',
  INTERVENTION: 'Intervenção',

  // Dificuldade
  EASY: 'Fácil',
  HARD: 'Difícil',
}

export function translateEnum(value: string | null | undefined): string {
  if (!value) return '—'
  const key = value.toString().trim().toUpperCase()
  return ENUM_LABELS[key] ?? value.toString()
}
