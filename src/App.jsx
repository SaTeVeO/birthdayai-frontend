import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import LandingPage from './pages/LandingPage/LandingPage'
import LoginPage from './pages/LoginPage/LoginPage'
import RegisterPage from './pages/RegisterPage/RegisterPage'
import Dashboard from './pages/Dashboard/Dashboard'
import EditGreeting from './pages/EditGreeting/EditGreeting'
import SettingsPage from './pages/SettingsPage/SettingsPage'
import GreetingHistory from './pages/GreetingHistory/GreetingHistory'
import ContactsPage from './pages/ContactsPage/ContactsPage'
import { useAuth } from './hooks/useAuth'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/"              element={<LandingPage />} />
          <Route path="/login"         element={<LoginPage />} />
          <Route path="/register"      element={<RegisterPage />} />
          <Route path="/dashboard"     element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/edit-greeting" element={<ProtectedRoute><EditGreeting /></ProtectedRoute>} />
          <Route path="/settings"          element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/greeting-history" element={<ProtectedRoute><GreetingHistory /></ProtectedRoute>} />
          <Route path="/contacts"         element={<ProtectedRoute><ContactsPage /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
