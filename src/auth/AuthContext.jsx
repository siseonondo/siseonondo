import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { auth } from '../firebase.js'
import { AUTH_ENABLED } from '../config/authConfig.js'

const AuthContext = createContext(null)

function toPublicUser(fbUser) {
  if (!fbUser) return null
  return { id: fbUser.uid, email: fbUser.email, name: fbUser.displayName || '' }
}

function mapFirebaseError(code) {
  switch (code) {
    case 'auth/email-already-in-use':
      return '이미 가입된 이메일입니다.'
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return '이메일 또는 비밀번호가 올바르지 않습니다.'
    case 'auth/weak-password':
      return '비밀번호는 6자 이상이어야 합니다.'
    case 'auth/invalid-email':
      return '올바른 이메일을 입력해주세요.'
    case 'auth/operation-not-allowed':
      return 'Firebase 콘솔에서 해당 로그인 방식이 아직 활성화되지 않았습니다.'
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return null
    default:
      return '요청을 처리하지 못했습니다.'
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // AUTH_ENABLED=false일 때는 게스트 경험이 Firebase 연결 상태와 무관하게 항상 동작하도록 구독을 시작하지 않습니다.
    // true로 되돌리면 즉시 원래대로 Firebase 세션을 구독합니다.
    if (!AUTH_ENABLED) {
      setLoading(false)
      return
    }
    return onAuthStateChanged(auth, (fbUser) => {
      setUser(toPublicUser(fbUser))
      setLoading(false)
    })
  }, [])

  const login = useCallback(async (email, password) => {
    setError(null)
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      return toPublicUser(cred.user)
    } catch (e) {
      const msg = mapFirebaseError(e.code)
      setError(msg)
      throw new Error(msg)
    }
  }, [])

  const register = useCallback(async (email, password, name) => {
    setError(null)
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      if (name) await updateProfile(cred.user, { displayName: name })
      setUser(toPublicUser(cred.user))
      return toPublicUser(cred.user)
    } catch (e) {
      const msg = mapFirebaseError(e.code)
      setError(msg)
      throw new Error(msg)
    }
  }, [])

  const loginWithGoogle = useCallback(async () => {
    setError(null)
    try {
      const cred = await signInWithPopup(auth, new GoogleAuthProvider())
      return toPublicUser(cred.user)
    } catch (e) {
      const msg = mapFirebaseError(e.code)
      if (msg) setError(msg)
      throw e
    }
  }, [])

  const logout = useCallback(() => signOut(auth), [])

  // AUTH_ENABLED=false일 때는 Firebase 세션이 남아 있어도 앱 전체가 항상 비로그인(게스트) 상태로 동작합니다.
  // onAuthStateChanged 구독과 로그인/가입/로그아웃 함수는 그대로 살아있어, 값만 true로 바꾸면 즉시 복구됩니다.
  const exposedUser = AUTH_ENABLED ? user : null
  const exposedLoading = AUTH_ENABLED ? loading : false

  return (
    <AuthContext.Provider
      value={{ user: exposedUser, loading: exposedLoading, error, login, register, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
