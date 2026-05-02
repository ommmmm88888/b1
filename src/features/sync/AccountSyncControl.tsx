import { useEffect, useState } from 'react'

import {
  firebaseConfigState,
  isFirebaseConfigured,
  signInWithGoogle,
  signInWithProofAccount,
  signOut,
  subscribeAuthState,
  type AuthUser,
} from '../../lib/auth'
import { PROGRESS_CHANGED_EVENT, PROGRESS_SYNCED_EVENT } from '../../lib/progressEvents'
import { loadGrammarProgress } from '../../lib/grammarProgressStorage'
import { loadProgress } from '../../lib/progressStorage'
import { loadTrainerSessionSnapshot } from '../../lib/trainerSessionStorage'
import {
  compareCloudProgress,
  getSyncDiagnostics,
  loadCloudProgressToLocal,
  saveLocalProgressToCloud,
  startCloudProgressSync,
  stopCloudProgressSync,
  subscribeCloudSyncState,
  subscribeSyncDiagnostics,
  summarizeGrammarProgress,
  summarizeTrainerProgress,
  summarizeTrainerSession,
  type CloudSyncState,
  type SyncDiagnosticsState,
} from '../../lib/progressSync'

type AccountStatus = 'idle' | 'signing-in' | 'failed' | 'unavailable'

