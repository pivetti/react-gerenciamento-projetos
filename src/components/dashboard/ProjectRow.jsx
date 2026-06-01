import { Icon } from '../ui/Icon'
import { PriorityBadge, StatusBadge } from './Badges'
import { ProgressBar } from './ProgressBar'
import { formatMoney, getDaysRemaining } from '../../utils/format'

export function ProjectRow({ counters, project }) {
  return (
    <article className="grid gap-4 rounded-2xl border border-zinc-100 bg-white px-4 py-4 shadow-sm transition hover:border-zinc-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 lg:grid-cols-[minmax(240px,1fr)_auto_auto_auto_auto] lg:items-center">
      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold text-zinc-950 dark:text-zinc-50">{project.name}</h3>
        <p className="mt-1 line-clamp-1 text-xs text-zinc-500 dark:text-zinc-400">
          {project.description || project.objective || 'Sem descricao cadastrada.'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 dark:border-zinc-800 dark:bg-zinc-950">
          <Icon name="activities" className="h-3.5 w-3.5" />
          {counters.activities}
        </span>
        <span className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 dark:border-zinc-800 dark:bg-zinc-950">
          <Icon name="participants" className="h-3.5 w-3.5" />
          {counters.participants}
        </span>
        <span className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 dark:border-zinc-800 dark:bg-zinc-950">
          <Icon name="risks" className="h-3.5 w-3.5" />
          {counters.risks}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge value={project.status} />
        <PriorityBadge value={project.priority} />
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 lg:justify-end">
        <span>{getDaysRemaining(project.endDate)}</span>
        <span>{formatMoney(project.budget)}</span>
      </div>

      <div className="flex w-full items-center gap-4 lg:min-w-32">
        <ProgressBar value={project.completion} />
      </div>
    </article>
  )
}
