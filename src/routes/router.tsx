import { createBrowserRouter } from 'react-router-dom'
import { LoginPage } from '@/features/auth/LoginPage'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { AppLayout } from '@/routes/AppLayout'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { RoleRoute } from '@/routes/RoleRoute'
import { HomeRedirect } from '@/routes/HomeRedirect'
import { NotFoundPage, ForbiddenPage } from '@/components/ErrorState'
import { ReportHistoryPage } from '@/features/reports/ReportHistoryPage'
import { ReportFormPage } from '@/features/reports/ReportFormPage'
import { ReportDetailPage } from '@/features/reports/ReportDetailPage'
import { ReviewQueuePage } from '@/features/review/ReviewQueuePage'
import { ManagerReviewPage } from '@/features/review/ManagerReviewPage'
import { TeamDashboardPage } from '@/features/dashboard/TeamDashboardPage'
import { MemberProfilePage } from '@/features/dashboard/MemberProfilePage'
import { ProjectsPage } from '@/features/projects/ProjectsPage'
import { UsersPage } from '@/features/users/UsersPage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <HomeRedirect /> },
          { path: 'reports', element: <ReportHistoryPage /> },
          { path: 'reports/new', element: <ReportFormPage /> },
          { path: 'reports/:id/edit', element: <ReportFormPage /> },
          { path: 'reports/:id', element: <ReportDetailPage /> },
          {
            element: <RoleRoute allow={['Manager', 'Admin']} />,
            children: [
              { path: 'review', element: <ReviewQueuePage /> },
              { path: 'review/:id', element: <ManagerReviewPage /> },
              { path: 'dashboard', element: <TeamDashboardPage /> },
              { path: 'dashboard/members/:id', element: <MemberProfilePage /> },
              { path: 'projects', element: <ProjectsPage /> },
            ],
          },
          {
            element: <RoleRoute allow={['Admin']} />,
            children: [{ path: 'users', element: <UsersPage /> }],
          },
          { path: 'forbidden', element: <ForbiddenPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
