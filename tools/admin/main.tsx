import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AdminApp } from './AdminApp'
import { PublicDemoAdminEntry } from './PublicDemoAdminEntry'
import '../../src/styles/global.css'
import './styles/admin.css'

createRoot(document.getElementById('root')!).render(<StrictMode>{import.meta.env.MODE === 'public-test-admin' ? <PublicDemoAdminEntry /> : <AdminApp />}</StrictMode>)
