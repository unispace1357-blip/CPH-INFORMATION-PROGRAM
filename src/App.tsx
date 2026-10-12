import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { GuideLayout } from './components/layout/GuideLayout'
import { GuestPage } from './pages/guest/GuestPage'
import { StaffPage } from './pages/staff/StaffPage'
import { NotFoundPage } from './pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuideLayout />}>
          <Route index element={<Navigate to="/guest" replace />} />
          <Route path="guest" element={<GuestPage />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
