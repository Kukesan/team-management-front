import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { TaskType } from '@/types'

const COLORS: Record<TaskType, string> = {
  Development: '#2563eb',
  Testing: '#0d9488',
  Meetings: '#d97706',
  Documentation: '#7c3aed',
  CodeReview: '#db2777',
  Support: '#ea580c',
  Training: '#65a30d',
  Other: '#64748b',
}

export interface HoursBreakdownChartEntry {
  taskType: TaskType
  hours: number
}

export function HoursBreakdownChart({ entries }: { entries: HoursBreakdownChartEntry[] }) {
  const data = entries
    .filter((e) => e.hours > 0)
    .map((e) => ({ name: e.taskType, hours: Number(e.hours) || 0, fill: COLORS[e.taskType] }))

  if (data.length === 0) {
    return <p className="text-sm text-slate-400">Enter hours above to preview the breakdown.</p>
  }

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: '#f1f5f9' }}
            contentStyle={{ borderRadius: 8, borderColor: '#e2e8f0', fontSize: 12 }}
            formatter={(value) => [`${value}h`, 'Hours']}
          />
          <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
