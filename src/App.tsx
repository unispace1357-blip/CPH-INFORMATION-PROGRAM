import { GuestLanguageProvider } from './i18n/GuestLanguageProvider'
import { BrowserRouter, HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { GuideLayout } from './components/layout/GuideLayout'
import { GuestPage } from './pages/guest/GuestPage'
import { StaffPage } from './pages/staff/StaffPage'
import { StaffHelpPage } from './pages/staff/StaffHelpPage'
import { NotFoundPage } from './pages/NotFoundPage'

export default function App() {
  const publicTest = import.meta.env.MODE === 'public-test'
  const Router = publicTest ? HashRouter : BrowserRouter
  return (
    <GuestLanguageProvider>
      <Router>
        <Routes>
          {/* Recover links previously broken by fragment anchors under HashRouter. */}
          <Route path="staff-essentials" element={<Navigate to="/staff" replace />} />
          <Route path="hotel-information" element={<Navigate to="/guest" replace />} />
          <Route path="staff" element={<GuideLayout audience="staff" />}>
            <Route index element={<StaffPage />} />
            <Route path="help" element={<StaffHelpPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route element={<GuideLayout audience="guest" />}>
            <Route index element={<Navigate to={publicTest ? '/staff' : '/guest'} replace />} />
            <Route path="guest" element={<GuestPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Router>
    </GuestLanguageProvider>
  )
}
