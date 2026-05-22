import { useMemo, useState } from 'react'
import { formatDate, formatLabel, formatMoney, getDaysRemaining } from '../../utils/format'
import { Icon } from '../ui/Icon'
import { PriorityBadge, StatusBadge } from './Badges'
import { ProgressBar } from './ProgressBar'

const severityClass = {
  baixo:
    'bg-zinc-100 text-zinc-700 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700',
  medio:
    'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:ring-amber-900',
  alto:
    'bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-950/50 dark:text-orange-200 dark:ring-orange-900',
  critico:
    'bg-rose-100 text-rose-800 ring-rose-200 dark:bg-rose-950/60 dark:text-rose-200 dark:ring-rose-900',
}

function normalizeComparable(value) {
  return String(value || '').trim().toLowerCase()
}

function relatedProjectId(item) {
  const value = item.projetoId ?? item.projectId ?? item.projeto?.id ?? item.project?.id

  if (value === null || value === undefined || value === '') {
    return null
  }

  return String(value)
}

function relatedProjectName(item) {
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
  const itemProjectId = relatedProjectId(item)

  if (projectId && itemProjectId) {
    return itemProjectId === projectId
  }

  return normalizeComparable(relatedProjectName(item)) === normalizeComparable(project?.name)
}

function filterByProject(items, project) {
  return items.filter((item) => belongsToProject(item, project))
}

function isProjectCritical(project) {
  return String(project.priority || project.prioridade || '').toUpperCase() === 'CRITICA'
}

function isProjectInProgress(project) {
  return String(project.status || '').toUpperCase() === 'EM_ANDAMENTO'
}

function isProjectCompleted(project) {
  return String(project.status || '').toUpperCase() === 'CONCLUIDO' || project.completion >= 100
}

function isActivityLate(activity) {
  if (!activity.dueDate && !activity.prazo) {
    return false
  }

  if (['CONCLUIDA', 'CANCELADA'].includes(String(activity.status || '').toUpperCase())) {
    return false
  }

  const dueDate = new Date(activity.dueDate || activity.prazo)

  if (Number.isNaN(dueDate.getTime())) {
    return false
  }

  const today = new Date()
  return dueDate.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0)
}

function riskLevel(risk) {
  const criticality = Number(risk.criticality ?? risk.criticidade ?? 0)

  if (criticality >= 20) return 'critico'
  if (criticality >= 13) return 'alto'
  if (criticality >= 6) return 'medio'
  return 'baixo'
}

function sum(items, field) {
  return items.reduce((total, item) => total + (Number(item[field]) || 0), 0)
}

function groupCount(items, getKey) {
  return items.reduce((groups, item) => {
    const key = getKey(item) || 'Sem status'
    groups[key] = (groups[key] || 0) + 1
    return groups
  }, {})
}

function MetricCard({ icon, label, value }) {
  return (
    <article className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">
            {label}
          </p>
          <p className="mt-3 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">{value}</p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#efe8ff] text-[#5d428e] dark:bg-[#34254f] dark:text-[#e6dcff]">
          <Icon name={icon} className="h-4 w-4" />
        </span>
      </div>
    </article>
  )
}

function EmptyState({ children }) {
  return (
    <div className="rounded-3xl border border-dashed border-zinc-200 bg-white px-6 py-12 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
      {children}
    </div>
  )
}

function FilterSelect({ label, onChange, options, value }) {
  return (
    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-[#cdbbf8] focus:ring-4 focus:ring-[#efe8ff] dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-[#7c5ac4] dark:focus:ring-[#7c5ac4]/20"
      >
        <option value="">Todos</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {formatLabel(option)}
          </option>
        ))}
      </select>
    </label>
  )
}

function buildProjectStats(project, dashboard) {
  const activities = filterByProject(dashboard.activities, project)
  const risks = filterByProject(dashboard.risks, project)
  const participants = filterByProject(dashboard.participants, project)
  const costs = filterByProject(dashboard.costs, project)
  const plannedCost = sum(costs, 'plannedValue')
  const realCost = sum(costs, 'realValue')

  return {
    activities,
    costs,
    participants,
    plannedCost,
    realCost,
    risks,
  }
}

