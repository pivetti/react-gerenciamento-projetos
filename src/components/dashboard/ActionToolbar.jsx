import { useEffect, useRef } from 'react'
import { Icon } from '../ui/Icon'
import { sortOptions } from '../../utils/projectFilters'

const statusOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'PLANEJADO', label: 'Planejado' },
  { value: 'EM_ANDAMENTO', label: 'Em andamento' },
  { value: 'CONCLUIDO', label: 'Concluido' },
]

const priorityOptions = [
  { value: 'all', label: 'Todas' },
  { value: 'BAIXA', label: 'Baixa' },
  { value: 'MEDIA', label: 'Media' },
  { value: 'ALTA', label: 'Alta' },
  { value: 'CRITICA', label: 'Critica' },
]

const sectionOptions = [
  { key: 'categories', label: 'Categorias recomendadas' },
  { key: 'todo', label: 'Secao TODO' },
  { key: 'active', label: 'Projetos ativos' },
  { key: 'completed', label: 'Concluidos' },
]

function ToolbarButton({ active = false, children, icon, menuId, onClick }) {
  return (
    <button
      type="button"
      aria-expanded={menuId ? active : undefined}
      aria-haspopup={menuId ? 'menu' : undefined}
      aria-controls={menuId}
      onClick={onClick}
      className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-medium shadow-sm transition ${
        active
          ? 'border-zinc-300 bg-zinc-950 text-white dark:border-zinc-700 dark:bg-white dark:text-zinc-950'
          : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800'
      }`}
    >
      <Icon name={icon} className="h-4 w-4" />
      {children}
    </button>
  )
}

function MenuPanel({ children, id, wide = false }) {
  return (
    <div
      id={id}
      role="menu"
      className={`absolute left-0 top-12 z-30 rounded-2xl border border-zinc-200 bg-white p-3 text-sm text-zinc-700 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 ${
        wide ? 'w-80' : 'w-72'
      }`}
    >
      {children}
    </div>
  )
}

function MenuGroup({ children, title }) {
  return (
    <div className="space-y-2">
      <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
        {title}
      </p>
      {children}
    </div>
  )
}

function OptionButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition ${
        active
          ? 'bg-zinc-950 font-semibold text-white dark:bg-white dark:text-zinc-950'
          : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
      }`}
    >
      <span>{children}</span>
      {active ? <span aria-hidden="true">•</span> : null}
    </button>
  )
}

function ToggleRow({ checked, children, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl px-3 py-2 transition hover:bg-zinc-100 dark:hover:bg-zinc-800">
      <span>{children}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-zinc-950 dark:accent-white"
      />
    </label>
  )
}

function ActionRow({ children, onClick }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
    >
      {children}
    </button>
  )
}

function SummaryGrid({ summary }) {
  const items = [
    ['Projetos', summary.projects],
    ['Atividades', summary.activities],
    ['Participantes', summary.participants],
    ['Riscos', summary.risks],
    ['Custos', summary.costs],
    ['Recursos', summary.resources],
  ]

  return (
    <div className="grid grid-cols-2 gap-2 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950">
      {items.map(([label, value]) => (
        <div key={label} className="flex items-center justify-between gap-2 text-xs">
          <span className="text-zinc-500 dark:text-zinc-400">{label}</span>
          <strong className="font-semibold text-zinc-900 dark:text-zinc-100">{value}</strong>
        </div>
      ))}
    </div>
  )
}

