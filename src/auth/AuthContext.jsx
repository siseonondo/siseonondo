import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { auth } from '../firebase.js'

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
      return 'Firebase 콘솔에서 이메일/비밀번호 로그인이 아직 활성화되지 않았습니다.'
    default:
      return '요청을 처리하지 못했습니다.'
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
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

  const logout = useCallback(() => signOut(auth), [])

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
