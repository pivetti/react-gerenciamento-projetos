import { useMemo, useState } from 'react'
import { Icon } from '../ui/Icon'
import {
  accessRoleOptions,
  activityStatusOptions,
  costTypeOptions,
  priorityOptions,
  projectStatusOptions,
  resourceTypeOptions,
  riskCategoryOptions,
  riskStatusOptions,
} from '../../utils/entityCrudConfig'

const inputClass =
  'mt-2 h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#cdbbf8] focus:ring-4 focus:ring-[#efe8ff] dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-[#7c5ac4] dark:focus:ring-[#7c5ac4]/20'

const textareaClass =
  'mt-2 min-h-24 w-full resize-y rounded-2xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#cdbbf8] focus:ring-4 focus:ring-[#efe8ff] dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-[#7c5ac4] dark:focus:ring-[#7c5ac4]/20'

const steps = [
  { id: 'project', label: 'Projeto', helper: 'Dados principais' },
  { id: 'participants', label: 'Participantes', helper: 'Equipe' },
  { id: 'activities', label: 'Atividades', helper: 'Tarefas' },
  { id: 'resources', label: 'Recursos', helper: 'Itens e servicos' },
  { id: 'costs', label: 'Custos', helper: 'Lancamentos' },
  { id: 'risks', label: 'Riscos', helper: 'Alertas' },
  { id: 'review', label: 'Revisao', helper: 'Conferencia' },
]

const initialProject = {
  nome: '',
  status: 'PLANEJADO',
  prioridade: 'MEDIA',
  descricao: '',
  objetivo: '',
  dataInicio: '',
  dataFim: '',
  orcamentoPrevisto: '',
  percentualConcluido: '0',
}

const initialParticipant = {
  usuarioId: '',
  funcaoNoProjeto: '',
  papelAcesso: 'EXECUTOR',
  ativo: true,
}

const initialActivity = {
  titulo: '',
  descricao: '',
  status: 'NAO_INICIADA',
  prioridade: 'MEDIA',
  dataInicio: '',
  prazo: '',
  dataConclusao: '',
  percentualConclusao: '0',
  responsavelTempId: '',
}

const initialResource = {
  nome: '',
  tipo: 'HUMANO',
  descricao: '',
  quantidade: '1',
  custoUnitario: '',
}

const initialCost = {
  descricao: '',
  tipo: 'PLANEJADO',
  valorPrevisto: '',
  valorReal: '',
  dataLancamento: '',
  atividadeTempId: '',
  recursoTempId: '',
}

const initialRisk = {
  titulo: '',
  descricao: '',
  categoria: 'ESCOPO',
  probabilidade: '1',
  impacto: '1',
  criticidade: '1',
  status: 'IDENTIFICADO',
  estrategiaResposta: '',
  planoMitigacao: '',
}

function makeTempId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function normalizeId(value) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  return String(value)
}

function optionLabel(item) {
  if (!item) {
    return ''
  }

  return item.email ? `${item.name} (${item.email})` : item.name || item.nome || item.id
}

function userLabel(users, userId) {
  const user = users.find((item) => normalizeId(item.id) === normalizeId(userId))
  return optionLabel(user) || 'Usuario'
}

function participantLabel(participant, users) {
  return userLabel(users, participant.usuarioId)
}

function toNullableText(value) {
  const text = String(value || '').trim()
  return text || null
}

function toNullableNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function projectIdValue(project) {
  const number = Number(project.id)
  return Number.isFinite(number) ? number : project.id
}

function payloadId(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : value
}

function entityId(entity) {
  return entity?.id ?? entity?.codigo ?? null
}

function apiErrorMessage(error) {
  return error instanceof Error ? error.message : 'Erro inesperado da API.'
}

function hasErrors(errors) {
  return Object.values(errors).some(Boolean)
}

function validateNumber(errors, values, field, label, options = {}) {
  const value = values[field]
  const required = options.required ?? false

  if (value === '' || value === null || value === undefined) {
    if (required) {
      errors[field] = `${label} e obrigatorio.`
    }
    return
  }

  const number = Number(value)

  if (!Number.isFinite(number)) {
    errors[field] = `${label} deve ser numerico.`
    return
  }

  if (options.integer && !Number.isInteger(number)) {
    errors[field] = `${label} deve ser inteiro.`
    return
  }

  if (options.min !== undefined && number < options.min) {
    errors[field] = `${label} deve ser maior ou igual a ${options.min}.`
  }

  if (options.max !== undefined && number > options.max) {
    errors[field] = `${label} deve ser menor ou igual a ${options.max}.`
  }
}

function validateProject(values) {
  const errors = {}

  if (!values.nome.trim()) {
    errors.nome = 'Informe o nome do projeto.'
  }

  if (!values.status) {
    errors.status = 'Selecione o status.'
  }

  if (!values.prioridade) {
    errors.prioridade = 'Selecione a prioridade.'
  }

  validateNumber(errors, values, 'orcamentoPrevisto', 'Orcamento previsto', { min: 0 })
  validateNumber(errors, values, 'percentualConcluido', 'Percentual concluido', {
    integer: true,
    max: 100,
    min: 0,
    required: true,
  })

  if (values.dataInicio && values.dataFim && values.dataFim < values.dataInicio) {
    errors.dataFim = 'A data final deve ser igual ou posterior ao inicio.'
  }

  return errors
}

function validateParticipant(values, participants, editingTempId) {
  const errors = {}

  if (!values.usuarioId) {
    errors.usuarioId = 'Selecione um usuario.'
  }

  if (!values.funcaoNoProjeto.trim()) {
    errors.funcaoNoProjeto = 'Informe a funcao no projeto.'
  }

  if (!values.papelAcesso) {
    errors.papelAcesso = 'Selecione o papel de acesso.'
  }

  const duplicate = participants.some(
    (participant) =>
      participant.tempId !== editingTempId &&
      normalizeId(participant.usuarioId) === normalizeId(values.usuarioId),
  )

  if (duplicate) {
    errors.usuarioId = 'Este usuario ja foi adicionado ao projeto.'
  }

  return errors
}

