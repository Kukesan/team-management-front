import { Badge } from '@/components/ui/badge'
import type { ReportStatus } from '@/types'

const STATUS_CONFIG: Record<ReportStatus, { label: string; variant: 'default' | 'brand' | 'success' | 'warning' | 'danger' }> = {
  Draft: { label: 'Draft', variant: 'default' },
  Submitted: { label: 'Submitted', variant: 'brand' },
  NeedsCorrection: { label: 'Needs Correction', variant: 'warning' },
  Approved: { label: 'Approved', variant: 'success' },
}

export function StatusBadge({ status }: { status: ReportStatus }) {
  const config = STATUS_CONFIG[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
