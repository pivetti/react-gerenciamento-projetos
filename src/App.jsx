import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { API_DISPLAY_URL, loadDashboardData } from './services/api'

const emptyDashboard = {
  projects: [],
  participants: [],
  activities: [],
  resources: [],
  costs: [],
  risks: [],
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'projects', label: 'Projetos' },
  { id: 'participants', label: 'Participantes' },
  { id: 'activities', label: 'Atividades' },
  { id: 'resources', label: 'Recursos' },
  { id: 'costs', label: 'Custos' },
  { id: 'risks', label: 'Riscos' },
]

const viewText = {
  dashboard: {
    title: 'Dashboard',
    description: 'Resumo dos dados vindos da API Spring Boot.',
  },
  projects: {
    title: 'Projetos',
    description: 'Nome, status, prioridade, orcamento e progresso.',
  },
  participants: {
    title: 'Participantes',
    description: 'Equipe vinculada aos projetos.',
  },
  activities: {
    title: 'Atividades',
    description: 'Tarefas, responsaveis e prazos.',
  },
  resources: {
    title: 'Recursos',
    description: 'Recursos humanos, materiais ou tecnologicos.',
  },
  costs: {
    title: 'Custos',
    description: 'Valores planejados e realizados.',
  },
  risks: {
    title: 'Riscos',
    description: 'Probabilidade, impacto e plano de resposta.',
  },
}

