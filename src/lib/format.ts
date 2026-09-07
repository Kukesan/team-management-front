import { format, formatDistanceToNow, parseISO } from 'date-fns'

export function formatDate(iso: string, pattern = 'MMM d, yyyy'): string {
  try {
    return format(parseISO(iso), pattern)
  } catch {
    return iso
  }
}

export function formatDateRange(startIso: string, endIso: string): string {
  try {
    const start = parseISO(startIso)
    const end = parseISO(endIso)
    return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`
  } catch {
    return `${startIso} – ${endIso}`
  }
}

export function formatRelative(iso: string): string {
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true })
  } catch {
    return iso
  }
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}

export function formatHours(value: number): string {
  return `${value % 1 === 0 ? value : value.toFixed(1)}h`
}

/** "NotStarted" -> "Not Started" */
export function formatEnumLabel(value: string): string {
  return value.replace(/([a-z])([A-Z])/g, '$1 $2')
}
