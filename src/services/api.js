const DEFAULT_API_URL = 'https://api-spring-gerenciamento-projetos.onrender.com'

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL?.trim() || DEFAULT_API_URL
).replace(/\/$/, '')

export const API_DISPLAY_URL = API_BASE_URL

const ENDPOINTS = {
  users: '/usuarios',
  projects: '/projetos',
  participants: '/participantes',
  activities: '/atividades',
  resources: '/recursos',
  costs: '/custos',
  risks: '/riscos',
}

const LOGIN_ENDPOINT = '/auth/login'
const authUserStorageKey = 'projecthub:auth-user'

const demoData = {
  users: [
    {
      id: '1',
      nome: 'Ana Souza',
      email: 'ana@example.com',
      telefone: '11999990000',
      perfil: 'GERENTE_PROJETO',
    },
    {
      id: '2',
      nome: 'Bruno Lima',
      email: 'bruno@example.com',
      telefone: '11888880000',
      perfil: 'ANALISTA',
    },
  ],
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
    users: [],
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

async function apiRequest(path, options = {}) {
  const { body, method = 'GET' } = options
  const headers = { Accept: 'application/json' }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const payload = await parseResponse(response)

  if (!response.ok) {
    const detail = getErrorDetail(payload)

    throw new Error(`${response.status} em ${path}${detail ? `: ${detail}` : ''}`)
  }

  return payload
}

async function fetchCollection(path) {
  return extractCollection(await apiRequest(path))
}

function getErrorDetail(payload) {
  if (!payload) {
    return ''
  }

  if (typeof payload === 'string') {
    return payload
  }

  if (typeof payload !== 'object') {
    return ''
  }

  if (payload.message || payload.error || payload.detail) {
    return payload.message || payload.error || payload.detail
  }

  const validationErrors = payload.errors || payload.fieldErrors

  if (Array.isArray(validationErrors)) {
    return validationErrors
      .map((item) => item.defaultMessage || item.message || String(item))
      .join(' ')
  }

  if (validationErrors && typeof validationErrors === 'object') {
    return Object.entries(validationErrors)
      .map(([field, message]) => {
        const value = Array.isArray(message) ? message.join(', ') : message
        return `${field}: ${value}`
      })
      .join(' ')
  }

  return ''
}

function getSafeUserSource(payload) {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  if (payload.usuario && typeof payload.usuario === 'object') {
    return payload.usuario
  }

  if (payload.user && typeof payload.user === 'object') {
    return payload.user
  }

  return payload
}

function normalizeSafeUser(payload) {
  const user = getSafeUserSource(payload)

  if (!user) {
    return null
  }

  const safeUser = {
    id: user.id ?? user.codigo ?? null,
    nome: user.nome || user.name || '',
    email: user.email || '',
    perfil: user.perfil || user.profile || '',
  }

  if (!safeUser.id && !safeUser.nome && !safeUser.email && !safeUser.perfil) {
    return null
  }

  return safeUser
}

export function getStoredAuthUser() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const savedUser = window.localStorage.getItem(authUserStorageKey)

    if (!savedUser) {
      return null
    }

    return normalizeSafeUser(JSON.parse(savedUser))
  } catch {
    return null
  }
}

export function saveAuthenticatedUser(user) {
  const safeUser = normalizeSafeUser(user)

  if (!safeUser || typeof window === 'undefined') {
    return null
  }

  try {
    window.localStorage.setItem(authUserStorageKey, JSON.stringify(safeUser))
  } catch {
    // A sessao atual ainda pode continuar mesmo se o navegador bloquear localStorage.
  }

  return safeUser
}

export function logout() {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.removeItem(authUserStorageKey)
  } catch {
    // Nada para limpar quando o navegador bloqueia localStorage.
  }
}

export async function registerUser(payload) {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.users}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  const responsePayload = await parseResponse(response)

  if (!response.ok) {
    const detail = getErrorDetail(responsePayload)
    throw new Error(
      detail || 'Nao foi possivel cadastrar o usuario. Verifique os dados e tente novamente.',
    )
  }

  return normalizeSafeUser(responsePayload) || {}
}

export const createUser = registerUser