function buildAlerts(projectStats, lateActivities, highRisks) {
  const alerts = []

  projectStats.forEach(({ activities, participants, plannedCost, project, realCost, risks }) => {
    if (isProjectCritical(project)) {
      alerts.push({
        description: 'Projeto marcado com prioridade critica.',
        project,
        severity: 'critico',
        title: project.name,
      })
    }

    if (!participants.length) {
      alerts.push({
        description: 'Projeto ainda nao possui participantes vinculados.',
        project,
        severity: 'medio',
        title: `${project.name}: sem participantes`,
      })
    }

    if (!activities.length) {
      alerts.push({
        description: 'Projeto ainda nao possui atividades cadastradas.',
        project,
        severity: 'medio',
        title: `${project.name}: sem atividades`,
      })
    }

    const comparablePlanned = plannedCost || project.budget || 0

    if (comparablePlanned > 0 && realCost > comparablePlanned) {
      alerts.push({
        description: `${formatMoney(realCost)} realizados contra ${formatMoney(comparablePlanned)} previstos.`,
        project,
        severity: 'alto',
        title: `${project.name}: custo acima do previsto`,
      })
    }

    if (risks.some((risk) => riskLevel(risk) === 'critico')) {
      alerts.push({
        description: 'Projeto possui risco com criticidade critica.',
        project,
        severity: 'critico',
        title: `${project.name}: risco critico`,
      })
    }
  })

  lateActivities.forEach(({ activity, project }) => {
    alerts.push({
      description: `${activity.title || activity.titulo} venceu em ${formatDate(activity.dueDate || activity.prazo)}.`,
      project,
      severity: 'alto',
      title: 'Atividade atrasada',
    })
  })

  highRisks.forEach(({ project, risk }) => {
    alerts.push({
      description: `${risk.title || risk.titulo} com criticidade ${risk.criticality ?? risk.criticidade}.`,
      project,
      severity: riskLevel(risk) === 'critico' ? 'critico' : 'alto',
      title: 'Risco de alta criticidade',
    })
  })

  return alerts
}

function Section({ children, title }) {
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}

