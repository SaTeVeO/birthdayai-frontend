import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import LandingPage from './pages/LandingPage/LandingPage'
import LoginPage from './pages/LoginPage/LoginPage'
import RegisterPage from './pages/RegisterPage/RegisterPage'
import Dashboard from './pages/Dashboard/Dashboard'
import EditGreeting from './pages/EditGreeting/EditGreeting'
import SettingsPage from './pages/SettingsPage/SettingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/"               element={<LandingPage />} />
          <Route path="/login"          element={<LoginPage />} />
          <Route path="/register"       element={<RegisterPage />} />
          <Route path="/dashboard"      element={<Dashboard />} />
          <Route path="/edit-greeting"  element={<EditGreeting />} />
          <Route path="/settings"       element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
