import type { FirebaseApp, FirebaseOptions } from 'firebase/app'
import type { Firestore } from 'firebase/firestore'

type FirebaseServices = {
  app: FirebaseApp
  db: Firestore
}

const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || undefined,
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId,
)

let services: FirebaseServices | null = null

export async function getFirebaseServices(): Promise<FirebaseServices | null> {
  if (!isFirebaseConfigured) {
    return null
  }

  if (services) {
    return services
  }

  const [{ getApps, initializeApp }, firestore] = await Promise.all([
    import('firebase/app'),
    import('firebase/firestore'),
  ])
  const app = getApps()[0] ?? initializeApp(firebaseConfig)

  try {
    services = {
      app,
      db: firestore.initializeFirestore(app, {
        localCache: firestore.persistentLocalCache({
          tabManager: firestore.persistentMultipleTabManager(),
        }),
      }),
    }
  } catch {
    services = {
      app,
      db: firestore.initializeFirestore(app, { localCache: firestore.memoryLocalCache() }),
    }
  }

  return services
}
