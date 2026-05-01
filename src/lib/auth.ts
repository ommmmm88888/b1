import type { Unsubscribe, User } from 'firebase/auth'

import { getFirebaseServices, isFirebaseConfigured } from './firebase'

export type AuthUser = Pick<User, 'uid' | 'displayName' | 'email' | 'photoURL'>
export type AuthStateListener = (user: AuthUser | null) => void

export async function signInWithGoogle(): Promise<void> {
  const services = await getFirebaseServices()

  if (!services) {
    return Promise.reject(new Error('Firebase is not configured'))
  }

  const { getAuth, GoogleAuthProvider, signInWithPopup } = await import('firebase/auth')
  const auth = getAuth(services.app)
  const provider = new GoogleAuthProvider()

  return signInWithPopup(auth, provider).then(() => undefined)
}

export async function signOut(): Promise<void> {
  const services = await getFirebaseServices()

  if (!services) {
    return Promise.resolve()
  }

  const { getAuth, signOut: firebaseSignOut } = await import('firebase/auth')
  return firebaseSignOut(getAuth(services.app))
}

export function subscribeAuthState(listener: AuthStateListener): Unsubscribe {
  if (!isFirebaseConfigured) {
    listener(null)
    return () => undefined
  }

  let unsubscribe: Unsubscribe | null = null
  let cancelled = false

  void Promise.all([getFirebaseServices(), import('firebase/auth')]).then(([services, authModule]) => {
    if (!services || cancelled) {
      listener(null)
      return
    }

    unsubscribe = authModule.onAuthStateChanged(authModule.getAuth(services.app), (user) => {
      listener(
        user
          ? {
              uid: user.uid,
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
            }
          : null,
      )
    })
  })

  return () => {
    cancelled = true
    unsubscribe?.()
  }
}

export { isFirebaseConfigured }
