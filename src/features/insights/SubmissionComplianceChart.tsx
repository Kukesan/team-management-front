import { useMemo } from 'react'
import { isPast, parseISO } from 'date-fns'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { StatusByMemberResponse, User } from '@/types'

type Bucket = 'Submitted' | 'In Progress' | 'Late' | 'Not Started'

const BUCKET_COLOR: Record<Bucket, string> = {
  Submitted: '#059669',
  'In Progress': '#d97706',
  Late: '#dc2626',
  'Not Started': '#94a3b8',
}

function categorize(statusRow: StatusByMemberResponse | undefined, weekIsOver: boolean): Bucket {
  const reports = statusRow?.reports ?? []
  if (reports.some((r) => r.status === 'Submitted' || r.status === 'NeedsCorrection' || r.status === 'Approved')) {
    return 'Submitted'
  }
  if (reports.some((r) => r.status === 'Draft')) return 'In Progress'
  return weekIsOver ? 'Late' : 'Not Started'
}

export function SubmissionComplianceChart({
  members,
  statusRows,
  weekEndDate,
  isLoading,
}: {
  members: User[]
  statusRows?: StatusByMemberResponse[]
  weekEndDate: string
  isLoading: boolean
}) {
  const data = useMemo(() => {
    const weekIsOver = (() => {
      try {
        return isPast(parseISO(weekEndDate))
      } catch {
        return false
      }
    })()
    const counts: Record<Bucket, number> = { Submitted: 0, 'In Progress': 0, Late: 0, 'Not Started': 0 }
    for (const member of members) {
      const bucket = categorize(statusRows?.find((r) => r.userId === member.id), weekIsOver)
      counts[bucket] += 1
    }
    return (Object.keys(counts) as Bucket[])
      .filter((bucket) => counts[bucket] > 0)
      .map((bucket) => ({ name: bucket, value: counts[bucket] }))
  }, [members, statusRows, weekEndDate])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submission compliance</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-56 w-full" />
        ) : data.length === 0 ? (
          <p className="text-sm text-slate-400">No team members to report on.</p>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={BUCKET_COLOR[entry.name as Bucket]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, borderColor: '#e2e8f0', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
