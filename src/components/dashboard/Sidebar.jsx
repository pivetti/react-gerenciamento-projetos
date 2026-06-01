import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Icon } from '../ui/Icon'

export function Sidebar({
  activeView,
  navItems,
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <aside className="sticky top-0 z-40 border-b border-zinc-200 bg-white transition-colors dark:border-zinc-800 dark:bg-zinc-950 lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:w-64 lg:border-b-0 lg:border-r">
      <div className="relative lg:flex lg:min-h-full lg:flex-col lg:px-5 lg:py-6">
        <div className="flex items-center justify-between gap-3 px-4 py-3 lg:hidden">
          <div className="min-w-0">
            <div className="projecthub-brand truncate text-2xl tracking-tight text-zinc-950 dark:text-zinc-50">
              ProjectHub.
            </div>
            <p className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">Gerenciamento de projetos</p>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            aria-controls="mobile-main-menu"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} className="h-5 w-5" />
          </button>
        </div>

        <div
          id="mobile-main-menu"
          className={`absolute inset-x-0 top-full max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950 lg:static lg:flex lg:max-h-none lg:flex-1 lg:flex-col lg:overflow-visible lg:border-t-0 lg:bg-transparent lg:shadow-none ${
            menuOpen ? 'block' : 'hidden'
          }`}
        >
          <div className="hidden lg:mb-9 lg:block">
            <div className="projecthub-brand text-2xl tracking-tight text-zinc-950 dark:text-zinc-50">
              ProjectHub.
            </div>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Gerenciamento de projetos</p>
          </div>

          <div className="px-4 pt-4 text-xs font-medium text-zinc-400 dark:text-zinc-500 lg:mb-3 lg:px-2 lg:pt-0">Menu</div>
          <nav
            className="grid gap-1 px-4 py-3 lg:block lg:space-y-1 lg:px-0 lg:py-0"
            aria-label="Navegacao principal"
          >
            {navItems.map((item) => {
              const active = activeView === item.id

              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? 'bg-[#efe8ff] text-[#3f2a64] shadow-sm dark:bg-[#34254f] dark:text-[#f0eaff]'
                      : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon name={item.icon} className="h-4 w-4" />
                  <span className="flex-1 truncate text-left">{item.label}</span>
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
                </NavLink>
              )
            })}
          </nav>

          <div className="mt-auto hidden space-y-5 pt-8 lg:block">
            <div className="rounded-2xl border border-[#eadfff] bg-gradient-to-br from-[#fff8ec] to-[#f3edff] p-4 shadow-sm dark:border-[#3b2a5c] dark:from-zinc-900 dark:to-[#2b1d45]">
              <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">Gerencie melhor seus projetos</p>
              <p className="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                Acompanhe prazos, custos e riscos em um unico painel.
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
