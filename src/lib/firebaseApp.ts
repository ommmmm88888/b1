import type { FirebaseApp } from 'firebase/app'

import { firebaseConfigState } from './firebaseConfig'

let app: FirebaseApp | null = null

export async function getFirebaseApp(): Promise<FirebaseApp | null> {
  if (!firebaseConfigState.configured) {
    return null
  }

  if (app) {
    return app
  }

  const { getApps, initializeApp } = await import('firebase/app')
  app = getApps()[0] ?? initializeApp(firebaseConfigState.options)
  return app
}
