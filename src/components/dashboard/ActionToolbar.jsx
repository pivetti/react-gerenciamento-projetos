import { Icon } from '../ui/Icon'

function ToolbarButton({ icon, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
    >
      <Icon name={icon} className="h-4 w-4" />
      {children}
    </button>
  )
}

export function ActionToolbar({ loading, onRefresh }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <ToolbarButton icon="filter">Filtrar</ToolbarButton>
        <ToolbarButton icon="sort">Ordenar</ToolbarButton>
        <ToolbarButton icon="hide">Ocultar</ToolbarButton>
        <ToolbarButton icon="more">Mais</ToolbarButton>
        <ToolbarButton icon="dashboard" onClick={onRefresh}>
          {loading ? 'Carregando' : 'Atualizar'}
        </ToolbarButton>
      </div>

      <button
        type="button"
        className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
      >
        <Icon name="plus" className="h-4 w-4" />
        Novo Projeto
      </button>
    </div>
  )
}
