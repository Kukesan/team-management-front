import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  ClipboardList,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Sparkles,
  User as UserIcon,
  Users as UsersIcon,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth, useRole } from '@/hooks/useAuth'
import { HelpWidget } from '@/components/HelpWidget'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
  show: boolean
}

export function AppLayout() {
  const { user, logout } = useAuth()
  const { isManagerOrAdmin, isAdmin } = useRole()
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  const navItems: NavItem[] = [
    { to: '/reports', label: 'My Reports', icon: ClipboardList, show: true },
    { to: '/insights', label: 'Insights', icon: BarChart3, show: isManagerOrAdmin },
    { to: '/review', label: 'Review Queue', icon: ListChecks, show: isManagerOrAdmin },
    { to: '/dashboard', label: 'Team Dashboard', icon: LayoutDashboard, show: isManagerOrAdmin },
    { to: '/projects', label: 'Projects', icon: FolderKanban, show: isManagerOrAdmin },
    { to: '/assistant', label: 'AI Assistant', icon: Sparkles, show: isManagerOrAdmin },
    { to: '/users', label: 'Users', icon: UsersIcon, show: isAdmin },
  ].filter((item) => item.show)

  const initials = (user?.name ?? '')
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
      isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100',
    )

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} onClick={() => setMobileOpen(false)} className={navLinkClass}>
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => logout()}
        className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
      >
        <LogOut className="h-4 w-4" />
        Log out
      </button>
    </div>
  )

  const userMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
          {initials}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-900">{user?.name}</span>
            <span className="text-xs font-normal text-slate-500">{user?.role}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          <UserIcon className="mr-2 h-4 w-4" />
          My Profile
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
        <div className="flex items-center gap-3">
          <button
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="text-sm font-semibold text-slate-900">Weekly Reports</span>
        </div>

        {userMenu}
      </header>

      <div className="md:flex">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r border-slate-200 bg-white px-4 py-5 md:block">
          {sidebarContent}
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-30 md:hidden">
            <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMobileOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-64 overflow-y-auto bg-white px-4 py-5 shadow-lg">
              {sidebarContent}
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1 px-4 py-6 md:px-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      <HelpWidget />
    </div>
  )
}
