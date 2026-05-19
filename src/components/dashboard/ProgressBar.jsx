import { formatPercent } from '../../utils/format'

export function ProgressBar({ value }) {
  return (
    <div className="flex min-w-[120px] items-center gap-3">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className="h-full rounded-full bg-zinc-950 transition-all dark:bg-zinc-100"
          style={{ width: formatPercent(value) }}
        />
      </div>
      <span className="w-9 text-right text-xs font-semibold text-zinc-500 dark:text-zinc-400">
        {formatPercent(value)}
      </span>
    </div>
  )
}
