import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

const ProtectedRoute = ({ requiredRole }) => {
  const { accessToken, initialized, user } = useSelector(state => state.auth)
  const location = useLocation()

  // Wait for the initial /auth/me check to resolve before deciding —
  // otherwise a logged-in user gets bounced to /login on every hard refresh.
  if (accessToken && !initialized) {
    return null
  }

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Role check (e.g. requiredRole="admin")
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
export default ProtectedRoute