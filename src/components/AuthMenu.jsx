import { useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'

export default function AuthMenu() {
  const { user, loading, error, login, register, logout } = useAuth()
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
