import { Icon } from '../ui/Icon'

export function DashboardHeader({
  description,
  isDark,
  onSearchChange,
  onToggleTheme,
  searchValue,
  title,
}) {
  return (
    <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>

      <div className="flex flex-1 items-center gap-3 lg:max-w-3xl">
        <label className="relative flex-1">
          <Icon
            name="search"
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar projeto, tarefa ou comando"
            className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-16 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-[#cdbbf8] focus:ring-4 focus:ring-[#efe8ff] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-[#7c5ac4] dark:focus:ring-[#7c5ac4]/20"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-lg border border-zinc-200 px-2 py-1 text-[11px] font-medium text-zinc-400 dark:border-zinc-800 dark:text-zinc-500 sm:block">
            Ctrl F
          </span>
        </label>

        <button
          type="button"
          onClick={onToggleTheme}
          className="grid h-11 w-11 place-items-center rounded-2xl border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo noturno'}
        >
          <Icon name={isDark ? 'sun' : 'moon'} className="h-4 w-4" />
        </button>

        <button
          type="button"
          className="h-11 w-11 overflow-hidden rounded-full border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          aria-label="Perfil"
        >
          <span className="grid h-full w-full place-items-center bg-cyan-100 text-sm font-bold text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200">
            PM
          </span>
        </button>
      </div>
    </header>
  )
}
