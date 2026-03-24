// =============================================
// client/src/App.jsx
// =============================================
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import AppRouter from './routes/AppRouter'

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
    </AuthProvider>
  )
}