function validateActivity(values) {
  const errors = {}

  if (!values.titulo.trim()) {
    errors.titulo = 'Informe o titulo da atividade.'
  }

  if (!values.status) {
    errors.status = 'Selecione o status.'
  }

  if (!values.prioridade) {
    errors.prioridade = 'Selecione a prioridade.'
  }

  validateNumber(errors, values, 'percentualConclusao', 'Percentual de conclusao', {
    integer: true,
    max: 100,
    min: 0,
    required: true,
  })

  return errors
}

function validateResource(values) {
  const errors = {}

  if (!values.nome.trim()) {
    errors.nome = 'Informe o nome do recurso.'
  }

  if (!values.tipo) {
    errors.tipo = 'Selecione o tipo.'
  }

  validateNumber(errors, values, 'quantidade', 'Quantidade', {
    integer: true,
    min: 1,
    required: true,
  })
  validateNumber(errors, values, 'custoUnitario', 'Custo unitario', { min: 0, required: true })

  return errors
}

function validateCost(values) {
  const errors = {}

  if (!values.descricao.trim()) {
    errors.descricao = 'Informe a descricao do custo.'
  }

  if (!values.tipo) {
    errors.tipo = 'Selecione o tipo.'
  }

  validateNumber(errors, values, 'valorPrevisto', 'Valor previsto', { min: 0, required: true })
  validateNumber(errors, values, 'valorReal', 'Valor real', { min: 0 })

  return errors
}

function validateRisk(values) {
  const errors = {}

  if (!values.titulo.trim()) {
    errors.titulo = 'Informe o titulo do risco.'
  }

  if (!values.categoria) {
    errors.categoria = 'Selecione a categoria.'
  }

  if (!values.status) {
    errors.status = 'Selecione o status.'
  }

  validateNumber(errors, values, 'probabilidade', 'Probabilidade', {
    integer: true,
    max: 5,
    min: 1,
    required: true,
  })
  validateNumber(errors, values, 'impacto', 'Impacto', {
    integer: true,
    max: 5,
    min: 1,
    required: true,
  })
  validateNumber(errors, values, 'criticidade', 'Criticidade', {
    integer: true,
    max: 25,
    min: 1,
    required: true,
  })

  return errors
}

function buildProjectPayload(values) {
  return {
    nome: values.nome.trim(),
    status: values.status,
    prioridade: values.prioridade,
    descricao: toNullableText(values.descricao),
    objetivo: toNullableText(values.objetivo),
    dataInicio: values.dataInicio || null,
    dataFim: values.dataFim || null,
    orcamentoPrevisto: toNullableNumber(values.orcamentoPrevisto),
    percentualConcluido: Number(values.percentualConcluido),
  }
}

function FieldError({ message }) {
  if (!message) {
    return null
  }

  return <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-300">{message}</p>
}

function TextField({
  className = '',
  error,
  label,
  onChange,
  required = false,
  type = 'text',
  value,
  ...props
}) {
  return (
    <label className={`block text-sm font-medium text-zinc-700 dark:text-zinc-200 ${className}`}>
      {label}
      {required ? ' *' : ''}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
        required={required}
        {...props}
      />
      <FieldError message={error} />
    </label>
  )
}

function TextareaField({ className = 'md:col-span-2', error, label, onChange, value, ...props }) {
  return (
    <label className={`block text-sm font-medium text-zinc-700 dark:text-zinc-200 ${className}`}>
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={textareaClass}
        {...props}
      />
      <FieldError message={error} />
    </label>
  )
}

function SelectField({
  className = '',
  error,
  label,
  onChange,
  options,
  placeholder = 'Selecione',
  required = false,
  value,
}) {
  return (
    <label className={`block text-sm font-medium text-zinc-700 dark:text-zinc-200 ${className}`}>
      {label}
      {required ? ' *' : ''}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
        required={required}
      >
        <option value="">{placeholder}</option>
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

function BooleanField({ label, onChange, value }) {
  return (
    <label className="mt-7 flex h-11 items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
      {label}
      <input
        type="checkbox"
        checked={Boolean(value)}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-zinc-950 dark:accent-white"
      />
    </label>
  )
}

function StepIntro({ actionLabel, children, count, description, onAction, title }) {
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">{title}</h3>
            {count !== undefined ? (
              <span className="rounded-full bg-[#efe8ff] px-2.5 py-1 text-xs font-semibold text-[#5d428e] dark:bg-[#34254f] dark:text-[#e6dcff]">
                {count} adicionados
              </span>
            ) : null}
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
          {children}
        </div>
        {actionLabel ? (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            <Icon name="plus" className="h-4 w-4" />
            {actionLabel}
          </button>
        ) : null}
      </div>
    </section>
  )
}

function EmptyStep({ children }) {
  return (
    <div className="rounded-3xl border border-dashed border-zinc-200 bg-white px-5 py-12 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
      {children}
    </div>
  )
}

function ItemCard({ eyebrow, meta, onEdit, onRemove, title }) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
              {eyebrow}
            </p>
          ) : null}
          <h4 className="mt-1 truncate text-sm font-semibold text-zinc-950 dark:text-zinc-50">
            {title}
          </h4>
          {meta ? <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{meta}</p> : null}
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex h-9 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex h-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-200 dark:hover:bg-rose-950/60"
          >
            Remover
          </button>
        </div>
      </div>
    </article>
  )
}