const statusLabels = {
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

function formatLabel(value) {
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

function formatDate(value) {
  if (!value) {
    return '-'
  }

  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('pt-BR').format(parsed)
}

function formatMoney(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '-'
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function formatPercent(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '0%'
  }

  return `${Math.max(0, Math.min(100, value))}%`
}

function getStatusTone(value) {
  const normalized = String(value || '').toLowerCase()

  if (normalized.includes('concl') || normalized.includes('mitig')) {
    return 'success'
  }

  if (normalized.includes('bloque') || normalized.includes('cancel')) {
    return 'danger'
  }

  if (normalized.includes('analise') || normalized.includes('tratamento')) {
    return 'warning'
  }

  if (normalized.includes('andamento') || normalized.includes('planejado')) {
    return 'info'
  }

  return 'neutral'
}

function getCollectionCount(dashboard, id) {
  if (id === 'dashboard') {
    return dashboard.projects.length
  }

  return dashboard[id]?.length || 0
}

function buildMetrics(dashboard) {
  const totalCost = dashboard.costs.reduce(
    (sum, cost) => sum + (cost.realValue || cost.plannedValue || 0),
    0,
  )
  const activeProjects = dashboard.projects.filter(
    (project) => project.status === 'EM_ANDAMENTO',
  ).length
  const criticalRisks = dashboard.risks.filter(
    (risk) => (risk.criticality || 0) >= 10,
  ).length

  return [
    {
      label: 'Projetos',
      value: dashboard.projects.length,
      hint: `${activeProjects} em andamento`,
      tone: 'blue',
    },
    {
      label: 'Atividades',
      value: dashboard.activities.length,
      hint: 'tarefas cadastradas',
      tone: 'green',
    },
    {
      label: 'Custos',
      value: formatMoney(totalCost),
      hint: 'valor acumulado',
      tone: 'amber',
    },
    {
      label: 'Riscos',
      value: dashboard.risks.length,
      hint: `${criticalRisks} criticos`,
      tone: 'red',
    },
  ]
}

function MetricCard({ label, value, hint, tone }) {
  return (
    <article className={`metric-card metric-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{hint}</p>
    </article>
  )
}

function StatusBadge({ value }) {
  return (
    <span className={`status-badge ${getStatusTone(value)}`}>
      {formatLabel(value)}
    </span>
  )
}

function ProgressBar({ value }) {
  return (
    <div className="progress-wrap" aria-label={`Progresso ${formatPercent(value)}`}>
      <span style={{ width: formatPercent(value) }}></span>
    </div>
  )
}

function InfoLine({ label, value }) {
  return (
    <div className="info-line">
      <span>{label}</span>
      <strong>{value || '-'}</strong>
    </div>
  )
}

function ProjectCard({ project }) {
  return (
    <article className="item-card">
      <div className="card-heading">
        <div>
          <h3>{project.name}</h3>
          <p>{project.description || 'Sem descricao cadastrada.'}</p>
        </div>
        <StatusBadge value={project.status} />
      </div>

      <div className="project-progress">
        <div>
          <span>Progresso</span>
          <strong>{formatPercent(project.completion)}</strong>
        </div>
        <ProgressBar value={project.completion} />
      </div>

      <div className="info-grid">
        <InfoLine label="Inicio" value={formatDate(project.startDate)} />
        <InfoLine label="Fim" value={formatDate(project.endDate)} />
        <InfoLine label="Prioridade" value={formatLabel(project.priority)} />
        <InfoLine label="Orcamento" value={formatMoney(project.budget)} />
      </div>
    </article>
  )
}

function ActivityCard({ activity }) {
  return (
    <article className="item-card">
      <div className="card-heading">
        <div>
          <h3>{activity.title}</h3>
          <p>{activity.description || activity.projectName || 'Sem descricao cadastrada.'}</p>
        </div>
        <StatusBadge value={activity.status} />
      </div>
      <div className="info-grid">
        <InfoLine label="Projeto" value={activity.projectName} />
        <InfoLine label="Responsavel" value={activity.responsibleName} />
        <InfoLine label="Prazo" value={formatDate(activity.dueDate)} />
        <InfoLine label="Prioridade" value={formatLabel(activity.priority)} />
      </div>
      <ProgressBar value={activity.completion} />
    </article>
  )
}

function ParticipantCard({ participant }) {
  return (
    <article className="item-card compact-card">
      <div className="card-heading">
        <div>
          <h3>{participant.userName}</h3>
          <p>{participant.projectName || 'Sem projeto vinculado.'}</p>
        </div>
        <StatusBadge value={participant.active ? 'Ativo' : 'Inativo'} />
      </div>
      <div className="info-grid">
        <InfoLine label="Funcao" value={participant.role} />
        <InfoLine label="Acesso" value={formatLabel(participant.accessRole)} />
      </div>
    </article>
  )
}

function ResourceCard({ resource }) {
  return (
    <article className="item-card compact-card">
      <div className="card-heading">
        <div>
          <h3>{resource.name}</h3>
          <p>{resource.description || resource.projectName || 'Sem descricao cadastrada.'}</p>
        </div>
        <StatusBadge value={resource.type} />
      </div>
      <div className="info-grid">
        <InfoLine label="Projeto" value={resource.projectName} />
        <InfoLine label="Quantidade" value={resource.quantity} />
        <InfoLine label="Custo unitario" value={formatMoney(resource.unitCost)} />
      </div>
    </article>
  )
}

function CostCard({ cost }) {
  return (
    <article className="item-card compact-card">
      <div className="card-heading">
        <div>
          <h3>{cost.description}</h3>
          <p>{cost.projectName || cost.activityTitle || 'Sem projeto vinculado.'}</p>
        </div>
        <StatusBadge value={cost.type} />
      </div>
      <div className="info-grid">
        <InfoLine label="Previsto" value={formatMoney(cost.plannedValue)} />
        <InfoLine label="Real" value={formatMoney(cost.realValue)} />
        <InfoLine label="Lancamento" value={formatDate(cost.date)} />
        <InfoLine label="Recurso" value={cost.resourceName} />
      </div>
    </article>
  )
}

function RiskCard({ risk }) {
  return (
    <article className="item-card compact-card">
      <div className="card-heading">
        <div>
          <h3>{risk.title}</h3>
          <p>{risk.description || risk.strategy || 'Sem descricao cadastrada.'}</p>
        </div>
        <StatusBadge value={risk.status} />
      </div>
      <div className="info-grid">
        <InfoLine label="Projeto" value={risk.projectName} />
        <InfoLine label="Categoria" value={formatLabel(risk.category)} />
        <InfoLine label="Probabilidade" value={risk.probability} />
        <InfoLine label="Impacto" value={risk.impact} />
        <InfoLine label="Criticidade" value={risk.criticality} />
      </div>
    </article>
  )
}

function EmptyState({ title }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <p>Quando a API retornar registros, eles aparecem aqui.</p>
    </div>
  )
}

function CollectionView({ type, dashboard }) {
  const items = dashboard[type]
  const renderers = {
    projects: ProjectCard,
    participants: ParticipantCard,
    activities: ActivityCard,
    resources: ResourceCard,
    costs: CostCard,
    risks: RiskCard,
  }
  const propNames = {
    projects: 'project',
    participants: 'participant',
    activities: 'activity',
    resources: 'resource',
    costs: 'cost',
    risks: 'risk',
  }
  const Card = renderers[type]

  if (!items.length) {
    return <EmptyState title={`Nenhum item em ${viewText[type].title.toLowerCase()}`} />
  }

  return (
    <section className="list-grid">
      {items.map((item) => (
        <Card key={item.id} {...{ [propNames[type]]: item }} />
      ))}
    </section>
  )
}

function DashboardView({ dashboard }) {
  const metrics = buildMetrics(dashboard)
  const nextActivities = dashboard.activities.slice(0, 4)
  const highlightedRisks = dashboard.risks.slice(0, 4)

  return (
    <>
      <section className="metrics-grid">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="dashboard-grid">
        <div className="section-block">
          <div className="section-heading">
            <h2>Projetos recentes</h2>
            <span>{dashboard.projects.length} registros</span>
          </div>
          <div className="stack-list">
            {dashboard.projects.length ? (
              dashboard.projects
                .slice(0, 3)
                .map((project) => <ProjectCard key={project.id} project={project} />)
            ) : (
              <EmptyState title="Nenhum projeto encontrado" />
            )}
          </div>
        </div>

        <div className="side-stack">
          <div className="section-block">
            <div className="section-heading">
              <h2>Riscos</h2>
              <span>{highlightedRisks.length}</span>
            </div>
            <div className="mini-list">
              {highlightedRisks.length ? (
                highlightedRisks.map((risk) => (
                  <div className="mini-row" key={risk.id}>
                    <div>
                      <strong>{risk.title}</strong>
                      <span>{risk.projectName || 'Sem projeto'}</span>
                    </div>
                    <StatusBadge value={risk.status} />
                  </div>
                ))
              ) : (
                <EmptyState title="Sem riscos cadastrados" />
              )}
            </div>
          </div>

          <div className="section-block">
            <div className="section-heading">
              <h2>Atividades</h2>
              <span>{nextActivities.length}</span>
            </div>
            <div className="mini-list">
              {nextActivities.length ? (
                nextActivities.map((activity) => (
                  <div className="mini-row" key={activity.id}>
                    <div>
                      <strong>{activity.title}</strong>
                      <span>{formatDate(activity.dueDate)}</span>
                    </div>
                    <StatusBadge value={activity.priority} />
                  </div>
                ))
              ) : (
                <EmptyState title="Sem atividades cadastradas" />
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function App() {
  const [activeView, setActiveView] = useState('dashboard')
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
          error instanceof Error
            ? error.message
            : 'Nao foi possivel carregar o painel.',
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
            error instanceof Error
              ? error.message
              : 'Nao foi possivel carregar o painel.',
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

  const currentView = viewText[activeView]
  const loadedAt = useMemo(
    () => (requestState.loadedAt ? formatDate(requestState.loadedAt) : '-'),
    [requestState.loadedAt],
  )

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">PM</div>
          <div>
            <strong>Project Manager</strong>
            <span>Gerenciamento de projetos</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Navegacao principal">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={activeView === item.id ? 'active' : ''}
              onClick={() => setActiveView(item.id)}
            >
              <span>{item.label}</span>
              <strong>{getCollectionCount(dashboard, item.id)}</strong>
            </button>
          ))}
        </nav>

        <div className="api-panel">
          <span>API Spring</span>
          <strong>{API_DISPLAY_URL}</strong>
          <p>{requestState.isDemo ? 'Modo demonstracao' : `Atualizado em ${loadedAt}`}</p>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <span className="eyebrow">Painel operacional</span>
            <h1>{currentView.title}</h1>
            <p>{currentView.description}</p>
          </div>
          <button type="button" onClick={refreshDashboard} disabled={requestState.loading}>
            {requestState.loading ? 'Carregando' : 'Atualizar'}
          </button>
        </header>

        {requestState.errors.length ? (
          <div className={requestState.isDemo ? 'notice warning' : 'notice'}>
            <strong>
              {requestState.isDemo
                ? 'API indisponivel, exibindo dados de exemplo.'
                : 'Algumas consultas falharam.'}
            </strong>
            <p>{requestState.errors.slice(0, 2).join(' ')}</p>
          </div>
        ) : null}

        {activeView === 'dashboard' ? (
          <DashboardView dashboard={dashboard} />
        ) : (
          <CollectionView type={activeView} dashboard={dashboard} />
        )}
      </main>
    </div>
  )
}

export default App
