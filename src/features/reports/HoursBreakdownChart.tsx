import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { HoursByType } from '@/types'

const COLORS: Record<keyof HoursByType, string> = {
  development: '#2563eb',
  testing: '#0d9488',
  meetings: '#d97706',
  documentation: '#7c3aed',
}

const LABELS: Record<keyof HoursByType, string> = {
  development: 'Development',
  testing: 'Testing',
  meetings: 'Meetings',
  documentation: 'Documentation',
}

export function HoursBreakdownChart({ hours }: { hours: HoursByType }) {
  const data = (Object.keys(LABELS) as (keyof HoursByType)[]).map((key) => ({
    name: LABELS[key],
    hours: Number(hours[key]) || 0,
    fill: COLORS[key],
  }))

  const total = data.reduce((sum, d) => sum + d.hours, 0)

  if (total === 0) {
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
