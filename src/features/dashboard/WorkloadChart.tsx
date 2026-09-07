import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/EmptyState'
import type { WorkloadByProject } from '@/types'

const COLORS = ['#2563eb', '#0d9488', '#d97706', '#7c3aed', '#db2777', '#65a30d', '#0891b2', '#dc2626']

export function WorkloadChart({ data, isLoading }: { data?: WorkloadByProject[]; isLoading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workload by project</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : !data || data.length === 0 ? (
          <EmptyState title="No data" description="No tasks logged for the selected filters." />
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="taskCount"
                  nameKey="projectName"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {data.map((entry, i) => (
                    <Cell key={entry.projectId} fill={COLORS[i % COLORS.length]} />
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
