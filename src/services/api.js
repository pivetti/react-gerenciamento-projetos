const DEFAULT_API_URL = 'https://api-spring-gerenciamento-projetos.onrender.com'

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL?.trim() || DEFAULT_API_URL
).replace(/\/$/, '')

export const API_DISPLAY_URL = API_BASE_URL

const ENDPOINTS = {
  projects: '/projetos',
  participants: '/participantes',
  activities: '/atividades',
  resources: '/recursos',
  costs: '/custos',
  risks: '/riscos',
}

const demoData = {
  projects: [
    {
      id: '1',
      name: 'Portal de projetos',
      description: 'Central para acompanhar entregas, prazos, equipe e riscos.',
      status: 'EM_ANDAMENTO',
      priority: 'ALTA',
      startDate: '2026-05-01',
      endDate: '2026-07-18',
      budget: 82000,
      completion: 62,
    },
    {
      id: '2',
      name: 'Aplicativo de campo',
      description: 'Fluxo mobile para registrar atividades e recursos usados.',
      status: 'PLANEJADO',
      priority: 'MEDIA',
      startDate: '2026-06-03',
      endDate: '2026-08-30',
      budget: 43000,
      completion: 18,
    },
  ],
  participants: [
    {
      id: '1',
      userName: 'Ana Souza',
      projectName: 'Portal de projetos',
      role: 'Product Owner',
      accessRole: 'ADMIN',
      active: true,
    },
    {
      id: '2',
      userName: 'Bruno Lima',
      projectName: 'Aplicativo de campo',
      role: 'Desenvolvedor',
      accessRole: 'MEMBRO',
      active: true,
    },
  ],
  activities: [
    {
      id: '1',
      title: 'Mapear regras de negocio',
      description: 'Consolidar regras da API e campos exibidos no painel.',
      status: 'EM_ANDAMENTO',
      priority: 'ALTA',
      dueDate: '2026-05-20',
      projectName: 'Portal de projetos',
      responsibleName: 'Ana Souza',
      completion: 70,
    },
    {
      id: '2',
      title: 'Prototipar tela inicial',
      description: 'Montar a primeira versao da interface React.',
      status: 'NAO_INICIADA',
      priority: 'MEDIA',
      dueDate: '2026-05-24',
      projectName: 'Aplicativo de campo',
      responsibleName: 'Bruno Lima',
      completion: 0,
    },
  ],
  resources: [
    {
      id: '1',
      name: 'Servidor cloud',
      type: 'TECNOLOGICO',
      description: 'Ambiente para API e banco de dados.',
      quantity: 1,
      unitCost: 1200,
      projectName: 'Portal de projetos',
    },
    {
      id: '2',
      name: 'Licenca de design',
      type: 'SOFTWARE',
      description: 'Ferramenta para prototipos e validacao visual.',
      quantity: 3,
      unitCost: 180,
      projectName: 'Aplicativo de campo',
    },
  ],
  costs: [
    {
      id: '1',
      description: 'Infraestrutura inicial',
      type: 'OPERACIONAL',
      plannedValue: 1200,
      realValue: 980,
      date: '2026-05-12',
      projectName: 'Portal de projetos',
    },
    {
      id: '2',
      description: 'Licencas de prototipacao',
      type: 'FERRAMENTA',
      plannedValue: 540,
      realValue: 540,
      date: '2026-05-13',
      projectName: 'Aplicativo de campo',
    },
  ],
  risks: [
    {
      id: '1',
      title: 'Integracao com API',
      description: 'Possivel bloqueio de CORS entre React e Spring Boot.',
      category: 'TECNICO',
      probability: 3,
      impact: 4,
      criticality: 12,
      status: 'EM_ANALISE',
      strategy: 'Liberar origem do Vite na API.',
      projectName: 'Portal de projetos',
    },
  ],
}

function emptyData() {
  return {
    projects: [],
    participants: [],
    activities: [],
    resources: [],
    costs: [],
    risks: [],
  }
}

async function parseResponse(response) {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function extractCollection(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (!payload || typeof payload !== 'object') {
    return []
  }

  const record = payload
  const knownKeys = ['content', 'data', 'items', 'results']

  for (const key of knownKeys) {
    if (Array.isArray(record[key])) {
      return record[key]
    }
  }

  const firstArray = Object.values(record).find(Array.isArray)
  return firstArray || []
}

async function fetchCollection(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: 'application/json' },
  })
  const payload = await parseResponse(response)

  if (!response.ok) {
    const detail =
      payload && typeof payload === 'object'
        ? payload.message || payload.error || payload.detail
        : payload

    throw new Error(`${response.status} em ${path}${detail ? `: ${detail}` : ''}`)
  }

  return extractCollection(payload)
}

