import { useEffect, useState } from 'react'

import {
  firebaseConfigState,
  isFirebaseConfigured,
  signInWithGoogle,
  signOut,
  subscribeAuthState,
  type AuthUser,
} from '../../lib/auth'

type AccountStatus = 'idle' | 'signing-in' | 'failed' | 'unavailable'

export function AccountSyncControl() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AccountStatus>(isFirebaseConfigured ? 'idle' : 'unavailable')
  const [message, setMessage] = useState('')
  const [showSetupInfo, setShowSetupInfo] = useState(false)

  useEffect(() => subscribeAuthState(setUser), [])

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

  return (
    <div className="account-sync" aria-label="Синхронизация">
      <span className="account-sync__user" title={displayName}>
        {displayName}
      </span>
      <span className="account-sync__status">вход выполнен</span>
      <button className="account-sync__button" type="button" onClick={handleSignOut}>
        Выйти
      </button>
      {message ? <span className="account-sync__status">{message}</span> : null}
    </div>
  )
}
