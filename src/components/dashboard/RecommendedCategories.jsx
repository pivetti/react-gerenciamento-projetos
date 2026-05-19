import { Icon } from '../ui/Icon'

const iconTone = {
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
  sky: 'bg-sky-50 text-sky-600',
  violet: 'bg-[#f1eaff] text-[#7553b7] dark:bg-[#34254f] dark:text-[#dfd2ff]',
  emerald: 'bg-emerald-50 text-emerald-600',
  cyan: 'bg-cyan-50 text-cyan-600',
  orange: 'bg-orange-50 text-orange-600',
  zinc: 'bg-zinc-100 text-zinc-600',
}

export function RecommendedCategories({ categories, onSelect }) {
  return (
    <section className="rounded-3xl bg-white/70 p-4 shadow-sm ring-1 ring-zinc-200/70 transition-colors dark:bg-zinc-900/70 dark:ring-zinc-800 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">Categorias recomendadas</h2>
        <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">{categories.length} atalhos</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {categories.map((category) => (
          <button
            key={category.label}
            type="button"
            onClick={() => onSelect(category.view)}
            className="group flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/70"
          >
            <span
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${iconTone[category.tone]}`}
            >
              <Icon name={category.icon} className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-zinc-950 dark:text-zinc-50">{category.label}</span>
              <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">{category.hint}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
