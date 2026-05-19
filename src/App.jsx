import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { loadDashboardData } from './services/api'
import { ActionToolbar } from './components/dashboard/ActionToolbar'
import { DashboardHeader } from './components/dashboard/DashboardHeader'
import { EntityOverview } from './components/dashboard/EntityOverview'
import { ProjectSection } from './components/dashboard/ProjectSection'
import { RecommendedCategories } from './components/dashboard/RecommendedCategories'
import { Sidebar } from './components/dashboard/Sidebar'
import { projectBucket } from './utils/format'

const emptyDashboard = {
  projects: [],
  participants: [],
  activities: [],
  resources: [],
  costs: [],
  risks: [],
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

function ProjectsBoard({ dashboard, loading, onRefresh, onSelectView, projects }) {
  const groupedProjects = groupProjects(projects)
  const categories = buildCategories(dashboard)
  const getCounters = (project) => buildProjectCounters(project, dashboard)

  return (
    <div className="space-y-7">
      <RecommendedCategories categories={categories} onSelect={onSelectView} />
      <ActionToolbar loading={loading} onRefresh={onRefresh} />
      <ProjectSection
        getCounters={getCounters}
        projects={groupedProjects.todo}
        showAddRow
        title="TODO"
      />
      <ProjectSection
        getCounters={getCounters}
        projects={groupedProjects.active}
        title="PROJETOS ATIVOS"
      />
      <ProjectSection
        getCounters={getCounters}
        projects={groupedProjects.completed}
        title="CONCLUIDOS"
      />
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
  const [activeView, setActiveView] = useState('dashboard')
  const [search, setSearch] = useState('')
  const [theme, setTheme] = useState('light')
  const [dashboard, setDashboard] = useState(emptyDashboard)
  const [requestState, setRequestState] = useState({
    loading: true,
    errors: [],
    isDemo: false,
    loadedAt: null,
  })

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

  useEffect(() => {
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
  }, [])

  const currentView = viewText[activeView] || viewText.dashboard
  const navItems = useMemo(() => buildNavItems(dashboard), [dashboard])
  const visibleProjects = useMemo(
    () => dashboard.projects.filter((project) => matchesSearch(project, search)),
    [dashboard.projects, search],
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

  const isDark = theme === 'dark'

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
            description={currentView.description}
            isDark={isDark}
            onSearchChange={setSearch}
            onToggleTheme={() =>
              setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
            }
            searchValue={search}
            title={currentView.title}
          />

          <Notice errors={requestState.errors} isDemo={requestState.isDemo} />

          {activeView === 'dashboard' || activeView === 'projects' ? (
            <ProjectsBoard
              dashboard={dashboard}
              loading={requestState.loading}
              onRefresh={refreshDashboard}
              onSelectView={setActiveView}
              projects={visibleProjects}
            />
          ) : activeView === 'settings' ? (
            <SettingsPanel />
          ) : (
            <EntityOverview items={entityItems} title={currentView.title} type={activeView} />
          )}
        </div>
      </main>
      </div>
    </div>
  )
}

export default App