export function ActionToolbar({
  activeMenu,
  filters,
  filtersActive,
  hiddenSections,
  loading,
  onClearFilters,
  onClearToolbarState,
  onFilterChange,
  onMenuChange,
  onNewProject,
  onRefresh,
  onRestoreView,
  onSortChange,
  onToggleSection,
  sortLabel,
  sortOption,
  summary,
  viewChanged,
}) {
  const toolbarRef = useRef(null)
  const sortActive = sortOption !== 'none'

  useEffect(() => {
    function handlePointerDown(event) {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target)) {
        onMenuChange(null)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [onMenuChange])

  function toggleMenu(menu) {
    onMenuChange(activeMenu === menu ? null : menu)
  }

  function runAndClose(action) {
    action()
    onMenuChange(null)
  }

  return (
    <div ref={toolbarRef} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <ToolbarButton
            active={activeMenu === 'filter' || filtersActive}
            icon="filter"
            menuId="filter-menu"
            onClick={() => toggleMenu('filter')}
          >
            Filtrar
            {filtersActive ? (
              <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-100">
                ativo
              </span>
            ) : null}
          </ToolbarButton>
          {activeMenu === 'filter' ? (
            <MenuPanel id="filter-menu">
              <div className="space-y-4">
                <MenuGroup title="Status">
                  <div className="grid gap-1">
                    {statusOptions.map((option) => (
                      <OptionButton
                        key={option.value}
                        active={filters.status === option.value}
                        onClick={() => onFilterChange('status', option.value)}
                      >
                        {option.label}
                      </OptionButton>
                    ))}
                  </div>
                </MenuGroup>
                <MenuGroup title="Prioridade">
                  <div className="grid gap-1">
                    {priorityOptions.map((option) => (
                      <OptionButton
                        key={option.value}
                        active={filters.priority === option.value}
                        onClick={() => onFilterChange('priority', option.value)}
                      >
                        {option.label}
                      </OptionButton>
                    ))}
                  </div>
                </MenuGroup>
                <MenuGroup title="Rapidos">
                  <ToggleRow
                    checked={filters.overdue}
                    onChange={(event) => onFilterChange('overdue', event.target.checked)}
                  >
                    Projetos atrasados
                  </ToggleRow>
                  <ToggleRow
                    checked={filters.noProgress}
                    onChange={(event) => onFilterChange('noProgress', event.target.checked)}
                  >
                    Sem progresso
                  </ToggleRow>
                </MenuGroup>
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="h-9 w-full rounded-xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Limpar filtros
                </button>
              </div>
            </MenuPanel>
          ) : null}
        </div>

        <div className="relative">
          <ToolbarButton
            active={activeMenu === 'sort' || sortActive}
            icon="sort"
            menuId="sort-menu"
            onClick={() => toggleMenu('sort')}
          >
            Ordenar
            {sortActive ? (
              <span className="rounded-full bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-sky-900/60 dark:text-sky-100">
                ativo
              </span>
            ) : null}
          </ToolbarButton>
          {activeMenu === 'sort' ? (
            <MenuPanel id="sort-menu" wide>
              <div className="space-y-3">
                <p className="px-1 text-xs text-zinc-500 dark:text-zinc-400">Atual: {sortLabel}</p>
                <div className="grid gap-1">
                  {sortOptions.map((option) => (
                    <OptionButton
                      key={option.value}
                      active={sortOption === option.value}
                      onClick={() => runAndClose(() => onSortChange(option.value))}
                    >
                      {option.label}
                    </OptionButton>
                  ))}
                </div>
              </div>
            </MenuPanel>
          ) : null}
        </div>

        <div className="relative">
          <ToolbarButton
            active={activeMenu === 'hide' || viewChanged}
            icon="hide"
            menuId="hide-menu"
            onClick={() => toggleMenu('hide')}
          >
            Ocultar
            {viewChanged ? (
              <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/60 dark:text-amber-100">
                ativo
              </span>
            ) : null}
          </ToolbarButton>
          {activeMenu === 'hide' ? (
            <MenuPanel id="hide-menu" wide>
              <div className="space-y-3">
                {sectionOptions.map((option) => (
                  <ToggleRow
                    key={option.key}
                    checked={!hiddenSections[option.key]}
                    onChange={() => onToggleSection(option.key)}
                  >
                    {option.label}
                  </ToggleRow>
                ))}
                <button
                  type="button"
                  onClick={onRestoreView}
                  className="h-9 w-full rounded-xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Restaurar visualizacao
                </button>
              </div>
            </MenuPanel>
          ) : null}
        </div>

        <div className="relative">
          <ToolbarButton
            active={activeMenu === 'more'}
            icon="more"
            menuId="more-menu"
            onClick={() => toggleMenu('more')}
          >
            Mais
          </ToolbarButton>
          {activeMenu === 'more' ? (
            <MenuPanel id="more-menu" wide>
              <div className="space-y-4">
                <SummaryGrid summary={summary} />
                <div className="grid gap-1">
                  <ActionRow onClick={() => runAndClose(onClearToolbarState)}>
                    Limpar filtros e ordenacao
                  </ActionRow>
                  <ActionRow onClick={() => runAndClose(onRestoreView)}>
                    Restaurar visualizacao padrao
                  </ActionRow>
                  <ActionRow onClick={() => runAndClose(onRefresh)}>
                    Recarregar dados
                  </ActionRow>
                </div>
              </div>
            </MenuPanel>
          ) : null}
        </div>

        <ToolbarButton icon="dashboard" onClick={onRefresh}>
          {loading ? 'Carregando' : 'Atualizar'}
        </ToolbarButton>
      </div>

      <button
        type="button"
        onClick={onNewProject}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
      >
        <Icon name="plus" className="h-4 w-4" />
        Novo Projeto
      </button>
    </div>
  )
}
