import { useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import {
  createActivity,
  createCost,
  createParticipant,
  createProject,
  createResource,
  createRisk,
  deleteActivity,
  deleteCost,
  deleteParticipant,
  deleteProject,
  deleteResource,
  deleteRisk,
  getStoredAuthUser,
  loadDashboardData,
  logout as clearStoredAuthUser,
  prewarmApi,
  saveAuthenticatedUser,
  updateActivity,
  updateCost,
  updateParticipant,
  updateProject,
  updateResource,
  updateRisk,
} from './services/api'
import { LoginPage } from './components/auth/LoginPage'
import { RegisterPage } from './components/auth/RegisterPage'
import { ActionToolbar } from './components/dashboard/ActionToolbar'
import { EntityCrudView } from './components/crud/EntityCrudView'
import { DashboardHeader } from './components/dashboard/DashboardHeader'
import { ProjectFormModal } from './components/dashboard/ProjectFormModal'
import { ProjectDetailPage } from './components/dashboard/ProjectDetailPage'
import { ProjectWizardModal } from './components/dashboard/ProjectWizardModal'
import { IndicatorsPage } from './components/dashboard/IndicatorsPage'
import { ProjectSection } from './components/dashboard/ProjectSection'
import { RecommendedCategories } from './components/dashboard/RecommendedCategories'
import { Sidebar } from './components/dashboard/Sidebar'
import { entityCrudConfigs } from './utils/entityCrudConfig'
import { projectBucket } from './utils/format'
import {
  defaultHiddenSections,
  defaultProjectFilters,
  filterProjects,
  getSortLabel,
  hasActiveProjectFilters,
  hasHiddenSections,
  sortProjects,
} from './utils/projectFilters'

const emptyDashboard = {
  users: [],
  projects: [],
  participants: [],
  activities: [],
  resources: [],
  costs: [],
  risks: [],
}

const hiddenSectionsStorageKey = 'projecthub:hidden-sections'

const viewPaths = {
  dashboard: '/dashboard',
  projects: '/projetos',
  indicators: '/indicadores',
  activities: '/atividades',
  participants: '/participantes',
  resources: '/recursos',
  costs: '/custos',
  risks: '/riscos',
  settings: '/configuracoes',
}

function getProjectDetailPath(projectId) {
  return `/projetos/${projectId}`
}

function getViewPath(view) {
  return viewPaths[view] || viewPaths.dashboard
}

function normalizePathname(pathname) {
  const normalized = pathname.replace(/\/+$/, '')
  return normalized || '/'
}

function getRouteState(pathname) {
  const normalized = normalizePathname(pathname)
  const projectDetailMatch = normalized.match(/^\/projetos\/([^/]+)$/)

  if (projectDetailMatch) {
    return {
      activeView: 'project-detail',
      selectedProjectId: decodeURIComponent(projectDetailMatch[1]),
    }
  }

  const routeEntry = Object.entries(viewPaths).find(([, path]) => path === normalized)

  if (routeEntry) {
    return {
      activeView: routeEntry[0],
      selectedProjectId: null,
    }
  }

  return {
    activeView: 'dashboard',
    selectedProjectId: null,
  }
}

const crudActions = {
  projects: {
    create: createProject,
    update: updateProject,
    delete: deleteProject,
  },
  activities: {
    create: createActivity,
    update: updateActivity,
    delete: deleteActivity,
  },
  participants: {
    create: createParticipant,
    update: updateParticipant,
    delete: deleteParticipant,
  },
  resources: {
    create: createResource,
    update: updateResource,
    delete: deleteResource,
  },
  costs: {
    create: createCost,
    update: updateCost,
    delete: deleteCost,
  },
  risks: {
    create: createRisk,
    update: updateRisk,
    delete: deleteRisk,
  },
}

const viewText = {
  dashboard: {
    title: 'Meus Projetos',
    description: 'Resumo visual dos projetos, tarefas, equipe, custos e riscos carregados da API.',
  },
  projects: {
    title: 'Projetos',
    description: 'Organize seus projetos por status, prioridade, prazo e progresso.',
  },
  indicators: {
    title: 'Indicadores',
    description: 'Visao executiva dos projetos, prazos, custos e riscos.',
  },
  activities: {
    title: 'Atividades',
    description: 'Acompanhe tarefas, responsaveis e prazos vinculados aos projetos.',
  },
  participants: {
    title: 'Participantes',
    description: 'Veja os usuarios e papeis associados aos projetos.',
  },
  resources: {
    title: 'Recursos',
    description: 'Controle recursos humanos, materiais e tecnologicos.',
  },
  costs: {
    title: 'Custos',
    description: 'Compare valores planejados e realizados por projeto.',
  },
  risks: {
    title: 'Riscos',
    description: 'Monitore impactos, probabilidades e planos de resposta.',
  },
  settings: {
    title: 'Configuracoes',
    description: 'Ajustes visuais e informacoes de integracao do projeto.',
  },
}

function normalizeComparable(value) {
  return String(value || '').trim().toLowerCase()
}

function getRelatedProjectId(item) {
  const value = item.projetoId ?? item.projectId ?? item.projeto?.id ?? item.project?.id

  if (value === null || value === undefined || value === '') {
    return null
  }

  return String(value)
}

function getRelatedProjectName(item) {
  return (
    item.projectName ||
    item.projetoNome ||
    item.projeto?.nome ||
    item.project?.name ||
    ''
  )
}

function belongsToProject(item, project) {
  const projectId = project?.id === null || project?.id === undefined ? null : String(project.id)
  const itemProjectId = getRelatedProjectId(item)

  if (projectId && itemProjectId) {
    return itemProjectId === projectId
  }

  return normalizeComparable(getRelatedProjectName(item)) === normalizeComparable(project?.name)
}

function filterItemsByProject(items, project) {
  if (!project) {
    return []
  }

  return items.filter((item) => belongsToProject(item, project))
}

function buildProjectCounters(project, dashboard) {
  return {
    activities: filterItemsByProject(dashboard.activities, project).length,
    participants: filterItemsByProject(dashboard.participants, project).length,
    resources: filterItemsByProject(dashboard.resources, project).length,
    risks: filterItemsByProject(dashboard.risks, project).length,
    costs: filterItemsByProject(dashboard.costs, project).length,
  }
}

function buildCategories(dashboard) {
  return [
    {
      label: 'Projetos',
      hint: `${dashboard.projects.length} registros`,
      icon: 'projects',
      tone: 'amber',
      view: 'projects',
    },
    {
      label: 'Atividades',
      hint: `${dashboard.activities.length} tarefas`,
      icon: 'activities',
      tone: 'rose',
      view: 'activities',
    },
    {
      label: 'Participantes',
      hint: `${dashboard.participants.length} pessoas`,
      icon: 'participants',
      tone: 'emerald',
      view: 'participants',
    },
    {
      label: 'Riscos',
      hint: `${dashboard.risks.length} alertas`,
      icon: 'risks',
      tone: 'violet',
      view: 'risks',
    },
    {
      label: 'Custos',
      hint: `${dashboard.costs.length} lancamentos`,
      icon: 'costs',
      tone: 'orange',
      view: 'costs',
    },
    {
      label: 'Recursos',
      hint: `${dashboard.resources.length} itens`,
      icon: 'resources',
      tone: 'sky',
      view: 'resources',
    },
    {
      label: 'Indicadores',
      hint: 'visao executiva dos projetos',
      icon: 'reports',
      tone: 'zinc',
      view: 'indicators',
    },
  ]
}

function buildNavItems(dashboard) {
  return [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      path: viewPaths.dashboard,
      count: dashboard.projects.length,
    },
    {
      id: 'projects',
      label: 'Projetos',
      icon: 'projects',
      path: viewPaths.projects,
      count: dashboard.projects.length,
    },
    {
      id: 'activities',
      label: 'Atividades',
      icon: 'activities',
      path: viewPaths.activities,
      count: dashboard.activities.length,
    },
    {
      id: 'participants',
      label: 'Participantes',
      icon: 'participants',
      path: viewPaths.participants,
      count: dashboard.participants.length,
    },
    {
      id: 'resources',
      label: 'Recursos',
      icon: 'resources',
      path: viewPaths.resources,
      count: dashboard.resources.length,
    },
    {
      id: 'costs',
      label: 'Custos',
      icon: 'costs',
      path: viewPaths.costs,
      count: dashboard.costs.length,
    },
    {
      id: 'risks',
      label: 'Riscos',
      icon: 'risks',
      path: viewPaths.risks,
      count: dashboard.risks.length,
    },
    {
      id: 'indicators',
      label: 'Indicadores',
      icon: 'reports',
      path: viewPaths.indicators,
    },
    {
      id: 'settings',
      label: 'Configuracoes',
      icon: 'settings',
      path: viewPaths.settings,
    },
  ]
}

