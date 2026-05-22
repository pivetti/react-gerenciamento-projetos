import { useEffect, useState } from 'react'

export function useLongRequestFeedback(active) {
  const [level, setLevel] = useState(0)

  useEffect(() => {
    if (!active) {
      return undefined
    }

    const resetTimer = window.setTimeout(() => {
      setLevel(0)
    }, 0)
    const preparingTimer = window.setTimeout(() => {
      setLevel(1)
    }, 3_000)
    const apiStartingTimer = window.setTimeout(() => {
      setLevel(2)
    }, 15_000)

    return () => {
      window.clearTimeout(resetTimer)
      window.clearTimeout(preparingTimer)
      window.clearTimeout(apiStartingTimer)
    }
  }, [active])

  if (!active) {
    return ''
  }

  if (level === 2) {
    return 'A API pode estar iniciando. Aguarde mais um pouco.'
  }

  if (level === 1) {
    return 'Preparando servidor, isso pode levar alguns segundos...'
  }

  return ''
}
