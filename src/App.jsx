import { useEffect, useMemo, useState } from 'react'
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
import { EntityOverview } from './components/dashboard/EntityOverview'
import { ProjectFormModal } from './components/dashboard/ProjectFormModal'
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

function countByProjectName(items, projectName) {
  if (!projectName) {
    return 0
  }

  return items.filter((item) => item.projectName === projectName).length
}

function buildProjectCounters(project, dashboard) {
  return {
    activities: countByProjectName(dashboard.activities, project.name),
    participants: countByProjectName(dashboard.participants, project.name),
    risks: countByProjectName(dashboard.risks, project.name),
    costs: countByProjectName(dashboard.costs, project.name),
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
      label: 'Relatorios',
      hint: 'indicadores gerais',
      icon: 'reports',
      tone: 'zinc',
      view: 'dashboard',
    },
    {
      label: 'Equipe',
      hint: 'visao da equipe',
      icon: 'team',
      tone: 'cyan',
      view: 'participants',
    },
  ]
}

function buildNavItems(dashboard) {
  return [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', count: dashboard.projects.length },
    { id: 'projects', label: 'Projetos', icon: 'projects', count: dashboard.projects.length },
    { id: 'activities', label: 'Atividades', icon: 'activities', count: dashboard.activities.length },
    {
      id: 'participants',
      label: 'Participantes',
      icon: 'participants',
      count: dashboard.participants.length,
    },
    { id: 'resources', label: 'Recursos', icon: 'resources', count: dashboard.resources.length },
    { id: 'costs', label: 'Custos', icon: 'costs', count: dashboard.costs.length },
    { id: 'risks', label: 'Riscos', icon: 'risks', count: dashboard.risks.length },
    { id: 'settings', label: 'Configuracoes', icon: 'settings' },
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

function filterEntities(items, search, fields) {
  const value = search.trim().toLowerCase()

  if (!value) {
    return items
  }

  return items.filter((item) =>
    fields
      .map((field) => item[field])
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(value)),
  )
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
  const [authUser, setAuthUser] = useState(() => getStoredAuthUser())
  const [authView, setAuthView] = useState('login')
  const [authNotice, setAuthNotice] = useState('')
  const [activeView, setActiveView] = useState('dashboard')
  const [search, setSearch] = useState('')
  const [theme, setTheme] = useState('light')
  const [projectFormOpen, setProjectFormOpen] = useState(false)
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

  function handleLoginSuccess(user) {
    const safeUser = saveAuthenticatedUser(user)

    if (!safeUser) {
      return
    }

    setAuthUser(safeUser)
    setAuthNotice('')
    setAuthView('login')
    setActiveView('dashboard')
    setRequestState((current) => ({ ...current, errors: [], loading: true }))
  }

  function handleRegisterSuccess(message) {
    setAuthNotice(message)
    setAuthView('login')
  }

  function handleLogout() {
    clearStoredAuthUser()
    setAuthUser(null)
    setAuthNotice('')
    setAuthView('login')
    setSearch('')
    setActiveView('dashboard')
  }

  async function handleCreateProject(payload) {
    setProjectSubmitting(true)

    try {
      await createProject(payload)
      await refreshDashboard()
      setProjectFormOpen(false)
    } finally {
      setProjectSubmitting(false)
    }
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

  const currentView = viewText[activeView] || viewText.dashboard
  const navItems = useMemo(() => buildNavItems(dashboard), [dashboard])
  const visibleProjects = useMemo(
    () =>
      sortProjects(
        filterProjects(
          dashboard.projects.filter((project) => matchesSearch(project, search)),
          projectFilters,
        ),
        projectSortOption,
      ),
    [dashboard.projects, projectFilters, projectSortOption, search],
  )

  const entityFields = {
    activities: ['title', 'description', 'projectName', 'responsibleName', 'status', 'priority'],
    participants: ['userName', 'projectName', 'role', 'accessRole'],
    resources: ['name', 'description', 'projectName', 'type'],
    costs: ['description', 'projectName', 'activityTitle', 'resourceName', 'type'],
    risks: ['title', 'description', 'projectName', 'category', 'status'],
  }

  const entityItems =
    activeView in entityFields
      ? filterEntities(dashboard[activeView], search, entityFields[activeView])
      : []
  const crudConfig = entityCrudConfigs[activeView]
  const crudActionsForView = crudActions[activeView]
  const crudItems = activeView === 'projects' ? visibleProjects : entityItems
  const crudContext = {
    activities: dashboard.activities,
    participants: dashboard.participants,
    projects: dashboard.projects,
    resources: dashboard.resources,
    users: dashboard.users,
  }

  const isDark = theme === 'dark'

  if (!authUser) {
    return (
      <div className={isDark ? 'dark' : ''}>
        {authView === 'register' ? (
          <RegisterPage
            onGoToLogin={() => setAuthView('login')}
            onRegistered={handleRegisterSuccess}
          />
        ) : (
          <LoginPage
            notice={authNotice}
            onGoToRegister={() => {
              setAuthNotice('')
              setAuthView('register')
            }}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </div>
    )
  }

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-zinc-50 text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-zinc-50">
      <Sidebar
        activeView={activeView}
        navItems={navItems}
        onNavigate={setActiveView}
      />

      <main className="thin-scrollbar min-h-screen px-4 py-5 sm:px-6 lg:ml-64 lg:px-8 lg:py-7">
        <div className="mx-auto max-w-7xl space-y-7">
          <DashboardHeader
            currentUser={authUser}
            description={currentView.description}
            isDark={isDark}
            onLogout={handleLogout}
            onSearchChange={setSearch}
            onToggleTheme={() =>
              setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
            }
            searchValue={search}
            title={currentView.title}
          />

          <Notice errors={requestState.errors} isDemo={requestState.isDemo} />

          {activeView === 'dashboard' ? (
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
              onNewProject={() => setProjectFormOpen(true)}
              onRefresh={refreshDashboard}
              onRestoreView={handleRestoreView}
              onSelectView={setActiveView}
              onSortChange={setProjectSortOption}
              onToggleSection={handleToggleSection}
              projects={visibleProjects}
              sortOption={projectSortOption}
            />
          ) : crudConfig ? (
            <EntityCrudView
              config={crudConfig}
              context={crudContext}
              errors={requestState.errors}
              items={crudItems}
              loading={requestState.loading}
              onCreate={crudActionsForView.create}
              onDelete={crudActionsForView.delete}
              onRefresh={refreshDashboard}
              onUpdate={crudActionsForView.update}
            />
          ) : activeView === 'settings' ? (
            <SettingsPanel />
          ) : (
            <EntityOverview items={entityItems} title={currentView.title} type={activeView} />
          )}
        </div>
      </main>

      {projectFormOpen ? (
        <ProjectFormModal
          onClose={() => setProjectFormOpen(false)}
          onSubmit={handleCreateProject}
          open={projectFormOpen}
          submitting={projectSubmitting}
        />
      ) : null}
      </div>
    </div>
  )
}

export default App