export function IndicatorsPage({
  dashboard,
  errors,
  loading,
  onBack,
  onOpenProject,
}) {
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')

  const statusOptions = useMemo(
    () => [...new Set(dashboard.projects.map((project) => project.status).filter(Boolean))],
    [dashboard.projects],
  )
  const priorityOptions = useMemo(
    () => [...new Set(dashboard.projects.map((project) => project.priority).filter(Boolean))],
    [dashboard.projects],
  )

  const filteredProjects = useMemo(
    () =>
      dashboard.projects.filter((project) => {
        const matchesStatus = !statusFilter || project.status === statusFilter
        const matchesPriority = !priorityFilter || project.priority === priorityFilter
        return matchesStatus && matchesPriority
      }),
    [dashboard.projects, priorityFilter, statusFilter],
  )

  const projectStats = useMemo(
    () =>
      filteredProjects.map((project) => ({
        project,
        ...buildProjectStats(project, dashboard),
      })),
    [dashboard, filteredProjects],
  )

  const filteredActivities = projectStats.flatMap((stats) =>
    stats.activities.map((activity) => ({ activity, project: stats.project })),
  )
  const filteredRisks = projectStats.flatMap((stats) =>
    stats.risks.map((risk) => ({ project: stats.project, risk })),
  )
  const filteredParticipants = projectStats.flatMap((stats) => stats.participants)
  const filteredCosts = projectStats.flatMap((stats) => stats.costs)
  const lateActivities = filteredActivities.filter(({ activity }) => isActivityLate(activity))
  const highRisks = filteredRisks.filter(({ risk }) => ['alto', 'critico'].includes(riskLevel(risk)))
  const criticalRisks = filteredRisks.filter(({ risk }) => riskLevel(risk) === 'critico')
  const totalPlannedCost = sum(filteredCosts, 'plannedValue')
  const totalRealCost = sum(filteredCosts, 'realValue')
  const alerts = buildAlerts(projectStats, lateActivities, highRisks)
  const risksByStatus = groupCount(filteredRisks.map(({ risk }) => risk), (risk) => formatLabel(risk.status))
  const risksByCriticality = groupCount(filteredRisks.map(({ risk }) => risk), riskLevel)
  const projectsByRealCost = [...projectStats]
    .sort((a, b) => b.realCost - a.realCost)
    .filter((item) => item.realCost > 0)
    .slice(0, 5)
  const projectsByRisks = [...projectStats]
    .sort((a, b) => b.risks.length - a.risks.length)
    .filter((item) => item.risks.length > 0)
    .slice(0, 5)

  const metrics = [
    ['Total de projetos', filteredProjects.length, 'projects'],
    ['Projetos em andamento', filteredProjects.filter(isProjectInProgress).length, 'activities'],
    ['Projetos concluidos', filteredProjects.filter(isProjectCompleted).length, 'dashboard'],
    ['Projetos criticos', filteredProjects.filter(isProjectCritical).length, 'risks'],
    ['Total de atividades', filteredActivities.length, 'activities'],
    ['Atividades atrasadas', lateActivities.length, 'activities'],
    ['Total de participantes', filteredParticipants.length, 'participants'],
    ['Total de riscos', filteredRisks.length, 'risks'],
    ['Riscos criticos', criticalRisks.length, 'risks'],
    ['Custo previsto total', totalPlannedCost ? formatMoney(totalPlannedCost) : '-', 'costs'],
    ['Custo real total', totalRealCost ? formatMoney(totalRealCost) : '-', 'costs'],
  ]

  if (loading) {
    return (
      <section className="rounded-3xl border border-zinc-200 bg-white px-6 py-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">Carregando indicadores...</p>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Consultando dados da API.</p>
      </section>
    )
  }

  if (!dashboard.projects.length) {
    return (
      <div className="space-y-5">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <Icon name="arrowLeft" className="h-4 w-4" />
          Voltar ao Dashboard
        </button>
        <EmptyState>Nenhum projeto carregado para calcular indicadores.</EmptyState>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <Icon name="arrowLeft" className="h-4 w-4" />
            Voltar ao Dashboard
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-96">
          <FilterSelect
            label="Status"
            onChange={setStatusFilter}
            options={statusOptions}
            value={statusFilter}
          />
          <FilterSelect
            label="Prioridade"
            onChange={setPriorityFilter}
            options={priorityOptions}
            value={priorityFilter}
          />
        </div>
      </div>

      {errors.length ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
          {errors.slice(0, 2).join(' ')}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value, icon]) => (
          <MetricCard key={label} icon={icon} label={label} value={value} />
        ))}
      </section>

      <Section title="Saude dos projetos">
        {projectStats.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.12em] text-zinc-400">
                <tr>
                  <th className="px-3 py-3 font-semibold">Projeto</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 font-semibold">Prioridade</th>
                  <th className="px-3 py-3 font-semibold">Progresso</th>
                  <th className="px-3 py-3 font-semibold">Prazo</th>
                  <th className="px-3 py-3 font-semibold">Orcamento</th>
                  <th className="px-3 py-3 font-semibold">Custo real</th>
                  <th className="px-3 py-3 font-semibold">Atividades</th>
                  <th className="px-3 py-3 font-semibold">Riscos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {projectStats.map(({ activities, project, realCost, risks }) => (
                  <tr key={project.id} className="align-middle">
                    <td className="px-3 py-4">
                      <button
                        type="button"
                        onClick={() => onOpenProject(project)}
                        className="font-semibold text-zinc-950 underline-offset-4 transition hover:text-[#5d428e] hover:underline dark:text-zinc-50 dark:hover:text-[#e6dcff]"
                      >
                        {project.name}
                      </button>
                    </td>
                    <td className="px-3 py-4"><StatusBadge value={project.status} /></td>
                    <td className="px-3 py-4"><PriorityBadge value={project.priority} /></td>
                    <td className="min-w-32 px-3 py-4">
                      <ProgressBar value={project.completion} />
                    </td>
                    <td className="px-3 py-4 text-zinc-600 dark:text-zinc-300">
                      {getDaysRemaining(project.endDate)}
                    </td>
                    <td className="px-3 py-4 text-zinc-600 dark:text-zinc-300">
                      {formatMoney(project.budget)}
                    </td>
                    <td className="px-3 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                      {realCost ? formatMoney(realCost) : '-'}
                    </td>
                    <td className="px-3 py-4 text-zinc-600 dark:text-zinc-300">{activities.length}</td>
                    <td className="px-3 py-4 text-zinc-600 dark:text-zinc-300">{risks.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState>Nenhum projeto encontrado com os filtros selecionados.</EmptyState>
        )}
      </Section>

      <Section title="Alertas">
        {alerts.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {alerts.slice(0, 12).map((alert, index) => (
              <article
                key={`${alert.title}-${index}`}
                className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${severityClass[alert.severity]}`}>
                      {alert.severity}
                    </span>
                    <h3 className="mt-3 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                      {alert.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                      {alert.description}
                    </p>
                  </div>
                  {alert.project ? (
                    <button
                      type="button"
                      onClick={() => onOpenProject(alert.project)}
                      className="shrink-0 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                      Abrir
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState>Nenhum alerta encontrado com os dados atuais.</EmptyState>
        )}
      </Section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Section title="Custos">
          {filteredCosts.length ? (
            <div className="space-y-5">
              <dl className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-zinc-200 px-4 py-3 dark:border-zinc-800">
                  <dt className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-400">
                    Previsto
                  </dt>
                  <dd className="mt-2 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                    {formatMoney(totalPlannedCost)}
                  </dd>
                </div>
                <div className="rounded-2xl border border-zinc-200 px-4 py-3 dark:border-zinc-800">
                  <dt className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-400">
                    Real
                  </dt>
                  <dd className="mt-2 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                    {formatMoney(totalRealCost)}
                  </dd>
                </div>
                <div className="rounded-2xl border border-zinc-200 px-4 py-3 dark:border-zinc-800">
                  <dt className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-400">
                    Diferenca
                  </dt>
                  <dd className="mt-2 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                    {formatMoney(totalRealCost - totalPlannedCost)}
                  </dd>
                </div>
              </dl>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                  Projetos com maior custo real
                </h3>
                {projectsByRealCost.length ? (
                  projectsByRealCost.map(({ project, realCost }) => (
                    <div key={project.id} className="flex justify-between gap-4 border-t border-zinc-100 pt-2 text-sm dark:border-zinc-800">
                      <span className="text-zinc-600 dark:text-zinc-300">{project.name}</span>
                      <strong className="text-zinc-950 dark:text-zinc-50">{formatMoney(realCost)}</strong>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Nenhum custo real informado ainda.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <EmptyState>Nenhum custo lancado ainda.</EmptyState>
          )}
        </Section>

        <Section title="Riscos">
          {filteredRisks.length ? (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                    Riscos por status
                  </h3>
                  <div className="mt-3 space-y-2">
                    {Object.entries(risksByStatus).map(([status, count]) => (
                      <div key={status} className="flex justify-between gap-4 text-sm">
                        <span className="text-zinc-600 dark:text-zinc-300">{status}</span>
                        <strong className="text-zinc-950 dark:text-zinc-50">{count}</strong>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                    Riscos por criticidade
                  </h3>
                  <div className="mt-3 space-y-2">
                    {Object.entries(risksByCriticality).map(([level, count]) => (
                      <div key={level} className="flex justify-between gap-4 text-sm">
                        <span className="capitalize text-zinc-600 dark:text-zinc-300">{level}</span>
                        <strong className="text-zinc-950 dark:text-zinc-50">{count}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                  Projetos com mais riscos
                </h3>
                {projectsByRisks.map(({ project, risks }) => (
                  <div key={project.id} className="flex justify-between gap-4 border-t border-zinc-100 pt-2 text-sm dark:border-zinc-800">
                    <span className="text-zinc-600 dark:text-zinc-300">{project.name}</span>
                    <strong className="text-zinc-950 dark:text-zinc-50">{risks.length}</strong>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState>Nenhum risco registrado ainda.</EmptyState>
          )}
        </Section>
      </div>
    </div>
  )
}
