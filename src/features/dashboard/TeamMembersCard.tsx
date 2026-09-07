import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/EmptyState'
import type { StatusByMember } from '@/types'

export function TeamMembersCard({ data, isLoading }: { data?: StatusByMember[]; isLoading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team members</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : !data || data.length === 0 ? (
          <EmptyState title="No team members" description="No members match the current filters." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {data.map((member) => (
              <li key={member.userId}>
                <Link
                  to={`/dashboard/members/${member.userId}`}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-brand-600"
                >
                  <span className="font-medium text-slate-900">{member.userName}</span>
                  <span className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{member.approved} approved</span>
                    <span>{member.needsCorrection} needs correction</span>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