export async function login(credentials) {
  const response = await fetch(`${API_BASE_URL}${LOGIN_ENDPOINT}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })
  const payload = await parseResponse(response)

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(
        'Login ainda não disponível na API. O cadastro já está funcionando, mas falta implementar o endpoint /auth/login no backend.',
      )
    }

    if (response.status === 401 || response.status === 403) {
      throw new Error('Email ou senha invalidos.')
    }

    const detail = getErrorDetail(payload)
    throw new Error(detail || 'Email ou senha invalidos.')
  }

  const safeUser = normalizeSafeUser(payload)

  if (!safeUser) {
    throw new Error('Resposta de login invalida.')
  }

  return safeUser
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

function normalizeUser(item, index) {
  return {
    ...item,
    id: withId(item, `usuario-${index}`),
    name: item.nome || item.name || 'Usuario sem nome',
    email: item.email || '',
    phone: item.telefone || '',
    profile: item.perfil || null,
  }
}

function normalizeProject(item, index) {
  const budget = toNumberValue(item.orcamentoPrevisto ?? item.valorOrcamento)
  const completion = toNumberValue(item.percentualConcluido) || 0

  return {
    ...item,
    id: withId(item, `projeto-${index}`),
    nome: item.nome || item.name || item.titulo || 'Projeto sem nome',
    descricao: item.descricao || item.description || '',
    prioridade: item.prioridade || item.priority || null,
    dataInicio: item.dataInicio || item.startDate || null,
    dataFim: item.dataFim || item.endDate || null,
    orcamentoPrevisto: budget,
    percentualConcluido: completion,
    name: item.nome || item.name || item.titulo || 'Projeto sem nome',
    description: item.descricao || item.description || item.objetivo || '',
    status: item.status || null,
    priority: item.prioridade || item.priority || null,
    startDate: item.dataInicio || item.startDate || null,
    endDate: item.dataFim || item.endDate || null,
    budget,
    completion,
  }
}

function normalizeParticipant(item, index) {
  return {
    ...item,
    id: withId(item, `participante-${index}`),
    usuarioId: item.usuarioId ?? null,
    projetoId: item.projetoId ?? null,
    funcaoNoProjeto: item.funcaoNoProjeto || item.funcao || item.role || '',
    papelAcesso: item.papelAcesso || item.accessRole || '',
    ativo: item.ativo ?? item.active ?? null,
    userName: item.usuarioNome || item.userName || item.nomeUsuario || 'Participante sem nome',
    projectName: item.projetoNome || item.projectName || '',
    role: item.funcaoNoProjeto || item.funcao || item.role || '',
    accessRole: item.papelAcesso || item.accessRole || '',
    active: item.ativo ?? item.active ?? null,
  }
}

function normalizeActivity(item, index) {
  const completion = toNumberValue(item.percentualConclusao) || 0
  const title = item.titulo || item.title || item.nome || 'Atividade sem titulo'
  const description = item.descricao || item.description || ''
  const priority = item.prioridade || item.priority || null
  const startDate = item.dataInicio || item.startDate || null
  const dueDate = item.prazo || item.dueDate || item.dataLimite || null
  const endDate = item.dataConclusao || item.dataFim || item.endDate || null

  return {
    ...item,
    id: withId(item, `atividade-${index}`),
    titulo: title,
    descricao: description,
    prioridade: priority,
    dataInicio: startDate,
    prazo: dueDate,
    dataConclusao: endDate,
    percentualConclusao: completion,
    projetoId: item.projetoId ?? null,
    responsavelId: item.responsavelId ?? null,
    title,
    description,
    status: item.status || null,
    priority,
    startDate,
    dueDate,
    endDate,
    projectName: item.projetoNome || item.projectName || '',
    responsibleName: item.responsavelNome || item.participantName || '',
    completion,
  }
}

function normalizeResource(item, index) {
  const quantity = toNumberValue(item.quantidade)
  const unitCost = toNumberValue(item.custoUnitario)
  const name = item.nome || item.name || 'Recurso sem nome'
  const type = item.tipo || item.type || ''
  const description = item.descricao || item.description || ''

  return {
    ...item,
    id: withId(item, `recurso-${index}`),
    nome: name,
    tipo: type,
    descricao: description,
    quantidade: quantity,
    custoUnitario: unitCost,
    projetoId: item.projetoId ?? null,
    name,
    type,
    description,
    quantity,
    unitCost,
    projectName: item.projetoNome || item.projectName || '',
  }
}

function normalizeCost(item, index) {
  const plannedValue = toNumberValue(item.valorPrevisto)
  const realValue = toNumberValue(item.valorReal)
  const description = item.descricao || item.description || 'Custo sem descricao'
  const type = item.tipo || item.type || ''
  const date = item.dataLancamento || item.data || null

  return {
    ...item,
    id: withId(item, `custo-${index}`),
    descricao: description,
    tipo: type,
    valorPrevisto: plannedValue,
    valorReal: realValue,
    dataLancamento: date,
    projetoId: item.projetoId ?? null,
    atividadeId: item.atividadeId ?? null,
    recursoId: item.recursoId ?? null,
    description,
    type,
    plannedValue,
    realValue,
    date,
    projectName: item.projetoNome || item.projectName || '',
    activityTitle: item.atividadeTitulo || item.activityName || '',
    resourceName: item.recursoNome || item.resourceName || '',
  }
}

function normalizeRisk(item, index) {
  const probability = toNumberValue(item.probabilidade)
  const impact = toNumberValue(item.impacto)
  const criticality = toNumberValue(item.criticidade)
  const title = item.titulo || item.title || item.nome || 'Risco sem titulo'
  const description = item.descricao || item.description || ''
  const category = item.categoria || item.category || ''
  const strategy = item.estrategiaResposta || item.planoMitigacao || item.responsePlan || ''

  return {
    ...item,
    id: withId(item, `risco-${index}`),
    projetoId: item.projetoId ?? null,
    titulo: title,
    descricao: description,
    categoria: category,
    probabilidade: probability,
    impacto: impact,
    criticidade: criticality,
    estrategiaResposta: strategy,
    title,
    description,
    category,
    probability,
    impact,
    criticality,
    status: item.status || null,
    strategy,
    projectName: item.projetoNome || item.projectName || '',
  }
}

const normalizers = {
  users: normalizeUser,
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

async function getEntityCollection(key) {
  const items = await fetchCollection(ENDPOINTS[key])
  return items.map(normalizers[key]).filter(Boolean)
}

async function getEntityById(key, id) {
  const payload = await apiRequest(`${ENDPOINTS[key]}/${id}`)
  return normalizers[key](payload, id)
}

async function createEntity(key, payload) {
  const responsePayload = await apiRequest(ENDPOINTS[key], {
    method: 'POST',
    body: payload,
  })
  return normalizers[key](responsePayload, 'novo')
}

async function updateEntity(key, id, payload) {
  const responsePayload = await apiRequest(`${ENDPOINTS[key]}/${id}`, {
    method: 'PUT',
    body: payload,
  })
  return normalizers[key](responsePayload, id)
}

async function deleteEntity(key, id) {
  await apiRequest(`${ENDPOINTS[key]}/${id}`, { method: 'DELETE' })
}

export const getUsers = () => getEntityCollection('users')
export const getProjects = () => getEntityCollection('projects')
export const getProjectById = (id) => getEntityById('projects', id)
export async function createProject(payload) {
  return createEntity('projects', payload)
}
export const updateProject = (id, payload) => updateEntity('projects', id, payload)
export const deleteProject = (id) => deleteEntity('projects', id)

export const getActivities = () => getEntityCollection('activities')
export const getActivityById = (id) => getEntityById('activities', id)
export const createActivity = (payload) => createEntity('activities', payload)
export const updateActivity = (id, payload) => updateEntity('activities', id, payload)
export const deleteActivity = (id) => deleteEntity('activities', id)

export const getParticipants = () => getEntityCollection('participants')
export const getParticipantById = (id) => getEntityById('participants', id)
export const createParticipant = (payload) => createEntity('participants', payload)
export const updateParticipant = (id, payload) => updateEntity('participants', id, payload)
export const deleteParticipant = (id) => deleteEntity('participants', id)

export const getResources = () => getEntityCollection('resources')
export const getResourceById = (id) => getEntityById('resources', id)
export const createResource = (payload) => createEntity('resources', payload)
export const updateResource = (id, payload) => updateEntity('resources', id, payload)
export const deleteResource = (id) => deleteEntity('resources', id)

export const getCosts = () => getEntityCollection('costs')
export const getCostById = (id) => getEntityById('costs', id)
export const createCost = (payload) => createEntity('costs', payload)
export const updateCost = (id, payload) => updateEntity('costs', id, payload)
export const deleteCost = (id) => deleteEntity('costs', id)

export const getRisks = () => getEntityCollection('risks')
export const getRiskById = (id) => getEntityById('risks', id)
export const createRisk = (payload) => createEntity('risks', payload)
export const updateRisk = (id, payload) => updateEntity('risks', id, payload)
export const deleteRisk = (id) => deleteEntity('risks', id)
