import { useEffect, useState } from 'react'

import {
  isFirebaseConfigured,
  signInWithGoogle,
  signOut,
  subscribeAuthState,
  type AuthUser,
} from '../../lib/auth'
import { syncLocalProgressToCloud } from '../../lib/progressSync'

type SyncStatus = 'idle' | 'syncing' | 'synced' | 'failed' | 'unavailable'

export function AccountSyncControl() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<SyncStatus>(isFirebaseConfigured ? 'idle' : 'unavailable')
  const [message, setMessage] = useState('')

  useEffect(() => subscribeAuthState(setUser), [])

  if (!isFirebaseConfigured) {
    return (
      <div className="account-sync account-sync--disabled" aria-label="Синхронизация">
        <span>Синхронизация не настроена</span>
      </div>
    )
  }

  async function handleSignIn() {
    setStatus('idle')
    setMessage('')

    try {
      await signInWithGoogle()
    } catch (error) {
      setStatus('failed')
      setMessage(error instanceof Error ? error.message : 'Не удалось войти')
    }
  }

  async function handleSync() {
    if (!user) {
      return
    }

    setStatus('syncing')
    setMessage('')

    const result = await syncLocalProgressToCloud(user.uid)

    setStatus(result.status)
    setMessage(result.ok ? 'Синхронизировано' : result.message)
  }

  async function handleSignOut() {
    await signOut()
    setStatus('idle')
    setMessage('')
  }

  if (!user) {
    return (
      <div className="account-sync" aria-label="Синхронизация">
        <button className="account-sync__button" type="button" onClick={handleSignIn}>
          Войти через Google
        </button>
        {message ? <span className="account-sync__status">{message}</span> : null}
      </div>
    )
  }

  const displayName = user.displayName || user.email || 'Google аккаунт'

  return (
    <div className="account-sync" aria-label="Синхронизация">
      <span className="account-sync__user" title={displayName}>
        {displayName}
      </span>
      <button
        className="account-sync__button account-sync__button--primary"
        type="button"
        onClick={handleSync}
        disabled={status === 'syncing'}
      >
        {status === 'syncing' ? 'Синхронизация...' : 'Синхронизировать'}
      </button>
      <button className="account-sync__button" type="button" onClick={handleSignOut}>
        Выйти
      </button>
      {message ? <span className="account-sync__status">{message}</span> : null}
    </div>
  )
}
