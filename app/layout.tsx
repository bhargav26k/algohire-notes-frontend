import NotificationListener from '@/components/NotificationListener'
import './globals.css'
import { AuthProvider } from '@/context/auth-context'
import { Toaster } from 'react-hot-toast'


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
            {children}
                      <NotificationListener />
            <Toaster position="top-center" reverseOrder={false} />
            </AuthProvider>
      </body>
    </html>
  )
}
