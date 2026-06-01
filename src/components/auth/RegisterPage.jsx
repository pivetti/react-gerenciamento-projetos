import { useState } from 'react'
import { registerUser } from '../../services/api'
import { useLongRequestFeedback } from '../../hooks/useLongRequestFeedback'
import { Icon } from '../ui/Icon'

const profileOptions = [
  { value: 'ADMINISTRADOR', label: 'Administrador' },
  { value: 'GERENTE_PROJETO', label: 'Gerente de projeto' },
  { value: 'ANALISTA', label: 'Analista' },
  { value: 'MEMBRO_EQUIPE', label: 'Membro da equipe' },
  { value: 'STAKEHOLDER', label: 'Stakeholder' },
]

const initialValues = {
  nome: '',
  email: '',
  senha: '',
  telefone: '',
  perfil: '',
}

const inputClass =
  'mt-2 h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#cdbbf8] focus:ring-4 focus:ring-[#efe8ff] dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-[#7c5ac4] dark:focus:ring-[#7c5ac4]/20'

function FieldError({ message }) {
  if (!message) {
    return null
  }

  return <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-300">{message}</p>
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function getPhoneDigits(value) {
  return value.replace(/\D/g, '').slice(0, 11)
}

function formatPhone(value) {
  const digits = getPhoneDigits(value)

  if (!digits) {
    return ''
  }

  if (digits.length <= 2) {
    return `(${digits}`
  }

  const areaCode = digits.slice(0, 2)

  if (digits.length <= 6) {
    return `(${areaCode}) ${digits.slice(2)}`
  }

  if (digits.length <= 10) {
    return `(${areaCode}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }

  return `(${areaCode}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

function validate(values) {
  const errors = {}
  const email = values.email.trim()
  const phoneDigits = getPhoneDigits(values.telefone)
  const profile = values.perfil.trim().toUpperCase()

  if (!values.nome.trim()) {
    errors.nome = 'Nome e obrigatorio.'
  }

  if (!email) {
    errors.email = 'Email e obrigatorio.'
  } else if (!isValidEmail(email)) {
    errors.email = 'Informe um email valido com @ e ponto.'
  }

  if (!values.senha) {
    errors.senha = 'Senha e obrigatoria.'
  } else if (values.senha.length < 6) {
    errors.senha = 'Senha deve ter pelo menos 6 caracteres.'
  }

  if (!profile) {
    errors.perfil = 'Perfil e obrigatorio.'
  } else if (!profileOptions.some((option) => option.value === profile)) {
    errors.perfil = 'Selecione um perfil valido.'
  }

  if (phoneDigits && phoneDigits.length < 10) {
    errors.telefone = 'Telefone deve ter DDD e 8 ou 9 digitos.'
  }

  return errors
}

export function RegisterPage({ onGoToLogin, onRegistered }) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const longRequestMessage = useLongRequestFeedback(submitting)

  function updateValue(field, value) {
    setValues((current) => ({ ...current, [field]: value }))
    setSubmitError('')

    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: '' }))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (submitting) {
      return
    }

    const nextErrors = validate(values)
    setErrors(nextErrors)

    if (Object.values(nextErrors).some(Boolean)) {
      return
    }

    setSubmitting(true)

    try {
      const phoneDigits = getPhoneDigits(values.telefone)

      await registerUser({
        nome: values.nome.trim(),
        email: values.email.trim(),
        senha: values.senha,
        telefone: phoneDigits || null,
        perfil: values.perfil.trim().toUpperCase(),
      })
      setValues(initialValues)
      onRegistered('Cadastro criado com sucesso. Entre com seu email e senha.')
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel cadastrar o usuario. Tente novamente.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-3 py-6 text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-zinc-50 sm:px-4 sm:py-12">
      <div className="mx-auto flex min-h-[calc(100dvh-3rem)] max-w-6xl items-center justify-center sm:min-h-[calc(100vh-4rem)]">
        <section className="w-full max-w-lg">
          <div className="mb-6 text-center">
            <div className="projecthub-brand text-3xl text-zinc-950 dark:text-zinc-50">
              ProjectHub.
            </div>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Gerenciamento de projetos
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-7">
            <div>
              <p className="text-sm font-medium text-[#6b4fa0] dark:text-[#d8c9ff]">
                Primeiro acesso
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
                Criar conta
              </h1>
              <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                O cadastro envia os dados para a API em POST /usuarios.
              </p>
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

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 sm:col-span-2">
                  Nome *
                  <input
                    autoComplete="name"
                    className={inputClass}
                    disabled={submitting}
                    onChange={(event) => updateValue('nome', event.target.value)}
                    type="text"
                    value={values.nome}
                  />
                  <FieldError message={errors.nome} />
                </label>

                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 sm:col-span-2">
                  Email *
                  <input
                    autoComplete="email"
                    className={inputClass}
                    disabled={submitting}
                    onChange={(event) => updateValue('email', event.target.value)}
                    type="email"
                    value={values.email}
                  />
                  <FieldError message={errors.email} />
                </label>

                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
                  Senha *
                  <input
                    autoComplete="new-password"
                    className={inputClass}
                    disabled={submitting}
                    onChange={(event) => updateValue('senha', event.target.value)}
                    type="password"
                    value={values.senha}
                  />
                  <FieldError message={errors.senha} />
                </label>

                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
                  Telefone
                  <input
                    autoComplete="tel"
                    className={inputClass}
                    disabled={submitting}
                    inputMode="numeric"
                    maxLength={15}
                    onChange={(event) => updateValue('telefone', formatPhone(event.target.value))}
                    placeholder="(11) 99999-9999"
                    type="tel"
                    value={values.telefone}
                  />
                  <FieldError message={errors.telefone} />
                </label>

                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 sm:col-span-2">
                  Perfil *
                  <select
                    className={inputClass}
                    disabled={submitting}
                    onChange={(event) => updateValue('perfil', event.target.value)}
                    value={values.perfil}
                  >
                    <option value="">Selecione</option>
                    {profileOptions.map((profile) => (
                      <option key={profile.value} value={profile.value}>
                        {profile.label}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.perfil} />
                </label>
              </div>

              <button
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                disabled={submitting}
                type="submit"
              >
                <Icon name="userPlus" className="h-4 w-4" />
                {submitting ? 'Criando conta...' : 'Criar conta'}
              </button>

              {longRequestMessage ? (
                <div
                  className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100"
                  role="status"
                  aria-live="polite"
                >
                  {longRequestMessage}
                </div>
              ) : null}
            </form>

            <div className="mt-5 border-t border-zinc-100 pt-5 text-center dark:border-zinc-800">
              <button
                className="text-sm font-semibold text-[#5d428e] transition hover:text-[#3f2a64] dark:text-[#d8c9ff] dark:hover:text-white"
                disabled={submitting}
                onClick={onGoToLogin}
                type="button"
              >
                Já tenho conta
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