function toStringValue(value) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  return String(value)
}

function toNumberValue(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value !== 'string') {
    return null
  }

  const normalized = value
    .replace(/[^\d,.-]/g, '')
    .replace(/\.(?=\d{3}(?:\D|$))/g, '')
    .replace(',', '.')
  const parsed = Number(normalized)

  return Number.isFinite(parsed) ? parsed : null
}

function withId(item, fallback) {
  return toStringValue(item.id) || toStringValue(item.codigo) || fallback
}

function normalizeProject(item, index) {
  return {
    id: withId(item, `projeto-${index}`),
    name: item.nome || item.name || item.titulo || 'Projeto sem nome',
    description: item.descricao || item.description || item.objetivo || '',
    status: item.status || null,
    priority: item.prioridade || null,
    startDate: item.dataInicio || item.startDate || null,
    endDate: item.dataFim || item.endDate || null,
    budget: toNumberValue(item.orcamentoPrevisto || item.valorOrcamento),
    completion: toNumberValue(item.percentualConcluido) || 0,
  }
}

function normalizeParticipant(item, index) {
  return {
    id: withId(item, `participante-${index}`),
    userName: item.usuarioNome || item.userName || item.nomeUsuario || 'Participante sem nome',
    projectName: item.projetoNome || item.projectName || '',
    role: item.funcaoNoProjeto || item.funcao || item.role || '',
    accessRole: item.papelAcesso || item.accessRole || '',
    active: item.ativo ?? item.active ?? null,
  }
}

function normalizeActivity(item, index) {
  return {
    id: withId(item, `atividade-${index}`),
    title: item.titulo || item.title || item.nome || 'Atividade sem titulo',
    description: item.descricao || item.description || '',
    status: item.status || null,
    priority: item.prioridade || item.priority || null,
    startDate: item.dataInicio || item.startDate || null,
    dueDate: item.prazo || item.dueDate || item.dataLimite || null,
    endDate: item.dataConclusao || item.dataFim || item.endDate || null,
    projectName: item.projetoNome || item.projectName || '',
    responsibleName: item.responsavelNome || item.participantName || '',
    completion: toNumberValue(item.percentualConclusao) || 0,
  }
}

function normalizeResource(item, index) {
  return {
    id: withId(item, `recurso-${index}`),
    name: item.nome || item.name || 'Recurso sem nome',
    type: item.tipo || item.type || '',
    description: item.descricao || item.description || '',
    quantity: toNumberValue(item.quantidade),
    unitCost: toNumberValue(item.custoUnitario),
    projectName: item.projetoNome || item.projectName || '',
  }
}

function normalizeCost(item, index) {
  return {
    id: withId(item, `custo-${index}`),
    description: item.descricao || item.description || 'Custo sem descricao',
    type: item.tipo || item.type || '',
    plannedValue: toNumberValue(item.valorPrevisto),
    realValue: toNumberValue(item.valorReal),
    date: item.dataLancamento || item.data || null,
    projectName: item.projetoNome || item.projectName || '',
    activityTitle: item.atividadeTitulo || item.activityName || '',
    resourceName: item.recursoNome || item.resourceName || '',
  }
}

function normalizeRisk(item, index) {
  return {
    id: withId(item, `risco-${index}`),
    title: item.titulo || item.title || item.nome || 'Risco sem titulo',
    description: item.descricao || item.description || '',
    category: item.categoria || item.category || '',
    probability: toNumberValue(item.probabilidade),
    impact: toNumberValue(item.impacto),
    criticality: toNumberValue(item.criticidade),
    status: item.status || null,
    strategy: item.estrategiaResposta || item.planoMitigacao || item.responsePlan || '',
    projectName: item.projetoNome || item.projectName || '',
  }
}

const normalizers = {
  projects: normalizeProject,
  participants: normalizeParticipant,
  activities: normalizeActivity,
  resources: normalizeResource,
  costs: normalizeCost,
  risks: normalizeRisk,
}

export async function loadDashboardData() {
  const data = emptyData()
  const errors = []
  let failedRequests = 0

  await Promise.all(
    Object.entries(ENDPOINTS).map(async ([key, path]) => {
      try {
        const items = await fetchCollection(path)
        data[key] = items.map(normalizers[key]).filter(Boolean)
      } catch (error) {
        failedRequests += 1
        errors.push(
          error instanceof Error
            ? error.message
            : `Nao foi possivel consultar ${path}.`,
        )
      }
    }),
  )

  const isDemo = failedRequests === Object.keys(ENDPOINTS).length

  return {
    data: isDemo ? demoData : data,
    errors,
    isDemo,
    loadedAt: new Date().toISOString(),
  }
}
