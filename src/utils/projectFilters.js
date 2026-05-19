export const defaultProjectFilters = {
  overdue: false,
  noProgress: false,
  priority: 'all',
  status: 'all',
}

export const defaultHiddenSections = {
  active: false,
  categories: false,
  completed: false,
  todo: false,
}

const priorityRank = {
  BAIXA: 1,
  MEDIA: 2,
  ALTA: 3,
  CRITICA: 4,
}

export const sortOptions = [
  { value: 'none', label: 'Sem ordenacao' },
  { value: 'name-asc', label: 'Nome, A-Z' },
  { value: 'name-desc', label: 'Nome, Z-A' },
  { value: 'due-asc', label: 'Prazo mais proximo' },
  { value: 'due-desc', label: 'Prazo mais distante' },
  { value: 'budget-desc', label: 'Maior orcamento' },
  { value: 'budget-asc', label: 'Menor orcamento' },
  { value: 'progress-desc', label: 'Maior progresso' },
  { value: 'progress-asc', label: 'Menor progresso' },
  { value: 'priority-desc', label: 'Maior prioridade' },
]

export function hasActiveProjectFilters(filters) {
  return (
    filters.status !== defaultProjectFilters.status ||
    filters.priority !== defaultProjectFilters.priority ||
    filters.overdue ||
    filters.noProgress
  )
}

export function hasHiddenSections(hiddenSections) {
  return Object.entries(defaultHiddenSections).some(
    ([section, defaultValue]) => hiddenSections[section] !== defaultValue,
  )
}

export function isDefaultSort(sortOption) {
  return sortOption === 'none'
}

export function getSortLabel(sortOption) {
  return sortOptions.find((option) => option.value === sortOption)?.label || 'Sem ordenacao'
}

export function filterProjects(projects, filters) {
  return projects.filter((project) => {
    if (filters.status !== 'all' && project.status !== filters.status) {
      return false
    }

    if (filters.priority !== 'all' && project.priority !== filters.priority) {
      return false
    }

    if (filters.overdue && !isOverdue(project)) {
      return false
    }

    if (filters.noProgress && Number(project.completion || 0) !== 0) {
      return false
    }

    return true
  })
}

export function sortProjects(projects, sortOption) {
  const sortedProjects = [...projects]

  switch (sortOption) {
    case 'name-asc':
      return sortedProjects.sort((first, second) => compareText(first.name, second.name))
    case 'name-desc':
      return sortedProjects.sort((first, second) => compareText(second.name, first.name))
    case 'due-asc':
      return sortedProjects.sort(
        (first, second) => dateValue(first.endDate, Infinity) - dateValue(second.endDate, Infinity),
      )
    case 'due-desc':
      return sortedProjects.sort(
        (first, second) =>
          dateValue(second.endDate, -Infinity) - dateValue(first.endDate, -Infinity),
      )
    case 'budget-desc':
      return sortedProjects.sort(
        (first, second) => numberValue(second.budget, -Infinity) - numberValue(first.budget, -Infinity),
      )
    case 'budget-asc':
      return sortedProjects.sort(
        (first, second) => numberValue(first.budget, Infinity) - numberValue(second.budget, Infinity),
      )
    case 'progress-desc':
      return sortedProjects.sort(
        (first, second) =>
          numberValue(second.completion, -Infinity) - numberValue(first.completion, -Infinity),
      )
    case 'progress-asc':
      return sortedProjects.sort(
        (first, second) =>
          numberValue(first.completion, Infinity) - numberValue(second.completion, Infinity),
      )
    case 'priority-desc':
      return sortedProjects.sort(
        (first, second) => priorityValue(second.priority) - priorityValue(first.priority),
      )
    default:
      return sortedProjects
  }
}

function compareText(firstValue, secondValue) {
  return String(firstValue || '').localeCompare(String(secondValue || ''), 'pt-BR', {
    sensitivity: 'base',
  })
}

function dateValue(value, fallback) {
  if (!value) {
    return fallback
  }

  const timestamp = new Date(`${value}T00:00:00`).getTime()
  return Number.isFinite(timestamp) ? timestamp : fallback
}

function numberValue(value, fallback) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function priorityValue(value) {
  return priorityRank[value] || 0
}

function isOverdue(project) {
  if (!project.endDate || project.status === 'CONCLUIDO') {
    return false
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return dateValue(project.endDate, Infinity) < today.getTime()
}
