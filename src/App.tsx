import { GuestLanguageProvider } from './i18n/GuestLanguageProvider'
import { BrowserRouter, HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { GuideLayout } from './components/layout/GuideLayout'
import { GuestPage } from './pages/guest/GuestPage'
import { StaffPage } from './pages/staff/StaffPage'
import { NotFoundPage } from './pages/NotFoundPage'

export default function App() {
  const publicTest = import.meta.env.MODE === 'public-test'
  const Router = publicTest ? HashRouter : BrowserRouter
  return (
    <GuestLanguageProvider>
      <Router>
        <Routes>
          <Route path="staff" element={<GuideLayout audience="staff" />}>
            <Route index element={<StaffPage />} />
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
