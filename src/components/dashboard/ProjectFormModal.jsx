import { useEffect, useState } from 'react'
import { Icon } from '../ui/Icon'

const initialValues = {
  nome: '',
  descricao: '',
  objetivo: '',
  status: 'PLANEJADO',
  prioridade: 'MEDIA',
  dataInicio: '',
  dataFim: '',
  orcamentoPrevisto: '',
  percentualConcluido: '0',
}

function projectInitialValues(project) {
  if (!project) {
    return initialValues
  }

  return {
    nome: project.nome || project.name || '',
    descricao: project.descricao || project.description || '',
    objetivo: project.objetivo || project.objective || '',
    status: project.status || 'PLANEJADO',
    prioridade: project.prioridade || project.priority || 'MEDIA',
    dataInicio: project.dataInicio || project.startDate || '',
    dataFim: project.dataFim || project.endDate || '',
    orcamentoPrevisto:
      project.orcamentoPrevisto !== null && project.orcamentoPrevisto !== undefined
        ? String(project.orcamentoPrevisto)
        : project.budget !== null && project.budget !== undefined
          ? String(project.budget)
          : '',
    percentualConcluido:
      project.percentualConcluido !== null && project.percentualConcluido !== undefined
        ? String(project.percentualConcluido)
        : project.completion !== null && project.completion !== undefined
          ? String(project.completion)
          : '0',
  }
}

const statusOptions = [
  { value: 'PLANEJADO', label: 'Planejado' },
  { value: 'EM_ANDAMENTO', label: 'Em andamento' },
  { value: 'CONCLUIDO', label: 'Concluido' },
]

const priorityOptions = [
  { value: 'BAIXA', label: 'Baixa' },
  { value: 'MEDIA', label: 'Media' },
  { value: 'ALTA', label: 'Alta' },
  { value: 'CRITICA', label: 'Critica' },
]

const inputClass =
  'mt-2 h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#cdbbf8] focus:ring-4 focus:ring-[#efe8ff] dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-[#7c5ac4] dark:focus:ring-[#7c5ac4]/20'

const textareaClass =
  'mt-2 min-h-24 w-full resize-y rounded-2xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#cdbbf8] focus:ring-4 focus:ring-[#efe8ff] dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-[#7c5ac4] dark:focus:ring-[#7c5ac4]/20'

function FieldError({ message }) {
  if (!message) {
    return null
  }

  return <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-300">{message}</p>
}

function toNullableText(value) {
  const trimmed = value.trim()
  return trimmed || null
}

function validate(values) {
  const errors = {}
  const completion = Number(values.percentualConcluido)
  const budgetText = values.orcamentoPrevisto.trim()

  if (!values.nome.trim()) {
    errors.nome = 'Informe o nome do projeto.'
  }

  if (!values.status) {
    errors.status = 'Selecione o status.'
  }

  if (!values.prioridade) {
    errors.prioridade = 'Selecione a prioridade.'
  }

  if (values.percentualConcluido === '' || !Number.isFinite(completion)) {
    errors.percentualConcluido = 'Informe um percentual valido.'
  } else if (completion < 0 || completion > 100) {
    errors.percentualConcluido = 'Use um valor entre 0 e 100.'
  }

  if (budgetText) {
    const budget = Number(budgetText)

    if (!Number.isFinite(budget) || budget < 0) {
      errors.orcamentoPrevisto = 'Informe um valor numerico positivo.'
    }
  }

  if (values.dataInicio && values.dataFim && values.dataFim < values.dataInicio) {
    errors.dataFim = 'A data final deve ser igual ou posterior ao inicio.'
  }

  return errors
}

function buildPayload(values) {
  const budgetText = values.orcamentoPrevisto.trim()

  return {
    nome: values.nome.trim(),
    descricao: toNullableText(values.descricao),
    objetivo: toNullableText(values.objetivo),
    status: values.status,
    prioridade: values.prioridade,
    dataInicio: values.dataInicio || null,
    dataFim: values.dataFim || null,
    orcamentoPrevisto: budgetText ? Number(budgetText) : null,
    percentualConcluido: Number(values.percentualConcluido),
  }
}

export function ProjectFormModal({ onClose, onSubmit, open, project, submitting }) {
  const [values, setValues] = useState(() => projectInitialValues(project))
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const title = project ? 'Editar projeto' : 'Novo projeto'

  useEffect(() => {
    if (!open) {
      return undefined
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape' && !submitting) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, open, submitting])

  if (!open) {
    return null
  }

  function updateValue(field, value) {
    setValues((current) => ({ ...current, [field]: value }))
    setSubmitError('')

    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: '' }))
    }
  }

  function handleBackdropMouseDown(event) {
    if (event.target === event.currentTarget && !submitting) {
      onClose()
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = validate(values)
    setErrors(nextErrors)

    if (Object.values(nextErrors).some(Boolean)) {
      return
    }

    try {
      await onSubmit(buildPayload(values))
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Nao foi possivel salvar o projeto.',
      )
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/45 px-4 py-6 backdrop-blur-sm"
      onMouseDown={handleBackdropMouseDown}
    >
      <section
        aria-labelledby="project-form-title"
        aria-modal="true"
        className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-3xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 sm:p-6"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="project-form-title" className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
              {title}
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {project ? 'Atualize os dados principais do projeto.' : 'Cadastre os dados principais do projeto.'}
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

          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Nome
            <input
              type="text"
              value={values.nome}
              onChange={(event) => updateValue('nome', event.target.value)}
              className={inputClass}
              maxLength={150}
              required
            />
            <FieldError message={errors.nome} />
          </label>

          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Descricao
            <textarea
              value={values.descricao}
              onChange={(event) => updateValue('descricao', event.target.value)}
              className={textareaClass}
              maxLength={1000}
            />
          </label>

          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Objetivo
            <textarea
              value={values.objetivo}
              onChange={(event) => updateValue('objetivo', event.target.value)}
              className={textareaClass}
              maxLength={1000}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Status
              <select
                value={values.status}
                onChange={(event) => updateValue('status', event.target.value)}
                className={inputClass}
                required
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <FieldError message={errors.status} />
            </label>

            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Prioridade
              <select
                value={values.prioridade}
                onChange={(event) => updateValue('prioridade', event.target.value)}
                className={inputClass}
                required
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <FieldError message={errors.prioridade} />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Data de inicio
              <input
                type="date"
                value={values.dataInicio}
                onChange={(event) => updateValue('dataInicio', event.target.value)}
                className={inputClass}
              />
            </label>

            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Data final
              <input
                type="date"
                value={values.dataFim}
                onChange={(event) => updateValue('dataFim', event.target.value)}
                className={inputClass}
              />
              <FieldError message={errors.dataFim} />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Orcamento previsto
              <input
                type="number"
                value={values.orcamentoPrevisto}
                onChange={(event) => updateValue('orcamentoPrevisto', event.target.value)}
                className={inputClass}
                min="0"
                step="0.01"
              />
              <FieldError message={errors.orcamentoPrevisto} />
            </label>

            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Percentual concluido
              <input
                type="number"
                value={values.percentualConcluido}
                onChange={(event) => updateValue('percentualConcluido', event.target.value)}
                className={inputClass}
                min="0"
                max="100"
                required
              />
              <FieldError message={errors.percentualConcluido} />
            </label>
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
              {submitting ? 'Salvando...' : 'Salvar projeto'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
