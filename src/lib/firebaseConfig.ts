import type { FirebaseOptions } from 'firebase/app'

export type FirebaseConfigState =
  | {
      configured: true
      options: FirebaseOptions
    }
  | {
      configured: false
      reason: string
      missing: string[]
    }

const requiredEnv = {
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
}

function isUsableValue(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && !value.startsWith('replace-with-')
}

const missing = Object.entries(requiredEnv)
  .filter(([, value]) => !isUsableValue(value))
  .map(([key]) => key)

export const firebaseConfigState: FirebaseConfigState =
  missing.length > 0
    ? {
        configured: false,
        reason: 'Firebase не настроен',
        missing,
      }
    : {
        configured: true,
        options: {
          apiKey: requiredEnv.VITE_FIREBASE_API_KEY,
          authDomain: requiredEnv.VITE_FIREBASE_AUTH_DOMAIN,
          projectId: requiredEnv.VITE_FIREBASE_PROJECT_ID,
          appId: requiredEnv.VITE_FIREBASE_APP_ID,
          storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || undefined,
          messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || undefined,
          measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined,
        },
      }

export const isFirebaseConfigured = firebaseConfigState.configured
