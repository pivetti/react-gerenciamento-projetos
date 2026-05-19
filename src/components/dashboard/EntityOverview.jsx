import { Icon } from '../ui/Icon'
import { PriorityBadge, StatusBadge } from './Badges'
import { formatDate, formatLabel, formatMoney } from '../../utils/format'

function EmptyState({ title }) {
  return (
    <div className="rounded-3xl border border-dashed border-zinc-200 bg-white px-6 py-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{title}</p>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Quando a API retornar registros, eles aparecem aqui.</p>
    </div>
  )
}

function entityMeta(type, item) {
  if (type === 'activities') {
    return {
      icon: 'activities',
      title: item.title,
      description: item.description || item.projectName || 'Sem descricao cadastrada.',
      details: [
        ['Projeto', item.projectName],
        ['Responsavel', item.responsibleName],
        ['Prazo', formatDate(item.dueDate)],
      ],
      status: item.status,
      priority: item.priority,
    }
  }

  if (type === 'participants') {
    return {
      icon: 'participants',
      title: item.userName,
      description: item.projectName || 'Sem projeto vinculado.',
      details: [
        ['Funcao', item.role],
        ['Acesso', formatLabel(item.accessRole)],
      ],
      status: item.active ? 'Ativo' : 'Inativo',
    }
  }

  if (type === 'resources') {
    return {
      icon: 'resources',
      title: item.name,
      description: item.description || item.projectName || 'Sem descricao cadastrada.',
      details: [
        ['Projeto', item.projectName],
        ['Quantidade', item.quantity],
        ['Custo unitario', formatMoney(item.unitCost)],
      ],
      status: item.type,
    }
  }

  if (type === 'costs') {
    return {
      icon: 'costs',
      title: item.description,
      description: item.projectName || item.activityTitle || 'Sem projeto vinculado.',
      details: [
        ['Previsto', formatMoney(item.plannedValue)],
        ['Real', formatMoney(item.realValue)],
        ['Lancamento', formatDate(item.date)],
      ],
      status: item.type,
    }
  }

  return {
    icon: 'risks',
    title: item.title,
    description: item.description || item.strategy || 'Sem descricao cadastrada.',
    details: [
      ['Projeto', item.projectName],
      ['Categoria', formatLabel(item.category)],
      ['Criticidade', item.criticality],
    ],
    status: item.status,
  }
}

export function EntityOverview({ items, title, type }) {
  if (!items.length) {
    return <EmptyState title={`Nenhum item em ${title.toLowerCase()}`} />
  }

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const meta = entityMeta(type, item)

        return (
          <article
            key={item.id}
            className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                  <Icon name={meta.icon} className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-zinc-950 dark:text-zinc-50">{meta.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{meta.description}</p>
                </div>
              </div>
              <StatusBadge value={meta.status} />
            </div>

            {meta.priority ? (
              <div className="mt-4">
                <PriorityBadge value={meta.priority} />
              </div>
            ) : null}

            <div className="mt-5 grid gap-3 text-sm">
              {meta.details.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                  <span className="text-zinc-500 dark:text-zinc-400">{label}</span>
                  <strong className="text-right font-medium text-zinc-900 dark:text-zinc-100">{value || '-'}</strong>
                </div>
              ))}
            </div>
          </article>
        )
      })}
    </section>
  )
}
