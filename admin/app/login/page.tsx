import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

async function loginAction(formData: FormData) {
  'use server'
  const password = formData.get('password') as string
  if (password !== process.env.ADMIN_PASSWORD) {
    redirect('/login?error=1')
  }
  const cookieStore = await cookies()
  cookieStore.set('auth', password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
  redirect('/')
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
      }}
    >
      <div
        style={{
          background: '#fff',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
          width: '100%',
          maxWidth: '360px',
        }}
      >
        <h1 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem' }}>proGym Admin</h1>
        {error && (
          <p style={{ color: '#e53e3e', margin: '0 0 1rem', fontSize: '0.875rem' }}>
            Contrasena incorrecta.
          </p>
        )}
        <form action={loginAction}>
          <label style={{ marginBottom: '1rem', display: 'block' }}>
            <span style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', fontWeight: 500 }}>
              Contrasena
            </span>
            <input
              name="password"
              type="password"
              autoFocus
              required
              style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #d0d0d0', borderRadius: '4px', fontSize: '0.875rem' }}
            />
          </label>
          <button
            type="submit"
            style={{ width: '100%', padding: '0.5rem', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  )
}
