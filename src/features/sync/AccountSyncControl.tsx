import { useEffect, useState } from 'react'

import {
  firebaseConfigState,
  isFirebaseConfigured,
  signInWithGoogle,
  signOut,
  subscribeAuthState,
  type AuthUser,
} from '../../lib/auth'
import {
  startCloudProgressSync,
  stopCloudProgressSync,
  subscribeCloudSyncState,
  type CloudSyncState,
} from '../../lib/progressSync'

type AccountStatus = 'idle' | 'signing-in' | 'failed' | 'unavailable'

export function AccountSyncControl() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AccountStatus>(isFirebaseConfigured ? 'idle' : 'unavailable')
  const [syncState, setSyncState] = useState<CloudSyncState>({
    status: 'idle',
    message: '',
    lastSyncedAt: null,
  })
  const [message, setMessage] = useState('')
  const [showSetupInfo, setShowSetupInfo] = useState(false)

  useEffect(() => subscribeAuthState(setUser), [])
  useEffect(() => subscribeCloudSyncState(setSyncState), [])
  useEffect(() => {
    if (!user) {
      stopCloudProgressSync()
      return
    }

    void startCloudProgressSync(user.uid)

    return () => {
      stopCloudProgressSync()
    }
  }, [user])

  if (!isFirebaseConfigured) {
    return (
      <div className="account-sync account-sync--disabled" aria-label="Синхронизация">
        <button
          className="account-sync__button account-sync__button--setup"
          type="button"
          onClick={() => setShowSetupInfo((current) => !current)}
          aria-expanded={showSetupInfo}
          aria-controls="firebase-sync-setup-note"
        >
          Google вход
        </button>
        <span className="account-sync__status">не настроено</span>
        {showSetupInfo ? (
          <span className="account-sync__setup-note" id="firebase-sync-setup-note">
            Синхронизация между устройствами появится после настройки Firebase.
            {firebaseConfigState.configured ? '' : ` Не хватает: ${firebaseConfigState.missing.join(', ')}.`}
          </span>
        ) : null}
      </div>
    )
  }

  async function handleSignIn() {
    setStatus('signing-in')
    setMessage('')

    try {
      await signInWithGoogle()
      setStatus('idle')
    } catch (error) {
      setStatus('failed')
      setMessage(error instanceof Error ? error.message : 'Не удалось войти')
    }
  }

  async function handleSignOut() {
    await signOut()
    stopCloudProgressSync()
    setStatus('idle')
    setMessage('')
  }

  if (!user) {
    return (
      <div className="account-sync" aria-label="Синхронизация">
        <button className="account-sync__button" type="button" onClick={handleSignIn} disabled={status === 'signing-in'}>
          {status === 'signing-in' ? 'Вход...' : 'Google вход'}
        </button>
        {message ? <span className="account-sync__status">{message}</span> : null}
      </div>
    )
  }

  const displayName = user.displayName || user.email || 'Google аккаунт'
  const syncLabel =
    syncState.status === 'active'
      ? 'синхронизация включена'
      : syncState.status === 'starting'
        ? 'синхронизация...'
        : syncState.status === 'failed' || syncState.status === 'unavailable'
          ? syncState.message
          : 'вход выполнен'

  return (
    <div className="account-sync" aria-label="Синхронизация">
      <span className="account-sync__user" title={displayName}>
        {displayName}
      </span>
      <span className="account-sync__status" title={syncState.lastSyncedAt ?? undefined}>
        {syncLabel}
      </span>
      <button className="account-sync__button" type="button" onClick={handleSignOut}>
        Выйти
      </button>
      {message ? <span className="account-sync__status">{message}</span> : null}
    </div>
  )
}
