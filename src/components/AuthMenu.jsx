import { useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'

export default function AuthMenu() {
  const { user, loading, error, login, register, loginWithGoogle, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) return null

  if (user) {
    return (
      <div className="header-auth-user">
        <span className="header-auth-name">{user.name || user.email}</span>
        <span className="header-auth-logout" onClick={logout}>
          로그아웃
        </span>
      </div>
    )
  }

  const isLogin = mode === 'login'

  const closePanel = () => {
    setOpen(false)
    setEmail('')
    setPassword('')
    setName('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await register(email, password, name)
      }
      closePanel()
    } catch {
      // error surfaced via useAuth().error
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogle = async () => {
    setSubmitting(true)
    try {
      await loginWithGoogle()
      closePanel()
    } catch {
      // error surfaced via useAuth().error (popup-closed is silently ignored)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="header-auth">
      <div className="btn btn-outline" onClick={() => setOpen((v) => !v)}>
        로그인
      </div>

      {open && (
        <>
          <div className="header-auth-overlay" onClick={closePanel} />
          <div className="header-auth-panel">
            <div className="title-serif" style={{ fontSize: 18 }}>
              {isLogin ? '다시 오셨네요' : '계정을 만들어볼까요'}
            </div>

            <button className="auth-google-btn" type="button" onClick={handleGoogle} disabled={submitting}>
              <svg viewBox="0 0 18 18" width="16" height="16" aria-hidden="true">
                <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.85.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.98v2.33A9 9 0 0 0 9 18z" />
                <path fill="#FBBC05" d="M3.97 10.71A5.4 5.4 0 0 1 3.68 9c0-.59.1-1.17.29-1.71V4.96H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.04l2.99-2.33z" />
                <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .98 4.96l2.99 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
              </svg>
              Google로 계속하기
            </button>

            <div className="auth-divider">
              <span>또는</span>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {!isLogin && (
                <input
                  className="auth-input"
                  type="text"
                  placeholder="이름 (선택)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              )}
              <input
                className="auth-input"
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                autoFocus
              />
              <input
                className="auth-input"
                type="password"
                placeholder="비밀번호 (6자 이상)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                minLength={6}
                required
              />

              {error && <div className="auth-error">{error}</div>}

              <button className="auth-submit" type="submit" disabled={submitting}>
                {submitting ? '처리 중…' : isLogin ? '로그인' : '가입하기'}
              </button>
            </form>

            <div className="auth-toggle">
              {isLogin ? '아직 계정이 없으신가요?' : '이미 계정이 있으신가요?'}{' '}
              <span onClick={() => setMode(isLogin ? 'register' : 'login')}>
                {isLogin ? '가입하기' : '로그인'}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
