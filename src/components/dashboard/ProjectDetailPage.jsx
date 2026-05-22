import { useMemo, useState } from 'react'
import { EntityCrudView } from '../crud/EntityCrudView'
import { entityCrudConfigs } from '../../utils/entityCrudConfig'
import {
  formatDate,
  formatLabel,
  formatMoney,
  formatPercent,
  getDaysRemaining,
} from '../../utils/format'
import { Icon } from '../ui/Icon'
import { PriorityBadge, StatusBadge } from './Badges'
import { ProgressBar } from './ProgressBar'

const tabs = [
  { id: 'overview', label: 'Visao geral', icon: 'dashboard' },
  { id: 'activities', label: 'Atividades', icon: 'activities' },
  { id: 'participants', label: 'Participantes', icon: 'participants' },
  { id: 'resources', label: 'Recursos', icon: 'resources' },
  { id: 'costs', label: 'Custos', icon: 'costs' },
  { id: 'risks', label: 'Riscos', icon: 'risks' },
]

const tabCopy = {
  activities: {
    createLabel: 'Nova atividade',
    description: 'Gerencie as tarefas vinculadas a este projeto.',
    emptyTitle: 'Nenhuma atividade cadastrada neste projeto.',
    emptyDescription: 'Crie a primeira atividade para acompanhar entregas e prazos.',
    searchPlaceholder: 'Buscar atividades...',
  },
  participants: {
    createLabel: 'Novo participante',
    description: 'Gerencie usuarios, funcoes e papeis de acesso deste projeto.',
    emptyTitle: 'Nenhum participante vinculado a este projeto.',
    emptyDescription: 'Adicione usuarios existentes da API para formar a equipe do projeto.',
    searchPlaceholder: 'Buscar participantes...',
  },
  resources: {
    createLabel: 'Novo recurso',
    description: 'Gerencie recursos humanos, materiais, tecnologicos e servicos deste projeto.',
    emptyTitle: 'Nenhum recurso cadastrado neste projeto.',
    emptyDescription: 'Cadastre os recursos necessarios para executar o projeto.',
    searchPlaceholder: 'Buscar recursos...',
  },
  costs: {
    createLabel: 'Novo custo',
    description: 'Gerencie custos previstos e realizados deste projeto.',
    emptyTitle: 'Nenhum custo lancado neste projeto.',
    emptyDescription: 'Registre custos e vincule opcionalmente atividades ou recursos do projeto.',
    searchPlaceholder: 'Buscar custos...',
  },
  risks: {
    createLabel: 'Novo risco',
    description: 'Gerencie riscos, criticidade e planos de resposta deste projeto.',
    emptyTitle: 'Nenhum risco registrado neste projeto.',
    emptyDescription: 'Registre riscos para acompanhar tratamento, impacto e probabilidade.',
    searchPlaceholder: 'Buscar riscos...',
  },
}

const tabSearchFields = {
  activities: ['title', 'titulo', 'description', 'descricao', 'responsibleName', 'status', 'priority'],
  participants: ['userName', 'nomeUsuario', 'role', 'funcaoNoProjeto', 'accessRole', 'papelAcesso'],
  resources: ['name', 'nome', 'description', 'descricao', 'type', 'tipo'],
  costs: ['description', 'descricao', 'type', 'tipo', 'activityTitle', 'resourceName'],
  risks: ['title', 'titulo', 'description', 'descricao', 'category', 'categoria', 'status'],
}

function normalizeId(value) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  return String(value)
}

function projectPayloadId(project) {
  const numericId = Number(project.id)
  return Number.isFinite(numericId) ? numericId : project.id
}

function participantUserId(participant) {
  return (
    participant.usuarioId ??
    participant.userId ??
    participant.usuario?.id ??
    participant.user?.id ??
    null
  )
}

function filterTabItems(items, search, fields) {
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

function DetailMetric({ label, value, children }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <dt className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">
        {label}
      </dt>
      <dd className="mt-2 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
        {children || value || '-'}
      </dd>
    </div>
  )
}

function recordTitle(type, item) {
  if (type === 'activities') {
    return item.title || item.titulo
  }

  if (type === 'participants') {
    return item.userName || item.nomeUsuario
  }

  if (type === 'resources') {
    return item.name || item.nome
  }

  if (type === 'costs') {
    return item.description || item.descricao
  }

  return item.title || item.titulo
}

function recordMeta(type, item) {
  if (type === 'activities') {
    return [formatLabel(item.status), formatDate(item.dueDate)].filter((value) => value !== '-').join(' - ')
  }

  if (type === 'participants') {
    return [item.role, formatLabel(item.accessRole)].filter(Boolean).join(' - ')
  }

  if (type === 'resources') {
    return [formatLabel(item.type), item.quantity ? `${item.quantity} un.` : ''].filter(Boolean).join(' - ')
  }

  if (type === 'costs') {
    return [formatMoney(item.realValue || item.plannedValue), formatDate(item.date)]
      .filter((value) => value !== '-')
      .join(' - ')
  }

  return [formatLabel(item.status), item.criticality ? `Criticidade ${item.criticality}` : '']
    .filter((value) => value && value !== '-')
    .join(' - ')
}

