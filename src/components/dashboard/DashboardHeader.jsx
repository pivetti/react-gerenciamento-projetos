import { Icon } from '../ui/Icon'

export function DashboardHeader({
  currentUser,
  description,
  isDark,
  onLogout,
  onToggleTheme,
  title,
}) {
  const userName = String(currentUser?.nome || currentUser?.name || 'Usuario')
  const userEmail = currentUser?.email || ''
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'PM'

  return (
    <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onToggleTheme}
          className="grid h-11 w-11 place-items-center rounded-2xl border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo noturno'}
        >
          <Icon name={isDark ? 'sun' : 'moon'} className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          <div className="hidden min-w-0 text-right md:block">
            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{userName}</p>
            {userEmail ? (
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{userEmail}</p>
            ) : null}
          </div>
          <div
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-zinc-200 bg-cyan-100 text-sm font-bold text-cyan-800 shadow-sm dark:border-zinc-800 dark:bg-cyan-950 dark:text-cyan-200"
            aria-label="Perfil"
            title={userName}
          >
            {initials}
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <Icon name="logout" className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </header>
  )
}
