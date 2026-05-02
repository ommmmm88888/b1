import type { Firestore } from 'firebase/firestore'

import { getFirebaseApp } from './firebaseApp'
import { isFirebaseConfigured } from './firebaseConfig'

type FirebaseServices = {
  db: Firestore
}

let services: FirebaseServices | null = null

export async function getFirebaseServices(): Promise<FirebaseServices | null> {
  if (!isFirebaseConfigured) {
    return null
  }

  if (services) {
    return services
  }

  const [app, firestore] = await Promise.all([getFirebaseApp(), import('firebase/firestore')])

  if (!app) {
    return null
  }

  try {
    services = {
      db: firestore.initializeFirestore(app, {
        localCache: firestore.persistentLocalCache({
          tabManager: firestore.persistentMultipleTabManager(),
        }),
      }),
    }
  } catch {
    services = {
      db: firestore.initializeFirestore(app, { localCache: firestore.memoryLocalCache() }),
    }
  }

  return services
}

export { isFirebaseConfigured }
