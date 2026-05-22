import { useState } from 'react'
import { formatDate, formatLabel, formatMoney } from '../../utils/format'
import { Icon } from '../ui/Icon'

const inputClass =
  'mt-2 h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#cdbbf8] focus:ring-4 focus:ring-[#efe8ff] dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-[#7c5ac4] dark:focus:ring-[#7c5ac4]/20'

const textareaClass =
  'mt-2 min-h-24 w-full resize-y rounded-2xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#cdbbf8] focus:ring-4 focus:ring-[#efe8ff] dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-[#7c5ac4] dark:focus:ring-[#7c5ac4]/20'

const fieldAliases = {
  ativo: ['active'],
  categoria: ['category'],
  criticidade: ['criticality'],
  custoUnitario: ['unitCost'],
  dataConclusao: ['endDate'],
  dataFim: ['endDate'],
  dataInicio: ['startDate'],
  dataLancamento: ['date'],
  descricao: ['description'],
  estrategiaResposta: ['strategy'],
  funcaoNoProjeto: ['role'],
  impacto: ['impact'],
  nome: ['name'],
  papelAcesso: ['accessRole'],
  percentualConcluido: ['completion'],
  percentualConclusao: ['completion'],
  prazo: ['dueDate'],
  prioridade: ['priority'],
  probabilidade: ['probability'],
  quantidade: ['quantity'],
  tipo: ['type'],
  titulo: ['title'],
  valorPrevisto: ['plannedValue'],
  valorReal: ['realValue'],
}

function getItemValue(item, fieldName) {
  if (item[fieldName] !== undefined && item[fieldName] !== null) {
    return item[fieldName]
  }

  const aliases = fieldAliases[fieldName] || []
  const alias = aliases.find((aliasName) => item[aliasName] !== undefined && item[aliasName] !== null)

  return alias ? item[alias] : undefined
}

function fieldValue(item, field) {
  if (!item) {
    if (field.type === 'boolean') {
      return field.defaultValue ?? true
    }

    return field.defaultValue ?? ''
  }

  const value = getItemValue(item, field.name)

  if (field.type === 'number' || field.type === 'integer') {
    return value ?? ''
  }

  if (field.type === 'boolean') {
    return Boolean(value)
  }

  if (field.type === 'select' && value !== undefined && value !== null && value !== '') {
    return String(value)
  }

  return value ?? ''
}

function buildInitialValues(fields, item) {
  return fields.reduce((values, field) => {
    values[field.name] = fieldValue(item, field)
    return values
  }, {})
}

function isBlank(value) {
  return value === null || value === undefined || value === ''
}

function validate(fields, values) {
  const errors = {}

  fields.forEach((field) => {
    const value = values[field.name]

    if (field.required && isBlank(value)) {
      errors[field.name] = `${field.label} e obrigatorio.`
      return
    }

    if (isBlank(value) || field.type === 'boolean') {
      return
    }

    if (field.type === 'number' || field.type === 'integer') {
      const number = Number(value)

      if (!Number.isFinite(number)) {
        errors[field.name] = `${field.label} deve ser numerico.`
        return
      }

      if (field.type === 'integer' && !Number.isInteger(number)) {
        errors[field.name] = `${field.label} deve ser inteiro.`
        return
      }

      if (field.min !== undefined && number < field.min) {
        errors[field.name] = `${field.label} deve ser maior ou igual a ${field.min}.`
      }

      if (field.max !== undefined && number > field.max) {
        errors[field.name] = `${field.label} deve ser menor ou igual a ${field.max}.`
      }
    }
  })

  return errors
}

function buildPayload(fields, values) {
  return fields.reduce((payload, field) => {
    const value = values[field.name]

    if (field.type === 'boolean') {
      payload[field.name] = Boolean(value)
      return payload
    }

    if (field.type === 'number' || field.type === 'integer') {
      payload[field.name] = isBlank(value) ? null : Number(value)
      return payload
    }

    if (field.type === 'select' && field.optionsKey) {
      payload[field.name] = isBlank(value) ? null : Number(value)
      return payload
    }

    if (typeof value === 'string') {
      const trimmed = value.trim()
      payload[field.name] = trimmed || null
      return payload
    }

    payload[field.name] = value ?? null
    return payload
  }, {})
}

function getOptions(field, context) {
  if (field.options) {
    return field.options
  }

  if (!field.optionsKey) {
    return []
  }

  const items = context[field.optionsKey] || []
  return items.map((item) => ({
    label: optionLabel(item, field.optionsKey),
    value: item.id,
  }))
}

