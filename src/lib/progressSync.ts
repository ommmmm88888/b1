import { getFirebaseServices } from './firebase'
import {
  dispatchProgressSynced,
  PROGRESS_CHANGED_EVENT,
  runWithoutProgressChangeEvent,
} from './progressEvents'

export const PROGRESS_STORAGE_KEYS = {
  trainer: 'b1-polish-trainer-progress-v0',
  grammar: 'b1_grammar_progress_v0',
  intensive: 'b1_super_intensive_progress',
  writing: 'b1_writing_progress_v0',
  speaking: 'b1_speaking_progress_v0',
  reading: 'b1_reading_progress_v0',
  listening: 'b1_listening_progress_v0',
  mock: 'b1_mock_exam_latest_result_v0',
} as const

export type ProgressSection = keyof typeof PROGRESS_STORAGE_KEYS

export type ProgressSectionSnapshot = {
  key: string
  value: unknown | null
  updatedAt: string | null
}

export type ProgressSnapshot = {
  schemaVersion: 1
  capturedAt: string
  sections: Record<ProgressSection, ProgressSectionSnapshot>
}

export type SyncResult =
  | { ok: true; status: 'synced'; snapshot: ProgressSnapshot }
  | { ok: false; status: 'unavailable' | 'failed'; message: string }

export type CloudSyncStatus = 'idle' | 'starting' | 'active' | 'unavailable' | 'failed'

export type CloudSyncState = {
  status: CloudSyncStatus
  message: string
  lastSyncedAt: string | null
}

export type CloudSyncListener = (state: CloudSyncState) => void

const BACKUP_PREFIX = 'b1:backup:before-cloud-sync:'
const CLOUD_SYNC_DEBOUNCE_MS = 450

const defaultCloudSyncState: CloudSyncState = {
  status: 'idle',
  message: '',
  lastSyncedAt: null,
}

let cloudSyncState: CloudSyncState = defaultCloudSyncState
const cloudSyncListeners = new Set<CloudSyncListener>()
let stopCloudSnapshot: (() => void) | null = null
let stopLocalChangeListener: (() => void) | null = null
let pendingCloudWrite: ReturnType<typeof window.setTimeout> | null = null
let activeUid: string | null = null

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true
  }

  if (Array.isArray(value)) {
    return value.length === 0
  }

  if (isRecord(value)) {
    return Object.keys(value).length === 0
  }

  return false
}

