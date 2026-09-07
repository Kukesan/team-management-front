import { CheckCircle2, RotateCcw, Send } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/EmptyState'
import { formatRelative } from '@/lib/format'
import type { ActivityItem } from '@/types'

const ICONS: Record<ActivityItem['type'], typeof Send> = {
  Submission: Send,
  Approval: CheckCircle2,
  RequestChanges: RotateCcw,
}

const ICON_COLOR: Record<ActivityItem['type'], string> = {
  Submission: 'text-brand-600 bg-brand-50',
  Approval: 'text-emerald-600 bg-emerald-50',
  RequestChanges: 'text-amber-600 bg-amber-50',
}

export function ActivityFeed({ items, isLoading }: { items?: ActivityItem[]; isLoading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : !items || items.length === 0 ? (
          <EmptyState title="No recent activity" description="Submissions and reviews will show up here." />
        ) : (
          <ul className="space-y-3">
            {items.map((item) => {
              const Icon = ICONS[item.type]
              return (
                <li key={item.id} className="flex items-start gap-3">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${ICON_COLOR[item.type]}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-700">
                      <span className="font-medium text-slate-900">{item.userName}</span> {item.message}
                    </p>
                    <p className="text-xs text-slate-400">
                      {item.projectName} &middot; {formatRelative(item.createdAt)}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