function optionLabel(item, key) {
  if (key === 'users') {
    return item.email ? `${item.name} (${item.email})` : item.name
  }

  if (key === 'participants') {
    return [item.userName, item.projectName].filter(Boolean).join(' - ') || item.id
  }

  if (key === 'activities') {
    return item.title || item.titulo || item.id
  }

  if (key === 'resources') {
    return item.name || item.nome || item.id
  }

  return item.name || item.nome || item.title || item.id
}

function FieldError({ message }) {
  if (!message) {
    return null
  }

  return <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-300">{message}</p>
}

function EntityFormModal({ config, context, item, mode, onClose, onSubmit, submitting }) {
  const [values, setValues] = useState(() => buildInitialValues(config.fields, item))
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')

  const title = mode === 'edit' ? `Editar ${config.singular}` : config.createLabel || `Novo ${config.singular}`

  function updateValue(field, value) {
    setValues((current) => ({ ...current, [field]: value }))
    setSubmitError('')

    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: '' }))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = validate(config.fields, values)
    setErrors(nextErrors)

    if (Object.values(nextErrors).some(Boolean)) {
      return
    }

    try {
      await onSubmit(buildPayload(config.fields, values))
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : `Nao foi possivel salvar ${config.singular}.`,
      )
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/45 px-4 py-6 backdrop-blur-sm">
      <section
        aria-labelledby="entity-form-title"
        aria-modal="true"
        className="max-h-[calc(100vh-2rem)] w-full max-w-3xl overflow-y-auto rounded-3xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 sm:p-6"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="entity-form-title" className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
              {title}
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Preencha os campos obrigatorios e salve para atualizar a API.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="grid h-9 w-9 place-items-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            aria-label="Fechar"
          >
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          {submitError ? (
            <div
              className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-100"
              role="alert"
            >
              {submitError}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            {config.fields.map((field) => (
              <FormField
                key={field.name}
                context={context}
                error={errors[field.name]}
                field={field}
                onChange={updateValue}
                value={values[field.name]}
              />
            ))}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-zinc-100 pt-5 dark:border-zinc-800 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              {submitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

function FormField({ context, error, field, onChange, value }) {
  const wrapperClass = field.fullWidth ? 'md:col-span-2' : ''
  const required = field.required ? ' *' : ''

  if (field.type === 'textarea') {
    return (
      <label className={`block text-sm font-medium text-zinc-700 dark:text-zinc-200 ${wrapperClass}`}>
        {field.label}
        {required}
        <textarea
          value={value}
          onChange={(event) => onChange(field.name, event.target.value)}
          className={textareaClass}
          maxLength={field.maxLength}
        />
        <FieldError message={error} />
      </label>
    )
  }

  if (field.type === 'select') {
    const options = getOptions(field, context)

    return (
      <label className={`block text-sm font-medium text-zinc-700 dark:text-zinc-200 ${wrapperClass}`}>
        {field.label}
        {required}
        <select
          value={value ?? ''}
          onChange={(event) => onChange(field.name, event.target.value)}
          className={inputClass}
          required={field.required}
        >
          {!field.required ? <option value="">Nenhum</option> : <option value="">Selecione</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FieldError message={error} />
      </label>
    )
  }

  if (field.type === 'boolean') {
    return (
      <label
        className={`mt-7 flex h-11 items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 ${wrapperClass}`}
      >
        {field.label}
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(field.name, event.target.checked)}
          className="h-4 w-4 accent-zinc-950 dark:accent-white"
        />
      </label>
    )
  }

  const type = field.type === 'number' || field.type === 'integer' ? 'number' : field.type

  return (
    <label className={`block text-sm font-medium text-zinc-700 dark:text-zinc-200 ${wrapperClass}`}>
      {field.label}
      {required}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(field.name, event.target.value)}
        className={inputClass}
        max={field.max}
        maxLength={field.maxLength}
        min={field.min}
        required={field.required}
        step={field.step}
      />
      <FieldError message={error} />
    </label>
  )
}

function EmptyState({ config }) {
  return (
    <div className="rounded-3xl border border-dashed border-zinc-200 bg-white px-6 py-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
        {config.emptyTitle || `Nenhum registro em ${config.title.toLowerCase()}`}
      </p>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        {config.emptyDescription || 'Use o botao Novo para cadastrar o primeiro item.'}
      </p>
    </div>
  )
}

function ContextSearch({ onChange, placeholder, value }) {
  return (
    <label className="relative min-w-0 flex-1 sm:max-w-xs">
      <Icon
        name="search"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#cdbbf8] focus:ring-4 focus:ring-[#efe8ff] dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-[#7c5ac4] dark:focus:ring-[#7c5ac4]/20"
      />
    </label>
  )
}

function formatColumnValue(column, item, context) {
  const rawValue = typeof column.value === 'function' ? column.value(item, context) : item[column.value]

  if (column.format === 'date') {
    return formatDate(rawValue)
  }

  if (column.format === 'money') {
    return formatMoney(rawValue)
  }

  if (column.format === 'label') {
    return formatLabel(rawValue)
  }

  if (column.format === 'boolean') {
    return rawValue ? 'Sim' : 'Nao'
  }

  if (rawValue === null || rawValue === undefined || rawValue === '') {
    return '-'
  }

  return rawValue
}

function EntityCard({ config, context, item, onDelete, onEdit, onView, viewLabel }) {
  const [actionsOpen, setActionsOpen] = useState(false)
  const title = config.getTitle(item)
  const description = config.getDescription?.(item) || ''

  return (
    <article className="relative rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-zinc-950 dark:text-zinc-50">{title}</h3>
          {description ? (
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          ) : null}
        </div>
        <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
          #{item.id}
        </span>
      </div>

      <div className="mt-5 grid gap-3 text-sm">
        {config.columns.map((column) => (
          <div key={column.label} className="flex justify-between gap-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
            <span className="text-zinc-500 dark:text-zinc-400">{column.label}</span>
            <strong className="text-right font-medium text-zinc-900 dark:text-zinc-100">
              {formatColumnValue(column, item, context)}
            </strong>
          </div>
        ))}
      </div>

      {onView ? (
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onView(item)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            <Icon name="eye" className="h-4 w-4" />
            {viewLabel}
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setActionsOpen((current) => !current)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
              aria-expanded={actionsOpen}
              aria-label={`Acoes de ${title}`}
            >
              <Icon name="more" className="h-4 w-4" />
            </button>
            {actionsOpen ? (
              <div className="absolute right-0 top-12 z-20 w-40 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-1 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                <button
                  type="button"
                  onClick={() => {
                    setActionsOpen(false)
                    onEdit(item)
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActionsOpen(false)
                    onDelete(item)
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"
                >
                  Excluir
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="inline-flex h-9 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
            className="inline-flex h-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-200 dark:hover:bg-rose-950/60"
          >
            Excluir
          </button>
        </div>
      )}
    </article>
  )
}

export function EntityCrudView({
  config,
  context,
  errors,
  items,
  loading,
  onCreate,
  onDelete,
  onRefresh,
  onUpdate,
  onView,
  viewLabel = 'Ver',
  getFormContext,
  onCreateClick,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  searchValue = '',
  showSearch = false,
}) {
  const [modal, setModal] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  function openCreateModal() {
    setDeleteError('')
    setModal({ mode: 'create', item: null })
  }

  function openEditModal(item) {
    setDeleteError('')
    setModal({ mode: 'edit', item })
  }

  async function handleSubmit(payload) {
    setSubmitting(true)

    try {
      if (modal.mode === 'edit') {
        await onUpdate(modal.item.id, payload)
      } else {
        await onCreate(payload)
      }

      await onRefresh()
      setModal(null)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(item) {
    const title = config.getTitle(item)

    if (!window.confirm(`Excluir ${title}?`)) {
      return
    }

    setDeleteError('')

    try {
      await onDelete(item.id)
      await onRefresh()
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : `Nao foi possivel excluir ${config.singular}.`,
      )
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">{config.title}</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{config.description}</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
          {showSearch ? (
            <ContextSearch
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
              value={searchValue}
            />
          ) : null}
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <Icon name="dashboard" className="h-4 w-4" />
            {loading ? 'Carregando' : 'Atualizar'}
          </button>
          <button
            type="button"
            onClick={onCreateClick || openCreateModal}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            <Icon name="plus" className="h-4 w-4" />
            {config.createLabel || 'Novo'}
          </button>
        </div>
      </div>

      {errors.length ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
          {errors.slice(0, 2).join(' ')}
        </div>
      ) : null}

      {deleteError ? (
        <div
          className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-100"
          role="alert"
        >
          {deleteError}
        </div>
      ) : null}

      {items.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <EntityCard
              key={item.id}
              config={config}
              context={context}
              item={item}
              onDelete={handleDelete}
              onEdit={openEditModal}
              onView={onView}
              viewLabel={viewLabel}
            />
          ))}
        </div>
      ) : (
        <EmptyState config={config} />
      )}

      {modal ? (
        <EntityFormModal
          config={config}
          context={
            getFormContext
              ? getFormContext({ context, item: modal.item, mode: modal.mode })
              : context
          }
          item={modal.item}
          mode={modal.mode}
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      ) : null}
    </section>
  )
}