function buildRecentRecords(relatedItems) {
  return ['activities', 'costs', 'risks', 'resources', 'participants']
    .flatMap((type) =>
      (relatedItems[type] || []).map((item) => ({
        id: `${type}-${item.id}`,
        icon: tabs.find((tab) => tab.id === type)?.icon || 'dashboard',
        meta: recordMeta(type, item),
        title: recordTitle(type, item),
        type: tabs.find((tab) => tab.id === type)?.label || type,
      })),
    )
    .filter((record) => record.title)
    .slice(0, 5)
}

function Overview({ project, relatedItems }) {
  const objective = project.objective || project.objetivo || ''
  const activities = relatedItems.activities || []
  const costs = relatedItems.costs || []
  const participants = relatedItems.participants || []
  const risks = relatedItems.risks || []
  const completedActivities = activities.filter(
    (activity) => activity.completion >= 100 || activity.status === 'CONCLUIDA',
  ).length
  const activeParticipants = participants.filter((participant) => participant.active !== false).length
  const openRisks = risks.filter(
    (risk) => !['ENCERRADO', 'MITIGADO'].includes(String(risk.status || '')),
  ).length
  const plannedCost = costs.reduce((total, cost) => total + (cost.plannedValue || 0), 0)
  const realCost = costs.reduce((total, cost) => total + (cost.realValue || 0), 0)
  const recentRecords = buildRecentRecords(relatedItems)

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
          Resumo operacional
        </h2>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          {objective || project.description || 'Sem objetivo detalhado cadastrado.'}
        </p>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <DetailMetric
            label="Atividades concluidas"
            value={`${completedActivities} de ${activities.length}`}
          />
          <DetailMetric label="Participantes ativos" value={activeParticipants} />
          <DetailMetric label="Riscos em aberto" value={openRisks} />
          <DetailMetric label="Custos realizados" value={formatMoney(realCost || plannedCost)} />
        </dl>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
          Ultimos registros
        </h2>
        {recentRecords.length ? (
          <div className="mt-4 space-y-3">
            {recentRecords.map((record) => (
              <div
                key={record.id}
                className="flex items-start gap-3 border-t border-zinc-100 pt-3 first:border-t-0 first:pt-0 dark:border-zinc-800"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                  <Icon name={record.icon} className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                    {record.title}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {record.type}
                    {record.meta ? ` - ${record.meta}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            Ainda nao ha atividades, participantes, recursos, custos ou riscos vinculados.
          </p>
        )}
      </section>
    </div>
  )
}

function scopedConfig(type) {
  const baseConfig = entityCrudConfigs[type]
  const copy = tabCopy[type]

  if (!baseConfig) {
    return null
  }

  return {
    ...baseConfig,
    columns: baseConfig.columns.filter((column) => column.label !== 'Projeto'),
    createLabel: copy?.createLabel,
    description: copy?.description || baseConfig.description,
    emptyDescription: copy?.emptyDescription,
    emptyTitle: copy?.emptyTitle,
    fields: baseConfig.fields.filter((field) => field.name !== 'projetoId'),
  }
}

function ProjectEntityCrudTab({
  actions,
  activeTab,
  context,
  errors,
  items,
  loading,
  onRefresh,
  project,
  relatedItems,
  searchValue,
  onSearchChange,
}) {
  const config = useMemo(() => scopedConfig(activeTab), [activeTab])
  const actionSet = actions[activeTab]
  const filteredItems = useMemo(
    () => filterTabItems(items, searchValue, tabSearchFields[activeTab] || []),
    [activeTab, items, searchValue],
  )
  const scopedContext = useMemo(
    () => ({
      ...context,
      activities: relatedItems.activities || [],
      participants: relatedItems.participants || [],
      projects: [project],
      resources: relatedItems.resources || [],
    }),
    [context, project, relatedItems],
  )

  if (!config || !actionSet) {
    return null
  }

  function formContext({ item }) {
    if (activeTab !== 'participants') {
      return scopedContext
    }

    const currentItemId = normalizeId(item?.id)
    const usedUserIds = new Set(
      (relatedItems.participants || [])
        .filter((participant) => normalizeId(participant.id) !== currentItemId)
        .map((participant) => normalizeId(participantUserId(participant)))
        .filter(Boolean),
    )

    return {
      ...scopedContext,
      users: (context.users || []).filter((user) => !usedUserIds.has(normalizeId(user.id))),
    }
  }

  function ensureUniqueParticipant(payload, itemId) {
    if (activeTab !== 'participants') {
      return
    }

    const userId = normalizeId(payload.usuarioId)
    const duplicate = (relatedItems.participants || []).some(
      (participant) =>
        normalizeId(participant.id) !== normalizeId(itemId) &&
        normalizeId(participantUserId(participant)) === userId,
    )

    if (duplicate) {
      throw new Error('Este usuario ja esta vinculado a este projeto.')
    }
  }

  function withProject(payload) {
    return {
      ...payload,
      projetoId: projectPayloadId(project),
    }
  }

  async function handleCreate(payload) {
    ensureUniqueParticipant(payload, null)
    await actionSet.create(withProject(payload))
  }

  async function handleUpdate(id, payload) {
    ensureUniqueParticipant(payload, id)
    await actionSet.update(id, withProject(payload))
  }

  return (
    <EntityCrudView
      config={config}
      context={scopedContext}
      errors={errors}
      getFormContext={formContext}
      items={filteredItems}
      loading={loading}
      onCreate={handleCreate}
      onDelete={actionSet.delete}
      onRefresh={onRefresh}
      onSearchChange={onSearchChange}
      onUpdate={handleUpdate}
      searchPlaceholder={tabCopy[activeTab]?.searchPlaceholder || 'Buscar...'}
      searchValue={searchValue}
      showSearch={items.length > 0 || Boolean(searchValue)}
    />
  )
}

export function ProjectDetailPage({
  actions,
  context,
  errors,
  loading,
  onBack,
  onDeleteProject,
  onEditProject,
  onRefresh,
  project,
  relatedItems,
}) {
  const [activeTab, setActiveTab] = useState('overview')
  const [actionsOpen, setActionsOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')
  const [tabSearches, setTabSearches] = useState({})

  const tabCounts = useMemo(
    () =>
      tabs.reduce((counts, tab) => {
        counts[tab.id] = tab.id === 'overview' ? null : relatedItems[tab.id]?.length || 0
        return counts
      }, {}),
    [relatedItems],
  )

  async function handleDeleteProject() {
    if (!window.confirm(`Excluir ${project.name}?`)) {
      return
    }

    setActionError('')
    setActionLoading(true)

    try {
      await onDeleteProject(project)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Nao foi possivel excluir o projeto.')
      setActionLoading(false)
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <Icon name="arrowLeft" className="h-4 w-4" />
          Voltar para projetos
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setActionsOpen((current) => !current)}
            disabled={actionLoading}
            className="grid h-10 w-10 place-items-center rounded-xl border border-zinc-200 bg-white text-lg font-bold leading-none text-zinc-700 shadow-sm transition hover:bg-zinc-50 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            aria-expanded={actionsOpen}
            aria-label="Acoes do projeto"
          >
            ...
          </button>
          {actionsOpen ? (
            <div className="absolute right-0 top-12 z-20 w-48 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-1 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
              <button
                type="button"
                onClick={() => {
                  setActionsOpen(false)
                  onEditProject(project)
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Editar projeto
              </button>
              <button
                type="button"
                onClick={() => {
                  setActionsOpen(false)
                  handleDeleteProject()
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"
              >
                Excluir projeto
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {actionError ? (
        <div
          className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-100"
          role="alert"
        >
          {actionError}
        </div>
      ) : null}

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge value={project.status} />
              <PriorityBadge value={project.priority} />
            </div>
            <p className="mt-16 max-w-3xl text-sm leading-6 text-zinc-950 dark:text-zinc-50">
              {project.description || project.objective || project.objetivo || 'Sem descricao cadastrada.'}
            </p>
          </div>

          <div className="min-w-56 space-y-2 rounded-2xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">Prazo</span>
              <strong className="text-right font-semibold text-zinc-950 dark:text-zinc-50">
                {getDaysRemaining(project.endDate)}
              </strong>
            </div>
            <ProgressBar value={project.completion} />
            <div className="flex items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
              <span>{formatPercent(project.completion)}</span>
              <span>{formatMoney(project.budget)}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="overflow-x-auto">
        <div className="inline-flex min-w-full gap-2 rounded-2xl border border-zinc-200 bg-white p-1 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:min-w-0">
          {tabs.map((tab) => {
            const active = activeTab === tab.id

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 text-sm font-semibold transition ${
                  active
                    ? 'bg-[#efe8ff] text-[#3f2a64] dark:bg-[#34254f] dark:text-[#f0eaff]'
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50'
                }`}
              >
                <Icon name={tab.icon} className="h-4 w-4" />
                {tab.label}
                {tabCounts[tab.id] !== null ? (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] ${
                      active
                        ? 'bg-white/80 text-[#5d428e] dark:bg-[#221936] dark:text-[#e6dcff]'
                        : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}
                  >
                    {tabCounts[tab.id]}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>

      {activeTab === 'overview' ? (
        <Overview project={project} relatedItems={relatedItems} />
      ) : (
        <ProjectEntityCrudTab
          actions={actions}
          activeTab={activeTab}
          context={context}
          errors={errors}
          items={relatedItems[activeTab] || []}
          loading={loading}
          onSearchChange={(value) =>
            setTabSearches((current) => ({ ...current, [activeTab]: value }))
          }
          onRefresh={onRefresh}
          project={project}
          relatedItems={relatedItems}
          searchValue={tabSearches[activeTab] || ''}
        />
      )}
    </section>
  )
}
