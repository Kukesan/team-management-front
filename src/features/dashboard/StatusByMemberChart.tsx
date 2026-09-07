import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/EmptyState'
import type { StatusByMember } from '@/types'

const SEGMENTS: { key: keyof StatusByMember; label: string; color: string }[] = [
  { key: 'draft', label: 'Draft', color: '#cbd5e1' },
  { key: 'submitted', label: 'Submitted', color: '#60a5fa' },
  { key: 'needsCorrection', label: 'Needs Correction', color: '#f59e0b' },
  { key: 'approved', label: 'Approved', color: '#10b981' },
]

export function StatusByMemberChart({ data, isLoading }: { data?: StatusByMember[]; isLoading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Submission status by team member</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : !data || data.length === 0 ? (
          <EmptyState title="No data" description="No reports for the selected filters." />
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="userName" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, borderColor: '#e2e8f0', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {SEGMENTS.map((s) => (
                  <Bar key={s.key} dataKey={s.key} name={s.label} stackId="status" fill={s.color} radius={0} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