function matchesSearch(project, search) {
  const value = search.trim().toLowerCase()

  if (!value) {
    return true
  }

  return [project.name, project.description, project.status, project.priority]
    .filter(Boolean)
    .some((field) => String(field).toLowerCase().includes(value))
}

function groupProjects(projects) {
  return projects.reduce(
    (groups, project) => {
      groups[projectBucket(project)].push(project)
      return groups
    },
    { todo: [], active: [], completed: [] },
  )
}

function readHiddenSections() {
  try {
    const savedValue = localStorage.getItem(hiddenSectionsStorageKey)

    if (!savedValue) {
      return defaultHiddenSections
    }

    return { ...defaultHiddenSections, ...JSON.parse(savedValue) }
  } catch {
    return defaultHiddenSections
  }
}

function Notice({ isDemo, errors }) {
  if (!errors.length) {
    return null
  }

  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
      <p className="text-sm font-semibold">
        {isDemo ? 'API indisponivel, exibindo dados de exemplo.' : 'Algumas consultas falharam.'}
      </p>
      <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">{errors.slice(0, 2).join(' ')}</p>
    </div>
  )
}

function ProjectsBoard({
  activeToolbarMenu,
  dashboard,
  filters,
  hiddenSections,
  loading,
  onClearFilters,
  onClearToolbarState,
  onFilterChange,
  onMenuChange,
  onNewProject,
  onRefresh,
  onRestoreView,
  onSelectView,
  onSortChange,
  onToggleSection,
  projects,
  sortOption,
}) {
  const groupedProjects = groupProjects(projects)
  const categories = buildCategories(dashboard)
  const getCounters = (project) => buildProjectCounters(project, dashboard)
  const allProjectSectionsHidden =
    hiddenSections.todo && hiddenSections.active && hiddenSections.completed
  const summary = {
    activities: dashboard.activities.length,
    costs: dashboard.costs.length,
    participants: dashboard.participants.length,
    projects: dashboard.projects.length,
    resources: dashboard.resources.length,
    risks: dashboard.risks.length,
  }

  return (
    <div className="space-y-7">
      {!hiddenSections.categories ? (
        <RecommendedCategories categories={categories} onSelect={onSelectView} />
      ) : null}
      <ActionToolbar
        activeMenu={activeToolbarMenu}
        filters={filters}
        filtersActive={hasActiveProjectFilters(filters)}
        hiddenSections={hiddenSections}
        loading={loading}
        onClearFilters={onClearFilters}
        onClearToolbarState={onClearToolbarState}
        onFilterChange={onFilterChange}
        onMenuChange={onMenuChange}
        onNewProject={onNewProject}
        onRefresh={onRefresh}
        onRestoreView={onRestoreView}
        onSortChange={onSortChange}
        onToggleSection={onToggleSection}
        sortLabel={getSortLabel(sortOption)}
        sortOption={sortOption}
        summary={summary}
        viewChanged={hasHiddenSections(hiddenSections)}
      />

      {allProjectSectionsHidden ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white/70 px-5 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
          <p className="font-medium text-zinc-700 dark:text-zinc-200">Todas as secoes estao ocultas.</p>
          <button
            type="button"
            onClick={onRestoreView}
            className="mt-3 inline-flex h-9 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Restaurar visualizacao
          </button>
        </div>
      ) : (
        <>
          {!hiddenSections.todo ? (
            <ProjectSection
              getCounters={getCounters}
              onNewProject={onNewProject}
              projects={groupedProjects.todo}
              showAddRow
              title="TODO"
            />
          ) : null}
          {!hiddenSections.active ? (
            <ProjectSection
              getCounters={getCounters}
              projects={groupedProjects.active}
              title="PROJETOS ATIVOS"
            />
          ) : null}
          {!hiddenSections.completed ? (
            <ProjectSection
              getCounters={getCounters}
              projects={groupedProjects.completed}
              title="CONCLUIDOS"
            />
          ) : null}
        </>
      )}
    </div>
  )
}

