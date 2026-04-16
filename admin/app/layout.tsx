import type { Metadata } from 'next'
import './globals.css'
import { logout } from './actions'

export const metadata: Metadata = {
  title: 'proGym Admin',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <nav>
          <strong>proGym Admin</strong>
          <a href="/">Ejercicios</a>
          <form action={logout} style={{ marginLeft: 'auto' }}>
            <button type="submit" className="btn btn-secondary" style={{ padding: '0.3rem 0.65rem' }}>
              Salir
            </button>
          </form>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  )
}
