import { Icon } from '../ui/Icon'
import { ProjectRow } from './ProjectRow'

export function ProjectSection({ getCounters, projects, showAddRow = false, title }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
          {title}
        </h2>
        <button
          type="button"
          className="grid h-7 w-7 place-items-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
          aria-label={`Opcoes de ${title}`}
        >
          <Icon name="more" className="h-4 w-4" />
        </button>
      </div>

      {projects.length ? (
        <div className="space-y-3">
          {projects.map((project) => (
            <ProjectRow key={project.id} counters={getCounters(project)} project={project} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white/60 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
          Nenhum projeto nesta secao.
        </div>
      )}

      {showAddRow ? (
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-300 bg-white/50 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-white dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          <Icon name="plus" className="h-4 w-4" />
          Adicionar novo projeto
        </button>
      ) : null}
    </section>
  )
}