function SettingsPanel() {
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">Configuracoes do frontend</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
        O React consome a API configurada em <span className="font-medium text-zinc-900 dark:text-zinc-100">VITE_API_URL</span>.
        Para funcionar em producao, a API Spring tambem precisa liberar o dominio deste frontend no CORS.
      </p>
    </section>
  )
}

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [authUser, setAuthUser] = useState(() => getStoredAuthUser())
  const [authNotice, setAuthNotice] = useState('')
  const [projectSearch, setProjectSearch] = useState('')
  const [theme, setTheme] = useState('light')
  const [projectFormOpen, setProjectFormOpen] = useState(false)
  const [projectWizardOpen, setProjectWizardOpen] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [projectSubmitting, setProjectSubmitting] = useState(false)
  const [projectFilters, setProjectFilters] = useState(defaultProjectFilters)
  const [projectSortOption, setProjectSortOption] = useState('none')
  const [hiddenSections, setHiddenSections] = useState(readHiddenSections)
  const [activeToolbarMenu, setActiveToolbarMenu] = useState(null)
  const [dashboard, setDashboard] = useState(emptyDashboard)
  const [requestState, setRequestState] = useState(() => ({
    loading: Boolean(authUser),
    errors: [],
    isDemo: false,
    loadedAt: null,
  }))
  const { activeView, selectedProjectId } = useMemo(
    () => getRouteState(location.pathname),
    [location.pathname],
  )

  useEffect(() => {
    prewarmApi()
  }, [])

  async function refreshDashboard() {
    setRequestState((current) => ({ ...current, loading: true }))

    try {
      const result = await loadDashboardData()
      setDashboard(result.data)
      setRequestState({
        loading: false,
        errors: result.errors,
        isDemo: result.isDemo,
        loadedAt: result.loadedAt,
      })
    } catch (error) {
      setRequestState({
        loading: false,
        errors: [
          error instanceof Error ? error.message : 'Nao foi possivel carregar o painel.',
        ],
        isDemo: false,
        loadedAt: null,
      })
    }
  }

  function handleNavigate(view) {
    navigate(getViewPath(view))
  }

  function handleOpenProjectDetail(project) {
    navigate(getProjectDetailPath(project.id))
    setProjectSearch('')
  }

  function handleBackToProjects() {
    navigate(viewPaths.projects)
  }

  function handleOpenNewProject() {
    setEditingProject(null)
    setProjectWizardOpen(true)
  }

  function handleEditProject(project) {
    setEditingProject(project)
    setProjectFormOpen(true)
  }

  function handleLoginSuccess(user) {
    const safeUser = saveAuthenticatedUser(user)

    if (!safeUser) {
      return
    }

    setAuthUser(safeUser)
    setAuthNotice('')
    setProjectWizardOpen(false)
    setRequestState((current) => ({ ...current, errors: [], loading: true }))
    navigate(viewPaths.dashboard, { replace: true })
  }

  function handleRegisterSuccess(message) {
    setAuthNotice(message)
    navigate('/login')
  }

  function handleLogout() {
    clearStoredAuthUser()
    setAuthUser(null)
    setAuthNotice('')
    setProjectSearch('')
    setProjectWizardOpen(false)
    navigate('/login', { replace: true })
  }

  async function handleSaveProject(payload) {
    setProjectSubmitting(true)

    try {
      if (editingProject) {
        await updateProject(editingProject.id, payload)
      } else {
        await createProject(payload)
      }

      await refreshDashboard()
      setProjectFormOpen(false)
      setEditingProject(null)
    } finally {
      setProjectSubmitting(false)
    }
  }

  async function handleDeleteSelectedProject(project) {
    await deleteProject(project.id)
    navigate(viewPaths.projects, { replace: true })
    await refreshDashboard()
  }

  async function handleProjectWizardSaved(project) {
    await refreshDashboard()
    setProjectWizardOpen(false)
    navigate(getProjectDetailPath(project.id))
    setProjectSearch('')
  }

  function handleFilterChange(field, value) {
    setProjectFilters((currentFilters) => ({ ...currentFilters, [field]: value }))
  }

  function handleClearFilters() {
    setProjectFilters(defaultProjectFilters)
  }

  function handleClearToolbarState() {
    setProjectFilters(defaultProjectFilters)
    setProjectSortOption('none')
  }

  function handleToggleSection(section) {
    setHiddenSections((currentSections) => ({
      ...currentSections,
      [section]: !currentSections[section],
    }))
  }

  function handleRestoreView() {
    setHiddenSections(defaultHiddenSections)
  }

  useEffect(() => {
    if (!authUser) {
      return undefined
    }

    let ignore = false

    async function loadInitialDashboard() {
      try {
        const result = await loadDashboardData()

        if (ignore) {
          return
        }

        setDashboard(result.data)
        setRequestState({
          loading: false,
          errors: result.errors,
          isDemo: result.isDemo,
          loadedAt: result.loadedAt,
        })
      } catch (error) {
        if (ignore) {
          return
        }

        setRequestState({
          loading: false,
          errors: [
            error instanceof Error ? error.message : 'Nao foi possivel carregar o painel.',
          ],
          isDemo: false,
          loadedAt: null,
        })
      }
    }

    loadInitialDashboard()

    return () => {
      ignore = true
    }
  }, [authUser])

  useEffect(() => {
    try {
      localStorage.setItem(hiddenSectionsStorageKey, JSON.stringify(hiddenSections))
    } catch {
      // A visualizacao continua funcionando mesmo se o navegador bloquear localStorage.
    }
  }, [hiddenSections])

  const selectedProject = useMemo(
    () =>
      selectedProjectId
        ? dashboard.projects.find((project) => String(project.id) === String(selectedProjectId))
        : null,
    [dashboard.projects, selectedProjectId],
  )
  const currentView =
    activeView === 'project-detail'
      ? {
          title: selectedProject?.name || 'Projeto',
          description: selectedProject
            ? 'Detalhes, indicadores e registros vinculados ao projeto selecionado.'
            : 'Selecione um projeto para visualizar seus detalhes.',
        }
      : viewText[activeView] || viewText.dashboard
  const navItems = useMemo(() => buildNavItems(dashboard), [dashboard])
  const visibleProjects = useMemo(
    () =>
      sortProjects(
        filterProjects(
          dashboard.projects.filter((project) =>
            activeView === 'projects' ? matchesSearch(project, projectSearch) : true,
          ),
          projectFilters,
        ),
        projectSortOption,
      ),
    [activeView, dashboard.projects, projectFilters, projectSortOption, projectSearch],
  )

  const projectRelatedItems = useMemo(
    () => ({
      activities: filterItemsByProject(dashboard.activities, selectedProject),
      participants: filterItemsByProject(dashboard.participants, selectedProject),
      resources: filterItemsByProject(dashboard.resources, selectedProject),
      costs: filterItemsByProject(dashboard.costs, selectedProject),
      risks: filterItemsByProject(dashboard.risks, selectedProject),
    }),
    [
      dashboard.activities,
      dashboard.costs,
      dashboard.participants,
      dashboard.resources,
      dashboard.risks,
      selectedProject,
    ],
  )

  const crudContext = {
    activities: dashboard.activities,
    participants: dashboard.participants,
    projects: dashboard.projects,
    resources: dashboard.resources,
    users: dashboard.users,
  }

  const sidebarActiveView = activeView === 'project-detail' ? 'projects' : activeView
  const isDark = theme === 'dark'

  function renderCrudView(view) {
    const config = entityCrudConfigs[view]
    const actions = crudActions[view]
    const isProjectsView = view === 'projects'

    return (
      <EntityCrudView
        config={config}
        context={crudContext}
        errors={requestState.errors}
        items={isProjectsView ? visibleProjects : dashboard[view]}
        loading={requestState.loading}
        onCreate={actions.create}
        onDelete={actions.delete}
        onCreateClick={isProjectsView ? handleOpenNewProject : undefined}
        onRefresh={refreshDashboard}
        onSearchChange={isProjectsView ? setProjectSearch : undefined}
        onUpdate={actions.update}
        onView={isProjectsView ? handleOpenProjectDetail : undefined}
        searchPlaceholder="Buscar projetos..."
        searchValue={isProjectsView ? projectSearch : ''}
        showSearch={isProjectsView && (dashboard.projects.length > 0 || Boolean(projectSearch))}
        viewLabel="Entrar"
      />
    )
  }

  function renderProjectDetail() {
    if (selectedProject) {
      return (
        <ProjectDetailPage
          key={selectedProject.id}
          actions={crudActions}
          context={crudContext}
          errors={requestState.errors}
          loading={requestState.loading}
          onBack={handleBackToProjects}
          onDeleteProject={handleDeleteSelectedProject}
          onEditProject={handleEditProject}
          onRefresh={refreshDashboard}
          project={selectedProject}
          relatedItems={projectRelatedItems}
        />
      )
    }

    if (requestState.loading) {
      return (
        <section className="rounded-3xl border border-zinc-200 bg-white px-6 py-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
            Carregando projeto...
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Buscando os dados vinculados a esta rota.
          </p>
        </section>
      )
    }

    return (
      <section className="rounded-3xl border border-zinc-200 bg-white px-6 py-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
          Projeto nao encontrado
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          O projeto selecionado nao esta mais na lista carregada da API.
        </p>
        <button
          type="button"
          onClick={handleBackToProjects}
          className="mt-5 inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Voltar para projetos
        </button>
      </section>
    )
  }

  if (!authUser) {
    return (
      <div className={isDark ? 'dark' : ''}>
        <Routes>
          <Route
            path="/cadastro"
            element={
              <RegisterPage
                onGoToLogin={() => navigate('/login')}
                onRegistered={handleRegisterSuccess}
              />
            }
          />
          <Route
            path="/login"
            element={
              <LoginPage
                notice={authNotice}
                onGoToRegister={() => {
                  setAuthNotice('')
                  navigate('/cadastro')
                }}
                onLoginSuccess={handleLoginSuccess}
              />
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    )
  }

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-zinc-50 text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-zinc-50">
      <Sidebar
        activeView={sidebarActiveView}
        navItems={navItems}
      />

      <main className="thin-scrollbar min-h-screen min-w-0 px-3 py-4 sm:px-6 sm:py-5 lg:ml-64 lg:px-8 lg:py-7">
        <div className="mx-auto max-w-7xl space-y-5 sm:space-y-7">
          <DashboardHeader
            currentUser={authUser}
            description={currentView.description}
            isDark={isDark}
            onLogout={handleLogout}
            onToggleTheme={() =>
              setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
            }
            title={currentView.title}
          />

          <Notice errors={requestState.errors} isDemo={requestState.isDemo} />

          <Routes>
            <Route path="/" element={<Navigate to={viewPaths.dashboard} replace />} />
            <Route
              path="/dashboard"
              element={
                <ProjectsBoard
                  activeToolbarMenu={activeToolbarMenu}
                  dashboard={dashboard}
                  filters={projectFilters}
                  hiddenSections={hiddenSections}
                  loading={requestState.loading}
                  onClearFilters={handleClearFilters}
                  onClearToolbarState={handleClearToolbarState}
                  onFilterChange={handleFilterChange}
                  onMenuChange={setActiveToolbarMenu}
                  onNewProject={handleOpenNewProject}
                  onRefresh={refreshDashboard}
                  onRestoreView={handleRestoreView}
                  onSelectView={handleNavigate}
                  onSortChange={setProjectSortOption}
                  onToggleSection={handleToggleSection}
                  projects={visibleProjects}
                  sortOption={projectSortOption}
                />
              }
            />
            <Route path="/projetos" element={renderCrudView('projects')} />
            <Route path="/projetos/:projectId" element={renderProjectDetail()} />
            <Route path="/atividades" element={renderCrudView('activities')} />
            <Route path="/participantes" element={renderCrudView('participants')} />
            <Route path="/recursos" element={renderCrudView('resources')} />
            <Route path="/custos" element={renderCrudView('costs')} />
            <Route path="/riscos" element={renderCrudView('risks')} />
            <Route
              path="/indicadores"
              element={
                <IndicatorsPage
                  dashboard={dashboard}
                  errors={requestState.errors}
                  loading={requestState.loading}
                  onBack={() => handleNavigate('dashboard')}
                  onOpenProject={handleOpenProjectDetail}
                />
              }
            />
            <Route path="/configuracoes" element={<SettingsPanel />} />
            <Route path="*" element={<Navigate to={viewPaths.dashboard} replace />} />
          </Routes>
        </div>
      </main>

      {projectFormOpen ? (
        <ProjectFormModal
          key={editingProject ? `edit-${editingProject.id}` : 'new-project'}
          onClose={() => {
            setProjectFormOpen(false)
            setEditingProject(null)
          }}
          onSubmit={handleSaveProject}
          open={projectFormOpen}
          project={editingProject}
          submitting={projectSubmitting}
        />
      ) : null}
      {projectWizardOpen ? (
        <ProjectWizardModal
          actions={crudActions}
          onClose={() => setProjectWizardOpen(false)}
          onSaved={handleProjectWizardSaved}
          open={projectWizardOpen}
          users={dashboard.users}
        />
      ) : null}
      </div>
    </div>
  )
}

export default App
