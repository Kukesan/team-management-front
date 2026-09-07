import { Link } from 'react-router-dom'
import { AlertTriangle, ShieldOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  title: string
  description: string
  icon?: 'forbidden' | 'notfound'
}

export function ErrorState({ title, description, icon = 'notfound' }: ErrorStateProps) {
  const Icon = icon === 'forbidden' ? ShieldOff : AlertTriangle

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
      <Icon className="h-10 w-10 text-slate-300" />
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      <p className="max-w-sm text-sm text-slate-500">{description}</p>
      <Button asChild className="mt-2">
        <Link to="/">Back to dashboard</Link>
      </Button>
    </div>
  )
}

export function NotFoundPage() {
  return (
    <ErrorState
      icon="notfound"
      title="Page not found"
      description="The page you're looking for doesn't exist or may have been moved."
    />
  )
}

export function ForbiddenPage() {
  return (
    <ErrorState
      icon="forbidden"
      title="You don't have access to this page"
      description="This area is restricted to managers and admins. If you think this is a mistake, contact your manager."
    />
  )
}
