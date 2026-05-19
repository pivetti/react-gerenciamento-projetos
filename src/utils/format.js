export const statusLabels = {
  PLANEJADO: 'Planejado',
  EM_ANDAMENTO: 'Em andamento',
  PAUSADO: 'Pausado',
  CONCLUIDO: 'Concluido',
  CANCELADO: 'Cancelado',
  NAO_INICIADA: 'Nao iniciada',
  BLOQUEADA: 'Bloqueada',
  CONCLUIDA: 'Concluida',
  CANCELADA: 'Cancelada',
  IDENTIFICADO: 'Identificado',
  EM_ANALISE: 'Em analise',
  EM_TRATAMENTO: 'Em tratamento',
  MITIGADO: 'Mitigado',
  ENCERRADO: 'Encerrado',
  ALTA: 'Alta',
  MEDIA: 'Media',
  BAIXA: 'Baixa',
  CRITICA: 'Critica',
}

export function formatLabel(value) {
  if (!value) {
    return '-'
  }

  return (
    statusLabels[value] ||
    String(value)
      .toLowerCase()
      .replaceAll('_', ' ')
      .replace(/^\w/, (letter) => letter.toUpperCase())
  )
}

export function formatDate(value) {
  if (!value) {
    return '-'
  }

  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('pt-BR').format(parsed)
}

export function formatMoney(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '-'
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatPercent(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '0%'
  }

  return `${Math.max(0, Math.min(100, Math.round(value)))}%`
}

export function getDaysRemaining(value) {
  if (!value) {
    return '-'
  }

  const end = new Date(value)

  if (Number.isNaN(end.getTime())) {
    return '-'
  }

  const now = new Date()
  const diff = end.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0)
  const days = Math.ceil(diff / 86_400_000)

  if (days < 0) {
    return `${Math.abs(days)} dias atrasado`
  }

  if (days === 0) {
    return 'vence hoje'
  }

  return `${days} dias restantes`
}

export function statusTone(value) {
  const normalized = String(value || '').toLowerCase()

  if (normalized.includes('concl') || normalized.includes('mitig')) {
    return 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:ring-emerald-900'
  }

  if (normalized.includes('bloque') || normalized.includes('cancel')) {
    return 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/50 dark:text-rose-200 dark:ring-rose-900'
  }

  if (normalized.includes('analise') || normalized.includes('tratamento')) {
    return 'bg-[#f1eaff] text-[#6947a8] ring-[#ddcffc] dark:bg-[#34254f] dark:text-[#dfd2ff] dark:ring-[#4d3972]'
  }

  if (normalized.includes('andamento')) {
    return 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-950/50 dark:text-sky-200 dark:ring-sky-900'
  }

  if (normalized.includes('planejado')) {
    return 'bg-zinc-100 text-zinc-700 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700'
  }

  return 'bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700'
}

export function priorityTone(value) {
  const normalized = String(value || '').toLowerCase()

  if (normalized.includes('crit')) {
    return 'bg-rose-100 text-rose-800 ring-rose-200 dark:bg-rose-950/60 dark:text-rose-200 dark:ring-rose-900'
  }

  if (normalized.includes('alta')) {
    return 'bg-pink-50 text-pink-700 ring-pink-200 dark:bg-pink-950/50 dark:text-pink-200 dark:ring-pink-900'
  }

  if (normalized.includes('media')) {
    return 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:ring-amber-900'
  }

  if (normalized.includes('baixa')) {
    return 'bg-cyan-50 text-cyan-700 ring-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-200 dark:ring-cyan-900'
  }

  return 'bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700'
}

export function projectBucket(project) {
  if (project.status === 'CONCLUIDO' || project.completion >= 100) {
    return 'completed'
  }

  if (project.status === 'PLANEJADO' || project.completion <= 15) {
    return 'todo'
  }

  return 'active'
}
