import type { Unsubscribe, User } from 'firebase/auth'

import { getFirebaseApp } from './firebaseApp'
import { firebaseConfigState, isFirebaseConfigured } from './firebaseConfig'

export type AuthUser = Pick<User, 'uid' | 'displayName' | 'email' | 'photoURL'>
export type AuthStateListener = (user: AuthUser | null) => void

function toAuthUser(user: User): AuthUser {
  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  }
}

function authErrorMessage(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string'
      ? error.code
      : ''

  if (code === 'auth/popup-blocked') {
    return 'Браузер заблокировал окно входа. Разрешите всплывающее окно и попробуйте снова.'
  }

  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return 'Вход отменен.'
  }

  if (code === 'auth/operation-not-allowed') {
    return 'Google вход не включен в Firebase Console.'
  }

  if (code === 'auth/unauthorized-domain') {
    return 'Этот домен не добавлен в разрешенные домены Firebase.'
  }

  if (!firebaseConfigState.configured) {
    return firebaseConfigState.reason
  }

  return 'Не удалось войти через Google.'
}

export async function signInWithGoogle(): Promise<void> {
  const app = await getFirebaseApp()

  if (!app) {
    return Promise.reject(new Error(firebaseConfigState.configured ? 'Firebase не настроен' : firebaseConfigState.reason))
  }

  try {
    const { getAuth, GoogleAuthProvider, signInWithPopup } = await import('firebase/auth')
    const auth = getAuth(app)
    const provider = new GoogleAuthProvider()

    await signInWithPopup(auth, provider)
  } catch (error) {
    return Promise.reject(new Error(authErrorMessage(error)))
  }
}

export async function signOut(): Promise<void> {
  const app = await getFirebaseApp()

  if (!app) {
    return
  }

  const { getAuth, signOut: firebaseSignOut } = await import('firebase/auth')
  await firebaseSignOut(getAuth(app))
}

export function subscribeAuthState(listener: AuthStateListener): Unsubscribe {
  if (!isFirebaseConfigured) {
    listener(null)
    return () => undefined
  }

  let unsubscribe: Unsubscribe | null = null
  let cancelled = false

  void Promise.all([getFirebaseApp(), import('firebase/auth')]).then(([app, authModule]) => {
    if (!app || cancelled) {
      listener(null)
      return
    }

    unsubscribe = authModule.onAuthStateChanged(authModule.getAuth(app), (user) => {
      listener(user ? toAuthUser(user) : null)
    })
  })

  return () => {
    cancelled = true
    unsubscribe?.()
  }
}

export { firebaseConfigState, isFirebaseConfigured }