function formatSyncTime(value: string | null): string {
  if (!value) {
    return 'нет'
  }

  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date(value))
}

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
  const [diagnostics, setDiagnostics] = useState<SyncDiagnosticsState>(getSyncDiagnostics())
  const [localTrainer, setLocalTrainer] = useState(() => summarizeTrainerProgress(loadProgress()))
  const [localGrammar, setLocalGrammar] = useState(() => summarizeGrammarProgress(loadGrammarProgress()))
  const [localTrainerSession, setLocalTrainerSession] = useState(() => summarizeTrainerSession(loadTrainerSessionSnapshot()))
  const [manualMessage, setManualMessage] = useState('')
  const proofMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('syncProof')

  useEffect(() => subscribeAuthState(setUser), [])
  useEffect(() => subscribeCloudSyncState(setSyncState), [])
  useEffect(() => subscribeSyncDiagnostics(setDiagnostics), [])
  useEffect(() => {
    const refreshLocalTrainer = () => {
      setLocalTrainer(summarizeTrainerProgress(loadProgress()))
      setLocalGrammar(summarizeGrammarProgress(loadGrammarProgress()))
      setLocalTrainerSession(summarizeTrainerSession(loadTrainerSessionSnapshot()))
    }

    refreshLocalTrainer()

    window.addEventListener(PROGRESS_CHANGED_EVENT, refreshLocalTrainer)
    window.addEventListener(PROGRESS_SYNCED_EVENT, refreshLocalTrainer)
    return () => {
      window.removeEventListener(PROGRESS_CHANGED_EVENT, refreshLocalTrainer)
      window.removeEventListener(PROGRESS_SYNCED_EVENT, refreshLocalTrainer)
    }
  }, [])
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
        <div className="account-sync__row">
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
        </div>
        {showSetupInfo ? (
          <span className="account-sync__setup-note" id="firebase-sync-setup-note">
            Синхронизация между устройствами появится после настройки Firebase.
            {firebaseConfigState.configured ? '' : ` Не хватает: ${firebaseConfigState.missing.join(', ')}.`}
          </span>
        ) : null}
        {renderDiagnosticsPanel()}
      </div>
    )
  }

  async function handleSignIn() {
    setStatus('signing-in')
    setMessage('')
    setManualMessage('')

    try {
      await signInWithGoogle()
      setStatus('idle')
    } catch (error) {
      setStatus('failed')
      setMessage(error instanceof Error ? error.message : 'Не удалось войти')
    }
  }

  async function handleProofSignIn() {
    setStatus('signing-in')
    setMessage('')
    setManualMessage('')

    try {
      await signInWithProofAccount()
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
    setManualMessage('')
  }

  async function handleLoadFromCloud() {
    if (!user) {
      return
    }

    setManualMessage('Загрузка из облака...')
    const result = await loadCloudProgressToLocal(user.uid)
    if (result.ok) {
      setManualMessage('Прогресс загружен из облака.')
    } else {
      setManualMessage(result.message)
    }
  }

  async function handleSaveToCloud() {
    if (!user) {
      return
    }

    setManualMessage('Сохранение в облако...')
    const result = await saveLocalProgressToCloud(user.uid)
    if (result.ok) {
      setManualMessage('Прогресс сохранен в облаке.')
    } else {
      setManualMessage(result.message)
    }
  }

  async function handleCheckSync() {
    if (!user) {
      return
    }

    setManualMessage('Проверка синхронизации...')
    const result = await compareCloudProgress(user.uid)

    if (!result.ok) {
      setManualMessage(result.message)
      return
    }

    setDiagnostics((current) => ({
      ...current,
      cloudTrainer: result.cloud,
      lastSyncError: null,
    }))
    setManualMessage(result.matches ? 'Локальный и облачный прогресс совпадают.' : 'Локальный и облачный прогресс отличаются.')
  }

  function renderDiagnosticsPanel() {
    const canRunManualActions = Boolean(user && isFirebaseConfigured)
    const cloudTrainer = diagnostics.cloudTrainer

    return (
      <details className="account-sync__diagnostics">
        <summary>Диагностика синхронизации</summary>
        <div className="account-sync__diagnostics-grid">
          <div className="account-sync__diagnostic">
            <span>Auth</span>
            <strong>{user ? `signed in · ${user.uid.slice(-6)}` : 'signed out'}</strong>
          </div>
          <div className="account-sync__diagnostic">
            <span>Firebase</span>
            <strong>{diagnostics.firebaseConfigured ? 'configured' : 'missing'}</strong>
          </div>
          <div className="account-sync__diagnostic">
            <span>Firestore</span>
            <strong>{diagnostics.firestoreStatus}</strong>
          </div>
          <div className="account-sync__diagnostic">
            <span>Listener</span>
            <strong>{diagnostics.listenerStatus}</strong>
          </div>
          <div className="account-sync__diagnostic">
            <span>Autosave</span>
            <strong>{syncState.status === 'active' ? 'active' : 'inactive'}</strong>
          </div>
          <div className="account-sync__diagnostic">
            <span>Last read</span>
            <strong>{formatSyncTime(diagnostics.lastCloudReadAt)}</strong>
          </div>
          <div className="account-sync__diagnostic">
            <span>Last write</span>
            <strong>{formatSyncTime(diagnostics.lastCloudWriteAt)}</strong>
          </div>
          <div className="account-sync__diagnostic account-sync__diagnostic--wide">
            <span>Error</span>
            <strong>{diagnostics.lastSyncError ?? 'нет'}</strong>
          </div>
          <div className="account-sync__diagnostic">
            <span>Local trainer</span>
            <strong>{`a:${localTrainer.attempts} c:${localTrainer.correctAnswers} m:${localTrainer.mistakeTotal} d:${localTrainer.dailyCompletedCount} s:${localTrainer.streak} @${formatSyncTime(localTrainer.updatedAt)}`}</strong>
          </div>
          <div className="account-sync__diagnostic">
            <span>Local grammar</span>
            <strong>{localGrammar ? `a:${localGrammar.attempts} c:${localGrammar.correctAnswers} m:${localGrammar.mistakeTotal} @${formatSyncTime(localGrammar.updatedAt)}` : 'нет'}</strong>
          </div>
          <div className="account-sync__diagnostic">
            <span>Local session</span>
            <strong>
              {localTrainerSession
                ? `${localTrainerSession.mode} · ${localTrainerSession.currentIndex + 1}/${localTrainerSession.itemCount} · ${
                    localTrainerSession.finished ? 'finished' : localTrainerSession.checked ? 'checked' : 'open'
                  } @${formatSyncTime(localTrainerSession.updatedAt)}`
                : 'нет'}
            </strong>
          </div>
          <div className="account-sync__diagnostic">
            <span>Cloud trainer</span>
            <strong>
              {cloudTrainer
                ? `a:${cloudTrainer.attempts} c:${cloudTrainer.correctAnswers} m:${cloudTrainer.mistakeTotal} d:${cloudTrainer.dailyCompletedCount} s:${cloudTrainer.streak} @${formatSyncTime(cloudTrainer.updatedAt)}`
                : 'нет'}
            </strong>
          </div>
          <div className="account-sync__diagnostic">
            <span>Cloud grammar</span>
            <strong>
              {diagnostics.cloudGrammar
                ? `a:${diagnostics.cloudGrammar.attempts} c:${diagnostics.cloudGrammar.correctAnswers} m:${diagnostics.cloudGrammar.mistakeTotal} @${formatSyncTime(diagnostics.cloudGrammar.updatedAt)}`
                : 'нет'}
            </strong>
          </div>
          <div className="account-sync__diagnostic">
            <span>Cloud session</span>
            <strong>
              {diagnostics.cloudTrainerSession
                ? `${diagnostics.cloudTrainerSession.mode} · ${
                    diagnostics.cloudTrainerSession.currentIndex + 1
                  }/${diagnostics.cloudTrainerSession.itemCount} · ${
                    diagnostics.cloudTrainerSession.finished ? 'finished' : diagnostics.cloudTrainerSession.checked ? 'checked' : 'open'
                  } @${formatSyncTime(diagnostics.cloudTrainerSession.updatedAt)}`
                : 'нет'}
            </strong>
          </div>
          <div className="account-sync__diagnostic">
            <span>Cache</span>
            <strong>{diagnostics.cacheVersion}</strong>
          </div>
          <div className="account-sync__diagnostic">
            <span>UID</span>
            <strong>{diagnostics.activeUidSuffix ? `••••••${diagnostics.activeUidSuffix}` : 'нет'}</strong>
          </div>
        </div>
        <div className="account-sync__diagnostics-actions">
          <button
            className="account-sync__button account-sync__button--primary"
            type="button"
            onClick={handleSaveToCloud}
            disabled={!canRunManualActions}
          >
            Сохранить в облако
          </button>
          <button
            className="account-sync__button"
            type="button"
            onClick={handleLoadFromCloud}
            disabled={!canRunManualActions}
          >
            Загрузить из облака
          </button>
          <button
            className="account-sync__button"
            type="button"
            onClick={handleCheckSync}
            disabled={!canRunManualActions}
          >
            Проверить синхронизацию
          </button>
        </div>
        {manualMessage ? <div className="account-sync__diagnostics-note">{manualMessage}</div> : null}
      </details>
    )
  }

  if (!user) {
    return (
      <div className="account-sync" aria-label="Синхронизация">
        <div className="account-sync__row">
          <button className="account-sync__button" type="button" onClick={handleSignIn} disabled={status === 'signing-in'}>
            {status === 'signing-in' ? 'Вход...' : 'Google вход'}
          </button>
          {proofMode ? (
            <button className="account-sync__button" type="button" onClick={handleProofSignIn} disabled={status === 'signing-in'}>
              {status === 'signing-in' ? 'Вход...' : 'Тестовый вход'}
            </button>
          ) : null}
          {message ? <span className="account-sync__status">{message}</span> : null}
        </div>
        {renderDiagnosticsPanel()}
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
      <div className="account-sync__row">
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
      {renderDiagnosticsPanel()}
    </div>
  )
}
