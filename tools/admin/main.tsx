import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AdminApp } from './AdminApp'
import '../../src/styles/global.css'
import './styles/admin.css'

createRoot(document.getElementById('root')!).render(<StrictMode><AdminApp /></StrictMode>)
