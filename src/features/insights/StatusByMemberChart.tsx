import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { ReportStatus, StatusByMemberResponse, User } from '@/types'

const STATUS_COLOR: Record<ReportStatus, string> = {
  Draft: '#94a3b8',
  Submitted: '#2563eb',
  NeedsCorrection: '#d97706',
  Approved: '#059669',
}

const STATUS_LABEL: Record<ReportStatus, string> = {
  Draft: 'Draft',
  Submitted: 'Submitted',
  NeedsCorrection: 'Needs Correction',
  Approved: 'Approved',
}

const STATUSES: ReportStatus[] = ['Draft', 'Submitted', 'NeedsCorrection', 'Approved']

export function StatusByMemberChart({
  members,
  statusRows,
  isLoading,
}: {
  members: User[]
  statusRows?: StatusByMemberResponse[]
  isLoading: boolean
}) {
  const data = useMemo(
    () =>
      members.map((member) => {
        const reports = statusRows?.find((r) => r.userId === member.id)?.reports ?? []
        const counts: Record<ReportStatus, number> = { Draft: 0, Submitted: 0, NeedsCorrection: 0, Approved: 0 }
        for (const report of reports) counts[report.status] += 1
        return { name: member.name, ...counts }
      }),
    [members, statusRows],
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submission status by team member</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-56 w-full" />
        ) : data.length === 0 ? (
          <p className="text-sm text-slate-400">No team members to report on.</p>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, borderColor: '#e2e8f0', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} formatter={(value: string) => STATUS_LABEL[value as ReportStatus]} />
                {STATUSES.map((status) => (
                  <Bar key={status} dataKey={status} stackId="status" fill={STATUS_COLOR[status]} radius={[2, 2, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
