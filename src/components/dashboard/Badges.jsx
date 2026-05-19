import { formatLabel, priorityTone, statusTone } from '../../utils/format'

const baseClass =
  'inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1'

export function StatusBadge({ value }) {
  return <span className={`${baseClass} ${statusTone(value)}`}>{formatLabel(value)}</span>
}

export function PriorityBadge({ value }) {
  return <span className={`${baseClass} ${priorityTone(value)}`}>{formatLabel(value)}</span>
}