function parseStoredValue(raw: string | null): unknown | null {
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

function extractUpdatedAt(value: unknown): string | null {
  if (!isRecord(value)) {
    return null
  }

  return typeof value.updatedAt === 'string' ? value.updatedAt : null
}

export function collectLocalProgressSnapshot(storage: Storage = window.localStorage): ProgressSnapshot {
  const sections = Object.fromEntries(
    Object.entries(PROGRESS_STORAGE_KEYS).map(([section, key]) => {
      const value = parseStoredValue(storage.getItem(key))

      return [
        section,
        {
          key,
          value,
          updatedAt: extractUpdatedAt(value),
        },
      ]
    }),
  ) as Record<ProgressSection, ProgressSectionSnapshot>

  return {
    schemaVersion: 1,
    capturedAt: new Date().toISOString(),
    sections,
  }
}

export function preserveLocalProgressBackup(
  snapshot: ProgressSnapshot,
  storage: Storage = window.localStorage,
): string {
  const backupKey = `${BACKUP_PREFIX}${snapshot.capturedAt}`
  storage.setItem(backupKey, JSON.stringify(snapshot))
  return backupKey
}

function maxNumber(local: unknown, remote: unknown): number {
  return Math.max(typeof local === 'number' ? local : 0, typeof remote === 'number' ? remote : 0)
}

function maxStringDate(local: unknown, remote: unknown): string | null {
  const localValue = typeof local === 'string' ? local : null
  const remoteValue = typeof remote === 'string' ? remote : null

  if (!localValue) {
    return remoteValue
  }

  if (!remoteValue) {
    return localValue
  }

  return Date.parse(remoteValue) > Date.parse(localValue) ? remoteValue : localValue
}

function mergeNumberRecord(local: unknown, remote: unknown): Record<string, number> {
  const result: Record<string, number> = {}
  const localRecord = isRecord(local) ? local : {}
  const remoteRecord = isRecord(remote) ? remote : {}

  for (const key of new Set([...Object.keys(localRecord), ...Object.keys(remoteRecord)])) {
    result[key] = maxNumber(localRecord[key], remoteRecord[key])
  }

  return result
}

function unionStrings(local: unknown, remote: unknown): string[] {
  const result = new Set<string>()

  if (Array.isArray(remote)) {
    remote.filter((item): item is string => typeof item === 'string').forEach((item) => result.add(item))
  }

  if (Array.isArray(local)) {
    local.filter((item): item is string => typeof item === 'string').forEach((item) => result.add(item))
  }

  return [...result]
}

function mergeTrainerProgress(local: unknown, remote: unknown): unknown {
  if (!isRecord(local) && !isRecord(remote)) {
    return null
  }

  const localRecord = isRecord(local) ? local : {}
  const remoteRecord = isRecord(remote) ? remote : {}

  return {
    totalAttempts: maxNumber(localRecord.totalAttempts, remoteRecord.totalAttempts),
    correctAnswers: maxNumber(localRecord.correctAnswers, remoteRecord.correctAnswers),
    mistakesByItem: mergeNumberRecord(localRecord.mistakesByItem, remoteRecord.mistakesByItem),
    lastSessionDate: maxStringDate(localRecord.lastSessionDate, remoteRecord.lastSessionDate),
    dailyCompletedCount: maxNumber(localRecord.dailyCompletedCount, remoteRecord.dailyCompletedCount),
    streak: maxNumber(localRecord.streak, remoteRecord.streak),
  }
}

function mergeGrammarProgress(local: unknown, remote: unknown): unknown {
  if (!isRecord(local) && !isRecord(remote)) {
    return null
  }

  const localRecord = isRecord(local) ? local : {}
  const remoteRecord = isRecord(remote) ? remote : {}

  return {
    totalAttempts: maxNumber(localRecord.totalAttempts, remoteRecord.totalAttempts),
    correctAnswers: maxNumber(localRecord.correctAnswers, remoteRecord.correctAnswers),
    mistakesByTaskId: mergeNumberRecord(localRecord.mistakesByTaskId, remoteRecord.mistakesByTaskId),
  }
}

function mergeScoreProgress(local: unknown, remote: unknown): unknown {
  if (!isRecord(local) && !isRecord(remote)) {
    return null
  }

  const localRecord = isRecord(local) ? local : {}
  const remoteRecord = isRecord(remote) ? remote : {}

  return {
    completedTaskIds: unionStrings(localRecord.completedTaskIds, remoteRecord.completedTaskIds),
    bestScoresByTaskId: mergeNumberRecord(localRecord.bestScoresByTaskId, remoteRecord.bestScoresByTaskId),
  }
}

function mergeSpeakingProgress(local: unknown, remote: unknown): unknown {
  if (!isRecord(local) && !isRecord(remote)) {
    return null
  }

  const localRecord = isRecord(local) ? local : {}
  const remoteRecord = isRecord(remote) ? remote : {}

  return {
    completedPromptIds: unionStrings(localRecord.completedPromptIds, remoteRecord.completedPromptIds),
  }
}

function chooseByUpdatedAt(local: unknown, remote: unknown): unknown {
  if (!isRecord(local)) {
    return remote
  }

  if (!isRecord(remote)) {
    return local
  }

  const localUpdatedAt = typeof local.updatedAt === 'string' ? local.updatedAt : null
  const remoteUpdatedAt = typeof remote.updatedAt === 'string' ? remote.updatedAt : null

  if (localUpdatedAt && remoteUpdatedAt) {
    return Date.parse(remoteUpdatedAt) > Date.parse(localUpdatedAt) ? remote : local
  }

  return isEmptyValue(local) ? remote : local
}

function mergeSuperIntensiveProgress(local: unknown, remote: unknown): unknown {
  if (!isRecord(local) && !isRecord(remote)) {
    return null
  }

  const localRecord = isRecord(local) ? local : {}
  const remoteRecord = isRecord(remote) ? remote : {}
  const localDays = isRecord(localRecord.days) ? localRecord.days : {}
  const remoteDays = isRecord(remoteRecord.days) ? remoteRecord.days : {}
  const days: Record<string, unknown> = {}

  for (const key of new Set([...Object.keys(localDays), ...Object.keys(remoteDays)])) {
    const localDay = isRecord(localDays[key]) ? localDays[key] : {}
    const remoteDay = isRecord(remoteDays[key]) ? remoteDays[key] : {}
    const chosenNoteSource = chooseByUpdatedAt(localDay, remoteDay)
    const noteSource = isRecord(chosenNoteSource) ? chosenNoteSource : {}

    days[key] = {
      completedTaskIds: unionStrings(localDay.completedTaskIds, remoteDay.completedTaskIds),
      note: typeof noteSource.note === 'string' ? noteSource.note : '',
      updatedAt: maxStringDate(localDay.updatedAt, remoteDay.updatedAt) ?? new Date().toISOString(),
    }
  }

  return {
    selectedDay:
      typeof localRecord.selectedDay === 'number'
        ? localRecord.selectedDay
        : typeof remoteRecord.selectedDay === 'number'
          ? remoteRecord.selectedDay
          : 1,
    days,
    updatedAt: maxStringDate(localRecord.updatedAt, remoteRecord.updatedAt) ?? new Date().toISOString(),
  }
}

function mergeWritingProgress(local: unknown, remote: unknown): unknown {
  if (!isRecord(local) && !isRecord(remote)) {
    return null
  }

  const localRecord = isRecord(local) ? local : {}
  const remoteRecord = isRecord(remote) ? remote : {}
  const localTasks = isRecord(localRecord.tasks) ? localRecord.tasks : {}
  const remoteTasks = isRecord(remoteRecord.tasks) ? remoteRecord.tasks : {}
  const tasks: Record<string, unknown> = {}

  for (const key of new Set([...Object.keys(localTasks), ...Object.keys(remoteTasks)])) {
    const chosen = chooseByUpdatedAt(localTasks[key], remoteTasks[key])
    tasks[key] = chosen
  }

  return {
    selectedTaskId:
      typeof localRecord.selectedTaskId === 'string'
        ? localRecord.selectedTaskId
        : typeof remoteRecord.selectedTaskId === 'string'
          ? remoteRecord.selectedTaskId
          : '',
    tasks,
  }
}

function mergeMockProgress(local: unknown, remote: unknown): unknown {
  if (!local) {
    return remote ?? null
  }

  if (!remote) {
    return local
  }

  if (!isRecord(local) || !isRecord(remote)) {
    return local
  }

  const localCompletedAt = typeof local.completedAt === 'string' ? local.completedAt : null
  const remoteCompletedAt = typeof remote.completedAt === 'string' ? remote.completedAt : null

  if (localCompletedAt && remoteCompletedAt) {
    return Date.parse(remoteCompletedAt) > Date.parse(localCompletedAt) ? remote : local
  }

  return local
}

function mergeSectionValue(section: ProgressSection, local: unknown, remote: unknown): unknown {
  if (isEmptyValue(local)) {
    return remote ?? null
  }

  if (isEmptyValue(remote)) {
    return local
  }

  if (section === 'trainer') {
    return mergeTrainerProgress(local, remote)
  }

  if (section === 'grammar') {
    return mergeGrammarProgress(local, remote)
  }

  if (section === 'intensive') {
    return mergeSuperIntensiveProgress(local, remote)
  }

  if (section === 'writing') {
    return mergeWritingProgress(local, remote)
  }

  if (section === 'speaking') {
    return mergeSpeakingProgress(local, remote)
  }

  if (section === 'reading' || section === 'listening') {
    return mergeScoreProgress(local, remote)
  }

  if (section === 'mock') {
    return mergeMockProgress(local, remote)
  }

  return chooseByUpdatedAt(local, remote)
}

function hasValue(section: ProgressSectionSnapshot): boolean {
  return section.value !== null && section.value !== undefined
}

function resolveSection(
  section: ProgressSection,
  local: ProgressSectionSnapshot,
  remote: ProgressSectionSnapshot | undefined,
): ProgressSectionSnapshot {
  if (!remote || !hasValue(remote)) {
    return local
  }

  if (!hasValue(local)) {
    return remote
  }

  return {
    ...local,
    value: mergeSectionValue(section, local.value, remote.value),
    updatedAt: maxStringDate(local.updatedAt, remote.updatedAt),
  }
}

export function mergeProgressSnapshots(
  local: ProgressSnapshot,
  remote: ProgressSnapshot | null,
): ProgressSnapshot {
  if (!remote) {
    return local
  }

  const sections = Object.fromEntries(
    Object.keys(PROGRESS_STORAGE_KEYS).map((section) => {
      const key = section as ProgressSection
      return [key, resolveSection(key, local.sections[key], remote.sections[key])]
    }),
  ) as Record<ProgressSection, ProgressSectionSnapshot>

  return {
    schemaVersion: 1,
    capturedAt:
      Date.parse(remote.capturedAt) > Date.parse(local.capturedAt) ? remote.capturedAt : local.capturedAt,
    sections,
  }
}

export function applyProgressSnapshot(snapshot: ProgressSnapshot, storage: Storage = window.localStorage): void {
  runWithoutProgressChangeEvent(() => {
    for (const section of Object.values(snapshot.sections)) {
      if (hasValue(section)) {
        storage.setItem(section.key, JSON.stringify(section.value))
      }
    }
  })

  dispatchProgressSynced()
}

export function normalizeRemoteSnapshot(value: unknown): ProgressSnapshot | null {
  if (!isRecord(value) || value.schemaVersion !== 1 || !isRecord(value.sections)) {
    return null
  }

  return value as ProgressSnapshot
}

function setCloudSyncState(next: Partial<CloudSyncState>): void {
  cloudSyncState = { ...cloudSyncState, ...next }
  cloudSyncListeners.forEach((listener) => listener(cloudSyncState))
}

export function subscribeCloudSyncState(listener: CloudSyncListener): () => void {
  cloudSyncListeners.add(listener)
  listener(cloudSyncState)

  return () => {
    cloudSyncListeners.delete(listener)
  }
}

export function getCloudProgressStatus(): CloudSyncState {
  return cloudSyncState
}

async function writeLocalProgressToCloud(uid: string): Promise<void> {
  const services = await getFirebaseServices()

  if (!services) {
    setCloudSyncState({
      status: 'unavailable',
      message: 'Синхронизация недоступна',
    })
    return
  }

  try {
    const { doc, serverTimestamp, setDoc } = await import('firebase/firestore')
    const snapshot = collectLocalProgressSnapshot()

    await setDoc(
      doc(services.db, 'users', uid, 'state', 'progress'),
      {
        ...snapshot,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )

    setCloudSyncState({
      status: 'active',
      message: 'синхронизация включена',
      lastSyncedAt: new Date().toISOString(),
    })
  } catch {
    setCloudSyncState({
      status: 'failed',
      message: 'Не удалось синхронизировать прогресс',
    })
  }
}

function scheduleCloudWrite(uid: string): void {
  if (typeof window === 'undefined') {
    return
  }

  if (pendingCloudWrite) {
    window.clearTimeout(pendingCloudWrite)
  }

  pendingCloudWrite = window.setTimeout(() => {
    pendingCloudWrite = null
    void writeLocalProgressToCloud(uid)
  }, CLOUD_SYNC_DEBOUNCE_MS)
}

export async function startCloudProgressSync(uid: string): Promise<void> {
  if (activeUid === uid && cloudSyncState.status === 'active') {
    return
  }

  stopCloudProgressSync()
  activeUid = uid
  setCloudSyncState({
    status: 'starting',
    message: 'синхронизация...',
    lastSyncedAt: null,
  })

  const services = await getFirebaseServices()

  if (!services) {
    setCloudSyncState({
      status: 'unavailable',
      message: 'Синхронизация недоступна',
    })
    return
  }

  try {
    const { doc, getDoc, onSnapshot, serverTimestamp, setDoc } = await import('firebase/firestore')
    const progressRef = doc(services.db, 'users', uid, 'state', 'progress')
    const localSnapshot = collectLocalProgressSnapshot()
    preserveLocalProgressBackup(localSnapshot)
    const remoteDoc = await getDoc(progressRef)
    const remoteSnapshot = normalizeRemoteSnapshot(remoteDoc.data())
    const mergedSnapshot = mergeProgressSnapshots(localSnapshot, remoteSnapshot)

    applyProgressSnapshot(mergedSnapshot)

    await setDoc(
      progressRef,
      {
        ...mergedSnapshot,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )

    stopCloudSnapshot = onSnapshot(
      progressRef,
      (snapshot) => {
        if (snapshot.metadata.hasPendingWrites) {
          return
        }

        const cloudSnapshot = normalizeRemoteSnapshot(snapshot.data())

        if (!cloudSnapshot) {
          return
        }

        const merged = mergeProgressSnapshots(collectLocalProgressSnapshot(), cloudSnapshot)
        applyProgressSnapshot(merged)
        setCloudSyncState({
          status: 'active',
          message: 'синхронизация включена',
          lastSyncedAt: new Date().toISOString(),
        })
      },
      () => {
        setCloudSyncState({
          status: 'failed',
          message: 'Не удалось синхронизировать прогресс',
        })
      },
    )

    const handleLocalProgressChange = () => scheduleCloudWrite(uid)
    window.addEventListener(PROGRESS_CHANGED_EVENT, handleLocalProgressChange)
    stopLocalChangeListener = () => window.removeEventListener(PROGRESS_CHANGED_EVENT, handleLocalProgressChange)

    setCloudSyncState({
      status: 'active',
      message: 'синхронизация включена',
      lastSyncedAt: new Date().toISOString(),
    })
  } catch {
    setCloudSyncState({
      status: 'failed',
      message: 'Не удалось синхронизировать прогресс',
    })
  }
}

export function stopCloudProgressSync(): void {
  stopCloudSnapshot?.()
  stopCloudSnapshot = null
  stopLocalChangeListener?.()
  stopLocalChangeListener = null
  activeUid = null

  if (pendingCloudWrite && typeof window !== 'undefined') {
    window.clearTimeout(pendingCloudWrite)
    pendingCloudWrite = null
  }

  setCloudSyncState(defaultCloudSyncState)
}

export async function syncLocalProgressToCloud(uid: string): Promise<SyncResult> {
  const services = await getFirebaseServices()

  if (!services) {
    return {
      ok: false,
      status: 'unavailable',
      message: 'Firebase не настроен',
    }
  }

  try {
    const { doc, getDoc, serverTimestamp, setDoc } = await import('firebase/firestore')
    const localSnapshot = collectLocalProgressSnapshot()
    preserveLocalProgressBackup(localSnapshot)

    const progressRef = doc(services.db, 'users', uid, 'state', 'progress')
    const remoteDoc = await getDoc(progressRef)
    const remoteSnapshot = normalizeRemoteSnapshot(remoteDoc.data())
    const mergedSnapshot = mergeProgressSnapshots(localSnapshot, remoteSnapshot)

    await setDoc(progressRef, {
      ...mergedSnapshot,
      syncedAt: serverTimestamp(),
    })

    applyProgressSnapshot(mergedSnapshot)

    return {
      ok: true,
      status: 'synced',
      snapshot: mergedSnapshot,
    }
  } catch (error) {
    return {
      ok: false,
      status: 'failed',
      message: error instanceof Error ? error.message : 'Не удалось синхронизировать прогресс',
    }
  }
}