function FormPanel({ children, title }) {
  return (
    <section className="rounded-3xl border border-[#ddcffc] bg-white p-5 shadow-sm dark:border-[#4d3972] dark:bg-zinc-900">
      <h3 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">{title}</h3>
      <div className="mt-5 grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  )
}

function DraftActions({ editing, onCancel, onSubmit }) {
  return (
    <div className="flex flex-col-reverse gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800 sm:flex-row sm:justify-end md:col-span-2">
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
      >
        Cancelar
      </button>
      <button
        type="button"
        onClick={onSubmit}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
      >
        <Icon name="plus" className="h-4 w-4" />
        {editing ? 'Salvar alteracao' : 'Adicionar'}
      </button>
    </div>
  )
}

function CollectionList({ empty, items, renderItem }) {
  if (!items.length) {
    return <EmptyStep>{empty}</EmptyStep>
  }

  return <div className="grid gap-3 lg:grid-cols-2">{items.map(renderItem)}</div>
}

function Stepper({ activeStep, maxVisitedStep, onSelect, stepErrors }) {
  return (
    <nav className="overflow-x-auto" aria-label="Progresso do cadastro">
      <ol className="flex min-w-max items-center gap-2 px-1 py-1">
        {steps.map((step, index) => {
          const active = activeStep === index
          const completed = index < activeStep
          const errored = Boolean(stepErrors[step.id])
          const reachable = index <= maxVisitedStep

          return (
            <li key={step.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => reachable && onSelect(index)}
                disabled={!reachable}
                className={`flex min-w-40 items-center gap-3 rounded-2xl border px-3 py-2 text-left transition ${
                  active
                    ? 'border-[#cdbbf8] bg-[#efe8ff] text-[#3f2a64] shadow-sm dark:border-[#4d3972] dark:bg-[#34254f] dark:text-[#f0eaff]'
                    : completed
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-200'
                      : errored
                        ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-200'
                        : 'border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
                }`}
              >
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
                    active
                      ? 'bg-white text-[#5d428e] dark:bg-[#221936] dark:text-[#e6dcff]'
                      : completed
                        ? 'bg-emerald-600 text-white'
                        : errored
                          ? 'bg-rose-600 text-white'
                          : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300'
                  }`}
                >
                  {errored ? '!' : completed ? 'OK' : index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{step.label}</span>
                  <span className="mt-0.5 block truncate text-xs opacity-75">{step.helper}</span>
                </span>
              </button>
              {index < steps.length - 1 ? (
                <span
                  className={`hidden h-px w-8 sm:block ${
                    completed ? 'bg-emerald-300 dark:bg-emerald-900' : 'bg-zinc-200 dark:bg-zinc-800'
                  }`}
                />
              ) : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function ReviewCard({ children, count, onEdit, title }) {
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">{title}</h3>
          {count !== undefined ? (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{count} itens</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex h-9 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Editar
        </button>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function MiniList({ empty, items, renderItem }) {
  if (!items.length) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">{empty}</p>
  }

  return (
    <div className="space-y-2">
      {items.slice(0, 3).map(renderItem)}
      {items.length > 3 ? (
        <p className="text-xs font-medium text-zinc-400">+ {items.length - 3} outros itens</p>
      ) : null}
    </div>
  )
}

export function ProjectWizardModal({ actions, onClose, onSaved, open, users }) {
  const [activeStep, setActiveStep] = useState(0)
  const [maxVisitedStep, setMaxVisitedStep] = useState(0)
  const [projectValues, setProjectValues] = useState(initialProject)
  const [participants, setParticipants] = useState([])
  const [participantDraft, setParticipantDraft] = useState(initialParticipant)
  const [participantErrors, setParticipantErrors] = useState({})
  const [participantFormOpen, setParticipantFormOpen] = useState(false)
  const [editingParticipantId, setEditingParticipantId] = useState(null)
  const [activities, setActivities] = useState([])
  const [activityDraft, setActivityDraft] = useState(initialActivity)
  const [activityErrors, setActivityErrors] = useState({})
  const [activityFormOpen, setActivityFormOpen] = useState(false)
  const [editingActivityId, setEditingActivityId] = useState(null)
  const [resources, setResources] = useState([])
  const [resourceDraft, setResourceDraft] = useState(initialResource)
  const [resourceErrors, setResourceErrors] = useState({})
  const [resourceFormOpen, setResourceFormOpen] = useState(false)
  const [editingResourceId, setEditingResourceId] = useState(null)
  const [costs, setCosts] = useState([])
  const [costDraft, setCostDraft] = useState(initialCost)
  const [costErrors, setCostErrors] = useState({})
  const [costFormOpen, setCostFormOpen] = useState(false)
  const [editingCostId, setEditingCostId] = useState(null)
  const [risks, setRisks] = useState([])
  const [riskDraft, setRiskDraft] = useState(initialRisk)
  const [riskErrors, setRiskErrors] = useState({})
  const [riskFormOpen, setRiskFormOpen] = useState(false)
  const [editingRiskId, setEditingRiskId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [partialProject, setPartialProject] = useState(null)

  const projectErrors = validateProject(projectValues)
  const projectInvalid = hasErrors(projectErrors)

  const userOptions = useMemo(
    () => users.map((user) => ({ label: optionLabel(user), value: user.id })),
    [users],
  )
  const participantOptions = useMemo(
    () =>
      participants.map((participant) => ({
        label: participantLabel(participant, users),
        value: participant.tempId,
      })),
    [participants, users],
  )
  const activityOptions = useMemo(
    () => activities.map((activity) => ({ label: activity.titulo, value: activity.tempId })),
    [activities],
  )
  const resourceOptions = useMemo(
    () => resources.map((resource) => ({ label: resource.nome, value: resource.tempId })),
    [resources],
  )

  const stepErrors = {
    project: projectInvalid,
    participants: hasErrors(participantErrors),
    activities: hasErrors(activityErrors),
    resources: hasErrors(resourceErrors),
    costs: hasErrors(costErrors),
    risks: hasErrors(riskErrors),
    review: Boolean(saveError),
  }

  if (!open) {
    return null
  }

  function updateProjectValue(field, value) {
    setProjectValues((current) => ({ ...current, [field]: value }))
  }

  function goToStep(index) {
    setActiveStep(index)
    setMaxVisitedStep((current) => Math.max(current, index))
  }

  function goNext() {
    if (activeStep === 0 && projectInvalid) {
      return
    }

    const nextStep = Math.min(activeStep + 1, steps.length - 1)
    goToStep(nextStep)
  }

  function openParticipantForm(participant = null) {
    setEditingParticipantId(participant?.tempId || null)
    setParticipantDraft(participant ? { ...participant } : initialParticipant)
    setParticipantErrors({})
    setParticipantFormOpen(true)
  }

  function addOrUpdateParticipant() {
    const errors = validateParticipant(participantDraft, participants, editingParticipantId)
    setParticipantErrors(errors)

    if (hasErrors(errors)) {
      return
    }

    const item = {
      ...participantDraft,
      tempId: editingParticipantId || makeTempId('participant'),
    }

    setParticipants((current) =>
      editingParticipantId
        ? current.map((participant) => (participant.tempId === editingParticipantId ? item : participant))
        : [...current, item],
    )
    setParticipantDraft(initialParticipant)
    setEditingParticipantId(null)
    setParticipantErrors({})
    setParticipantFormOpen(false)
  }

  function openActivityForm(activity = null) {
    setEditingActivityId(activity?.tempId || null)
    setActivityDraft(activity ? { ...activity } : initialActivity)
    setActivityErrors({})
    setActivityFormOpen(true)
  }

  function addOrUpdateActivity() {
    const errors = validateActivity(activityDraft)
    setActivityErrors(errors)

    if (hasErrors(errors)) {
      return
    }

    const item = {
      ...activityDraft,
      tempId: editingActivityId || makeTempId('activity'),
    }

    setActivities((current) =>
      editingActivityId
        ? current.map((activity) => (activity.tempId === editingActivityId ? item : activity))
        : [...current, item],
    )
    setActivityDraft(initialActivity)
    setEditingActivityId(null)
    setActivityErrors({})
    setActivityFormOpen(false)
  }

  function openResourceForm(resource = null) {
    setEditingResourceId(resource?.tempId || null)
    setResourceDraft(resource ? { ...resource } : initialResource)
    setResourceErrors({})
    setResourceFormOpen(true)
  }

  function addOrUpdateResource() {
    const errors = validateResource(resourceDraft)
    setResourceErrors(errors)

    if (hasErrors(errors)) {
      return
    }

    const item = {
      ...resourceDraft,
      tempId: editingResourceId || makeTempId('resource'),
    }

    setResources((current) =>
      editingResourceId
        ? current.map((resource) => (resource.tempId === editingResourceId ? item : resource))
        : [...current, item],
    )
    setResourceDraft(initialResource)
    setEditingResourceId(null)
    setResourceErrors({})
    setResourceFormOpen(false)
  }

  function openCostForm(cost = null) {
    setEditingCostId(cost?.tempId || null)
    setCostDraft(cost ? { ...cost } : initialCost)
    setCostErrors({})
    setCostFormOpen(true)
  }

  function addOrUpdateCost() {
    const errors = validateCost(costDraft)
    setCostErrors(errors)

    if (hasErrors(errors)) {
      return
    }

    const item = {
      ...costDraft,
      tempId: editingCostId || makeTempId('cost'),
    }

    setCosts((current) =>
      editingCostId
        ? current.map((cost) => (cost.tempId === editingCostId ? item : cost))
        : [...current, item],
    )
    setCostDraft(initialCost)
    setEditingCostId(null)
    setCostErrors({})
    setCostFormOpen(false)
  }

  function openRiskForm(risk = null) {
    setEditingRiskId(risk?.tempId || null)
    setRiskDraft(risk ? { ...risk } : initialRisk)
    setRiskErrors({})
    setRiskFormOpen(true)
  }

  function addOrUpdateRisk() {
    const errors = validateRisk(riskDraft)
    setRiskErrors(errors)

    if (hasErrors(errors)) {
      return
    }

    const item = {
      ...riskDraft,
      tempId: editingRiskId || makeTempId('risk'),
    }

    setRisks((current) =>
      editingRiskId
        ? current.map((risk) => (risk.tempId === editingRiskId ? item : risk))
        : [...current, item],
    )
    setRiskDraft(initialRisk)
    setEditingRiskId(null)
    setRiskErrors({})
    setRiskFormOpen(false)
  }

  function removeParticipant(tempId) {
    setParticipants((current) => current.filter((item) => item.tempId !== tempId))
    setActivities((current) =>
      current.map((activity) =>
        activity.responsavelTempId === tempId ? { ...activity, responsavelTempId: '' } : activity,
      ),
    )
  }

  function removeActivity(tempId) {
    setActivities((current) => current.filter((item) => item.tempId !== tempId))
    setCosts((current) =>
      current.map((cost) =>
        cost.atividadeTempId === tempId ? { ...cost, atividadeTempId: '' } : cost,
      ),
    )
  }

  function removeResource(tempId) {
    setResources((current) => current.filter((item) => item.tempId !== tempId))
    setCosts((current) =>
      current.map((cost) =>
        cost.recursoTempId === tempId ? { ...cost, recursoTempId: '' } : cost,
      ),
    )
  }

  function resetSaveState() {
    setSaveError('')
    setPartialProject(null)
  }

  async function runPhase(label, task) {
    try {
      await task()
    } catch (error) {
      throw new Error(`Falha ao salvar ${label}: ${apiErrorMessage(error)}`, { cause: error })
    }
  }

  async function handleSaveComplete() {
    if (projectInvalid) {
      goToStep(0)
      return
    }

    resetSaveState()
    setSaving(true)

    let createdProject = null

    try {
      createdProject = await actions.projects.create(buildProjectPayload(projectValues))
      const projetoId = projectIdValue(createdProject)
      const participantIds = new Map()
      const activityIds = new Map()
      const resourceIds = new Map()

      await runPhase('participantes', async () => {
        for (const participant of participants) {
          const saved = await actions.participants.create({
            usuarioId: payloadId(participant.usuarioId),
            projetoId,
            funcaoNoProjeto: participant.funcaoNoProjeto.trim(),
            papelAcesso: participant.papelAcesso,
            ativo: Boolean(participant.ativo),
          })
          participantIds.set(participant.tempId, entityId(saved))
        }
      })

      await runPhase('recursos', async () => {
        for (const resource of resources) {
          const saved = await actions.resources.create({
            nome: resource.nome.trim(),
            projetoId,
            tipo: resource.tipo,
            descricao: toNullableText(resource.descricao),
            quantidade: Number(resource.quantidade),
            custoUnitario: Number(resource.custoUnitario),
          })
          resourceIds.set(resource.tempId, entityId(saved))
        }
      })

      await runPhase('atividades', async () => {
        for (const activity of activities) {
          const saved = await actions.activities.create({
            titulo: activity.titulo.trim(),
            projetoId,
            responsavelId: activity.responsavelTempId
              ? payloadId(participantIds.get(activity.responsavelTempId)) || null
              : null,
            status: activity.status,
            prioridade: activity.prioridade,
            descricao: toNullableText(activity.descricao),
            dataInicio: activity.dataInicio || null,
            prazo: activity.prazo || null,
            dataConclusao: activity.dataConclusao || null,
            percentualConclusao: Number(activity.percentualConclusao),
          })
          activityIds.set(activity.tempId, entityId(saved))
        }
      })

      await runPhase('riscos', async () => {
        for (const risk of risks) {
          await actions.risks.create({
            titulo: risk.titulo.trim(),
            projetoId,
            categoria: risk.categoria,
            status: risk.status,
            descricao: toNullableText(risk.descricao),
            probabilidade: Number(risk.probabilidade),
            impacto: Number(risk.impacto),
            criticidade: Number(risk.criticidade),
            estrategiaResposta: toNullableText(risk.estrategiaResposta),
            planoMitigacao: toNullableText(risk.planoMitigacao),
          })
        }
      })

      await runPhase('custos', async () => {
        for (const cost of costs) {
          await actions.costs.create({
            descricao: cost.descricao.trim(),
            projetoId,
            tipo: cost.tipo,
            valorPrevisto: Number(cost.valorPrevisto),
            valorReal: toNullableNumber(cost.valorReal),
            dataLancamento: cost.dataLancamento || null,
            atividadeId: cost.atividadeTempId ? payloadId(activityIds.get(cost.atividadeTempId)) || null : null,
            recursoId: cost.recursoTempId ? payloadId(resourceIds.get(cost.recursoTempId)) || null : null,
          })
        }
      })

      await onSaved(createdProject)
    } catch (error) {
      const message = apiErrorMessage(error)
      setPartialProject(createdProject)
      setSaveError(
        createdProject
          ? `Salvamento parcial: o projeto foi criado, mas nem todos os vinculos foram salvos. ${message}`
          : `Nao foi possivel criar o projeto. ${message}`,
      )
    } finally {
      setSaving(false)
    }
  }

  function renderProjectStep() {
    return (
      <div className="mx-auto max-w-5xl space-y-5">
        <StepIntro
          description="Comece pelos dados que identificam o projeto. Esta etapa e obrigatoria para seguir."
          title="Dados do projeto"
        />
        <FormPanel title="Informacoes principais">
          <TextField
            error={projectErrors.nome}
            label="Nome"
            maxLength={150}
            onChange={(value) => updateProjectValue('nome', value)}
            required
            value={projectValues.nome}
          />
          <SelectField
            error={projectErrors.status}
            label="Status"
            onChange={(value) => updateProjectValue('status', value)}
            options={projectStatusOptions}
            required
            value={projectValues.status}
          />
          <SelectField
            error={projectErrors.prioridade}
            label="Prioridade"
            onChange={(value) => updateProjectValue('prioridade', value)}
            options={priorityOptions}
            required
            value={projectValues.prioridade}
          />
          <TextField
            label="Data de inicio"
            onChange={(value) => updateProjectValue('dataInicio', value)}
            type="date"
            value={projectValues.dataInicio}
          />
          <TextField
            error={projectErrors.dataFim}
            label="Data final"
            onChange={(value) => updateProjectValue('dataFim', value)}
            type="date"
            value={projectValues.dataFim}
          />
          <TextField
            error={projectErrors.orcamentoPrevisto}
            label="Orcamento previsto"
            min="0"
            onChange={(value) => updateProjectValue('orcamentoPrevisto', value)}
            step="0.01"
            type="number"
            value={projectValues.orcamentoPrevisto}
          />
          <TextField
            error={projectErrors.percentualConcluido}
            label="Percentual concluido"
            max="100"
            min="0"
            onChange={(value) => updateProjectValue('percentualConcluido', value)}
            required
            type="number"
            value={projectValues.percentualConcluido}
          />
          <TextareaField
            label="Descricao"
            maxLength={1000}
            onChange={(value) => updateProjectValue('descricao', value)}
            value={projectValues.descricao}
          />
          <TextareaField
            label="Objetivo"
            maxLength={1000}
            onChange={(value) => updateProjectValue('objetivo', value)}
            value={projectValues.objetivo}
          />
        </FormPanel>
      </div>
    )
  }

  function renderParticipantsStep() {
    return (
      <div className="mx-auto max-w-5xl space-y-5">
        <StepIntro
          actionLabel="Adicionar participante"
          count={participants.length}
          description="Monte a equipe antes de cadastrar atividades. O mesmo usuario nao pode aparecer duas vezes."
          onAction={() => openParticipantForm()}
          title="Participantes do projeto"
        />

        {participantFormOpen ? (
          <FormPanel title={editingParticipantId ? 'Editar participante' : 'Adicionar participante'}>
            <SelectField
              error={participantErrors.usuarioId}
              label="Usuario"
              onChange={(value) => setParticipantDraft((current) => ({ ...current, usuarioId: value }))}
              options={userOptions}
              required
              value={participantDraft.usuarioId}
            />
            <TextField
              error={participantErrors.funcaoNoProjeto}
              label="Funcao no projeto"
              maxLength={100}
              onChange={(value) =>
                setParticipantDraft((current) => ({ ...current, funcaoNoProjeto: value }))
              }
              required
              value={participantDraft.funcaoNoProjeto}
            />
            <SelectField
              error={participantErrors.papelAcesso}
              label="Papel de acesso"
              onChange={(value) => setParticipantDraft((current) => ({ ...current, papelAcesso: value }))}
              options={accessRoleOptions}
              required
              value={participantDraft.papelAcesso}
            />
            <BooleanField
              label="Ativo"
              onChange={(value) => setParticipantDraft((current) => ({ ...current, ativo: value }))}
              value={participantDraft.ativo}
            />
            <DraftActions
              editing={Boolean(editingParticipantId)}
              onCancel={() => {
                setEditingParticipantId(null)
                setParticipantDraft(initialParticipant)
                setParticipantErrors({})
                setParticipantFormOpen(false)
              }}
              onSubmit={addOrUpdateParticipant}
            />
          </FormPanel>
        ) : null}

        <CollectionList
          empty="Nenhum participante adicionado. Voce pode seguir sem equipe e completar depois."
          items={participants}
          renderItem={(participant) => (
            <ItemCard
              eyebrow={participant.ativo ? 'Ativo' : 'Inativo'}
              key={participant.tempId}
              meta={`${participant.funcaoNoProjeto} - ${participant.papelAcesso}`}
              onEdit={() => openParticipantForm(participant)}
              onRemove={() => removeParticipant(participant.tempId)}
              title={participantLabel(participant, users)}
            />
          )}
        />
      </div>
    )
  }

  function renderActivitiesStep() {
    return (
      <div className="mx-auto max-w-5xl space-y-5">
        <StepIntro
          actionLabel="Adicionar atividade"
          count={activities.length}
          description="Cadastre tarefas do projeto. O responsavel so pode ser um participante adicionado nesta criacao."
          onAction={() => openActivityForm()}
          title="Atividades"
        />

        {activityFormOpen ? (
          <FormPanel title={editingActivityId ? 'Editar atividade' : 'Adicionar atividade'}>
            <TextField
              error={activityErrors.titulo}
              label="Titulo"
              maxLength={150}
              onChange={(value) => setActivityDraft((current) => ({ ...current, titulo: value }))}
              required
              value={activityDraft.titulo}
            />
            <SelectField
              label="Responsavel"
              onChange={(value) =>
                setActivityDraft((current) => ({ ...current, responsavelTempId: value }))
              }
              options={participantOptions}
              placeholder="Sem responsavel"
              value={activityDraft.responsavelTempId}
            />
            <SelectField
              error={activityErrors.status}
              label="Status"
              onChange={(value) => setActivityDraft((current) => ({ ...current, status: value }))}
              options={activityStatusOptions}
              required
              value={activityDraft.status}
            />
            <SelectField
              error={activityErrors.prioridade}
              label="Prioridade"
              onChange={(value) => setActivityDraft((current) => ({ ...current, prioridade: value }))}
              options={priorityOptions}
              required
              value={activityDraft.prioridade}
            />
            <TextField
              label="Data de inicio"
              onChange={(value) => setActivityDraft((current) => ({ ...current, dataInicio: value }))}
              type="date"
              value={activityDraft.dataInicio}
            />
            <TextField
              label="Prazo"
              onChange={(value) => setActivityDraft((current) => ({ ...current, prazo: value }))}
              type="date"
              value={activityDraft.prazo}
            />
            <TextField
              label="Data de conclusao"
              onChange={(value) =>
                setActivityDraft((current) => ({ ...current, dataConclusao: value }))
              }
              type="date"
              value={activityDraft.dataConclusao}
            />
            <TextField
              error={activityErrors.percentualConclusao}
              label="Percentual de conclusao"
              max="100"
              min="0"
              onChange={(value) =>
                setActivityDraft((current) => ({ ...current, percentualConclusao: value }))
              }
              required
              type="number"
              value={activityDraft.percentualConclusao}
            />
            <TextareaField
              label="Descricao"
              maxLength={1000}
              onChange={(value) => setActivityDraft((current) => ({ ...current, descricao: value }))}
              value={activityDraft.descricao}
            />
            <DraftActions
              editing={Boolean(editingActivityId)}
              onCancel={() => {
                setEditingActivityId(null)
                setActivityDraft(initialActivity)
                setActivityErrors({})
                setActivityFormOpen(false)
              }}
              onSubmit={addOrUpdateActivity}
            />
          </FormPanel>
        ) : null}

        <CollectionList
          empty="Nenhuma atividade adicionada. As atividades podem ser cadastradas agora ou depois."
          items={activities}
          renderItem={(activity) => (
            <ItemCard
              eyebrow={activity.status}
              key={activity.tempId}
              meta={[activity.prioridade, activity.prazo].filter(Boolean).join(' - ')}
              onEdit={() => openActivityForm(activity)}
              onRemove={() => removeActivity(activity.tempId)}
              title={activity.titulo}
            />
          )}
        />
      </div>
    )
  }

  function renderResourcesStep() {
    return (
      <div className="mx-auto max-w-5xl space-y-5">
        <StepIntro
          actionLabel="Adicionar recurso"
          count={resources.length}
          description="Registre recursos humanos, materiais, tecnologicos, financeiros ou servicos."
          onAction={() => openResourceForm()}
          title="Recursos"
        />

        {resourceFormOpen ? (
          <FormPanel title={editingResourceId ? 'Editar recurso' : 'Adicionar recurso'}>
            <TextField
              error={resourceErrors.nome}
              label="Nome"
              maxLength={120}
              onChange={(value) => setResourceDraft((current) => ({ ...current, nome: value }))}
              required
              value={resourceDraft.nome}
            />
            <SelectField
              error={resourceErrors.tipo}
              label="Tipo"
              onChange={(value) => setResourceDraft((current) => ({ ...current, tipo: value }))}
              options={resourceTypeOptions}
              required
              value={resourceDraft.tipo}
            />
            <TextField
              error={resourceErrors.quantidade}
              label="Quantidade"
              min="1"
              onChange={(value) => setResourceDraft((current) => ({ ...current, quantidade: value }))}
              required
              type="number"
              value={resourceDraft.quantidade}
            />
            <TextField
              error={resourceErrors.custoUnitario}
              label="Custo unitario"
              min="0"
              onChange={(value) =>
                setResourceDraft((current) => ({ ...current, custoUnitario: value }))
              }
              required
              step="0.01"
              type="number"
              value={resourceDraft.custoUnitario}
            />
            <TextareaField
              label="Descricao"
              maxLength={1000}
              onChange={(value) => setResourceDraft((current) => ({ ...current, descricao: value }))}
              value={resourceDraft.descricao}
            />
            <DraftActions
              editing={Boolean(editingResourceId)}
              onCancel={() => {
                setEditingResourceId(null)
                setResourceDraft(initialResource)
                setResourceErrors({})
                setResourceFormOpen(false)
              }}
              onSubmit={addOrUpdateResource}
            />
          </FormPanel>
        ) : null}

        <CollectionList
          empty="Nenhum recurso adicionado. Voce pode salvar sem recursos e completar depois."
          items={resources}
          renderItem={(resource) => (
            <ItemCard
              eyebrow={resource.tipo}
              key={resource.tempId}
              meta={`${resource.quantidade || 0} un. - custo ${resource.custoUnitario || 0}`}
              onEdit={() => openResourceForm(resource)}
              onRemove={() => removeResource(resource.tempId)}
              title={resource.nome}
            />
          )}
        />
      </div>
    )
  }

  function renderCostsStep() {
    return (
      <div className="mx-auto max-w-5xl space-y-5">
        <StepIntro
          actionLabel="Adicionar custo"
          count={costs.length}
          description="Custos podem ficar direto no projeto ou vinculados a atividades e recursos desta criacao."
          onAction={() => openCostForm()}
          title="Custos"
        />

        {costFormOpen ? (
          <FormPanel title={editingCostId ? 'Editar custo' : 'Adicionar custo'}>
            <TextField
              error={costErrors.descricao}
              label="Descricao"
              maxLength={255}
              onChange={(value) => setCostDraft((current) => ({ ...current, descricao: value }))}
              required
              value={costDraft.descricao}
            />
            <SelectField
              error={costErrors.tipo}
              label="Tipo"
              onChange={(value) => setCostDraft((current) => ({ ...current, tipo: value }))}
              options={costTypeOptions}
              required
              value={costDraft.tipo}
            />
            <TextField
              error={costErrors.valorPrevisto}
              label="Valor previsto"
              min="0"
              onChange={(value) => setCostDraft((current) => ({ ...current, valorPrevisto: value }))}
              required
              step="0.01"
              type="number"
              value={costDraft.valorPrevisto}
            />
            <TextField
              error={costErrors.valorReal}
              label="Valor real"
              min="0"
              onChange={(value) => setCostDraft((current) => ({ ...current, valorReal: value }))}
              step="0.01"
              type="number"
              value={costDraft.valorReal}
            />
            <TextField
              label="Data de lancamento"
              onChange={(value) => setCostDraft((current) => ({ ...current, dataLancamento: value }))}
              type="date"
              value={costDraft.dataLancamento}
            />
            <SelectField
              label="Atividade"
              onChange={(value) => setCostDraft((current) => ({ ...current, atividadeTempId: value }))}
              options={activityOptions}
              placeholder="Sem atividade"
              value={costDraft.atividadeTempId}
            />
            <SelectField
              label="Recurso"
              onChange={(value) => setCostDraft((current) => ({ ...current, recursoTempId: value }))}
              options={resourceOptions}
              placeholder="Sem recurso"
              value={costDraft.recursoTempId}
            />
            <DraftActions
              editing={Boolean(editingCostId)}
              onCancel={() => {
                setEditingCostId(null)
                setCostDraft(initialCost)
                setCostErrors({})
                setCostFormOpen(false)
              }}
              onSubmit={addOrUpdateCost}
            />
          </FormPanel>
        ) : null}

        <CollectionList
          empty="Nenhum custo adicionado. Custos podem ser vinculados ao projeto, atividade ou recurso."
          items={costs}
          renderItem={(cost) => (
            <ItemCard
              eyebrow={cost.tipo}
              key={cost.tempId}
              meta={`Previsto ${cost.valorPrevisto || 0}${cost.valorReal ? ` - real ${cost.valorReal}` : ''}`}
              onEdit={() => openCostForm(cost)}
              onRemove={() => setCosts((current) => current.filter((item) => item.tempId !== cost.tempId))}
              title={cost.descricao}
            />
          )}
        />
      </div>
    )
  }

  function renderRisksStep() {
    return (
      <div className="mx-auto max-w-5xl space-y-5">
        <StepIntro
          actionLabel="Adicionar risco"
          count={risks.length}
          description="Registre riscos com categoria, status, criticidade e estrategia de resposta."
          onAction={() => openRiskForm()}
          title="Riscos"
        />

        {riskFormOpen ? (
          <FormPanel title={editingRiskId ? 'Editar risco' : 'Adicionar risco'}>
            <TextField
              error={riskErrors.titulo}
              label="Titulo"
              maxLength={150}
              onChange={(value) => setRiskDraft((current) => ({ ...current, titulo: value }))}
              required
              value={riskDraft.titulo}
            />
            <SelectField
              error={riskErrors.categoria}
              label="Categoria"
              onChange={(value) => setRiskDraft((current) => ({ ...current, categoria: value }))}
              options={riskCategoryOptions}
              required
              value={riskDraft.categoria}
            />
            <SelectField
              error={riskErrors.status}
              label="Status"
              onChange={(value) => setRiskDraft((current) => ({ ...current, status: value }))}
              options={riskStatusOptions}
              required
              value={riskDraft.status}
            />
            <TextField
              error={riskErrors.probabilidade}
              label="Probabilidade"
              max="5"
              min="1"
              onChange={(value) => setRiskDraft((current) => ({ ...current, probabilidade: value }))}
              required
              type="number"
              value={riskDraft.probabilidade}
            />
            <TextField
              error={riskErrors.impacto}
              label="Impacto"
              max="5"
              min="1"
              onChange={(value) => setRiskDraft((current) => ({ ...current, impacto: value }))}
              required
              type="number"
              value={riskDraft.impacto}
            />
            <TextField
              error={riskErrors.criticidade}
              label="Criticidade"
              max="25"
              min="1"
              onChange={(value) => setRiskDraft((current) => ({ ...current, criticidade: value }))}
              required
              type="number"
              value={riskDraft.criticidade}
            />
            <TextareaField
              label="Descricao"
              maxLength={1000}
              onChange={(value) => setRiskDraft((current) => ({ ...current, descricao: value }))}
              value={riskDraft.descricao}
            />
            <TextareaField
              label="Estrategia de resposta"
              maxLength={500}
              onChange={(value) =>
                setRiskDraft((current) => ({ ...current, estrategiaResposta: value }))
              }
              value={riskDraft.estrategiaResposta}
            />
            <TextareaField
              label="Plano de mitigacao"
              maxLength={1000}
              onChange={(value) =>
                setRiskDraft((current) => ({ ...current, planoMitigacao: value }))
              }
              value={riskDraft.planoMitigacao}
            />
            <DraftActions
              editing={Boolean(editingRiskId)}
              onCancel={() => {
                setEditingRiskId(null)
                setRiskDraft(initialRisk)
                setRiskErrors({})
                setRiskFormOpen(false)
              }}
              onSubmit={addOrUpdateRisk}
            />
          </FormPanel>
        ) : null}

        <CollectionList
          empty="Nenhum risco adicionado. Voce pode registrar riscos agora ou depois."
          items={risks}
          renderItem={(risk) => (
            <ItemCard
              eyebrow={risk.status}
              key={risk.tempId}
              meta={`${risk.categoria} - criticidade ${risk.criticidade}`}
              onEdit={() => openRiskForm(risk)}
              onRemove={() => setRisks((current) => current.filter((item) => item.tempId !== risk.tempId))}
              title={risk.titulo}
            />
          )}
        />
      </div>
    )
  }

  function renderReviewStep() {
    const reviewItems = [
      ['Participantes', participants.length],
      ['Atividades', activities.length],
      ['Recursos', resources.length],
      ['Custos', costs.length],
      ['Riscos', risks.length],
    ]

    return (
      <div className="mx-auto max-w-6xl space-y-5">
        <StepIntro
          description="Confira os dados antes de iniciar a sequencia de chamadas para a API."
          title="Revisao final"
        />

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {reviewItems.map(([label, count]) => (
            <div
              key={label}
              className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-400">
                {label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
                {count}
              </p>
            </div>
          ))}
        </section>

        <div className="grid gap-4 xl:grid-cols-2">
          <ReviewCard onEdit={() => goToStep(0)} title="Projeto">
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-400">
                  Nome
                </dt>
                <dd className="mt-1 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                  {projectValues.nome || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-400">
                  Status / prioridade
                </dt>
                <dd className="mt-1 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                  {projectValues.status} / {projectValues.prioridade}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-400">
                  Prazo
                </dt>
                <dd className="mt-1 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                  {projectValues.dataFim || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-400">
                  Orcamento
                </dt>
                <dd className="mt-1 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                  {projectValues.orcamentoPrevisto || '-'}
                </dd>
              </div>
            </dl>
          </ReviewCard>

          <ReviewCard count={participants.length} onEdit={() => goToStep(1)} title="Participantes">
            <MiniList
              empty="Nenhum participante adicionado."
              items={participants}
              renderItem={(participant) => (
                <p key={participant.tempId} className="text-sm text-zinc-700 dark:text-zinc-200">
                  {participantLabel(participant, users)} - {participant.funcaoNoProjeto}
                </p>
              )}
            />
          </ReviewCard>

          <ReviewCard count={activities.length} onEdit={() => goToStep(2)} title="Atividades">
            <MiniList
              empty="Nenhuma atividade adicionada."
              items={activities}
              renderItem={(activity) => (
                <p key={activity.tempId} className="text-sm text-zinc-700 dark:text-zinc-200">
                  {activity.titulo} - {activity.status}
                </p>
              )}
            />
          </ReviewCard>

          <ReviewCard count={resources.length} onEdit={() => goToStep(3)} title="Recursos">
            <MiniList
              empty="Nenhum recurso adicionado."
              items={resources}
              renderItem={(resource) => (
                <p key={resource.tempId} className="text-sm text-zinc-700 dark:text-zinc-200">
                  {resource.nome} - {resource.tipo}
                </p>
              )}
            />
          </ReviewCard>

          <ReviewCard count={costs.length} onEdit={() => goToStep(4)} title="Custos">
            <MiniList
              empty="Nenhum custo adicionado."
              items={costs}
              renderItem={(cost) => (
                <p key={cost.tempId} className="text-sm text-zinc-700 dark:text-zinc-200">
                  {cost.descricao} - {cost.tipo}
                </p>
              )}
            />
          </ReviewCard>

          <ReviewCard count={risks.length} onEdit={() => goToStep(5)} title="Riscos">
            <MiniList
              empty="Nenhum risco adicionado."
              items={risks}
              renderItem={(risk) => (
                <p key={risk.tempId} className="text-sm text-zinc-700 dark:text-zinc-200">
                  {risk.titulo} - criticidade {risk.criticidade}
                </p>
              )}
            />
          </ReviewCard>
        </div>
      </div>
    )
  }

  function renderStep() {
    if (activeStep === 0) return renderProjectStep()
    if (activeStep === 1) return renderParticipantsStep()
    if (activeStep === 2) return renderActivitiesStep()
    if (activeStep === 3) return renderResourcesStep()
    if (activeStep === 4) return renderCostsStep()
    if (activeStep === 5) return renderRisksStep()
    return renderReviewStep()
  }

  const primaryDisabled = saving || (activeStep === 0 && projectInvalid)

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/45 backdrop-blur-sm sm:p-4">
      <section
        aria-labelledby="project-wizard-title"
        aria-modal="true"
        className="mx-auto flex h-screen w-full max-w-7xl flex-col overflow-hidden border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 sm:h-[calc(100vh-2rem)] sm:rounded-3xl"
        role="dialog"
      >
        <header className="shrink-0 border-b border-zinc-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="project-wizard-title" className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
                Novo projeto completo
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Cadastre o projeto e seus vinculos em um fluxo guiado.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="grid h-10 w-10 place-items-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
              aria-label="Fechar"
            >
              <Icon name="close" className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-5">
            <Stepper
              activeStep={activeStep}
              maxVisitedStep={maxVisitedStep}
              onSelect={goToStep}
              stepErrors={stepErrors}
            />
          </div>
        </header>

        <main className="thin-scrollbar min-h-0 flex-1 overflow-y-auto bg-zinc-50 p-5 dark:bg-zinc-950 sm:p-6">
          {saveError ? (
            <div
              className="mx-auto mb-5 max-w-5xl rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-100"
              role="alert"
            >
              <p className="font-semibold">Nao foi possivel concluir o salvamento.</p>
              <p className="mt-1">{saveError}</p>
              {partialProject ? (
                <button
                  type="button"
                  onClick={() => onSaved(partialProject)}
                  className="mt-3 inline-flex h-9 items-center justify-center rounded-xl border border-rose-200 bg-white px-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-200"
                >
                  Abrir projeto criado
                </button>
              ) : null}
            </div>
          ) : null}

          {renderStep()}
        </main>

        <footer className="shrink-0 border-t border-zinc-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Cancelar
            </button>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => goToStep(Math.max(activeStep - 1, 0))}
                disabled={saving || activeStep === 0}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Voltar
              </button>
              {activeStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={primaryDisabled}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                >
                  Avancar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveComplete}
                  disabled={saving || projectInvalid}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                >
                  {saving ? 'Salvando...' : 'Salvar projeto completo'}
                </button>
              )}
            </div>
          </div>
        </footer>
      </section>
    </div>
  )
}
