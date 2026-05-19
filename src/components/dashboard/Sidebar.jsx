import { Icon } from '../ui/Icon'

export function Sidebar({
  activeView,
  navItems,
  onNavigate,
}) {
  return (
    <aside className="border-zinc-200 bg-white transition-colors dark:border-zinc-800 dark:bg-zinc-950 lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:w-64 lg:border-r">
      <div className="flex min-h-full flex-col px-5 py-6">
        <div className="mb-9">
          <div className="projecthub-brand text-2xl tracking-tight text-zinc-950 dark:text-zinc-50">
            ProjectHub.
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Gerenciamento de projetos</p>
        </div>

        <div className="mb-3 px-2 text-xs font-medium text-zinc-400 dark:text-zinc-500">Menu</div>
        <nav className="space-y-1" aria-label="Navegacao principal">
          {navItems.map((item) => {
            const active = activeView === item.id

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? 'bg-[#efe8ff] text-[#3f2a64] shadow-sm dark:bg-[#34254f] dark:text-[#f0eaff]'
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50'
                }`}
              >
                <Icon name={item.icon} className="h-4 w-4" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.count !== undefined ? (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] ${
                      active
                        ? 'bg-white/80 text-[#5d428e] dark:bg-[#221936] dark:text-[#e6dcff]'
                        : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400'
                    }`}
                  >
                    {item.count}
                  </span>
                ) : null}
              </button>
            )
          })}
        </nav>

        <div className="mt-auto space-y-5 pt-8">
          <div className="rounded-2xl border border-[#eadfff] bg-gradient-to-br from-[#fff8ec] to-[#f3edff] p-4 shadow-sm dark:border-[#3b2a5c] dark:from-zinc-900 dark:to-[#2b1d45]">
            <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">Gerencie melhor seus projetos</p>
            <p className="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
              Acompanhe prazos, custos e riscos em um unico painel.
            </p>
          </div>

          <div className="space-y-1 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => onNavigate('settings')}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
            >
              <Icon name="settings" className="h-4 w-4" />
              Configuracoes
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
            >
              <Icon name="help" className="h-4 w-4" />
              Ajuda
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
