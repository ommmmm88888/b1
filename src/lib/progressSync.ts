import { getFirebaseServices } from './firebase'
import { firebaseConfigState } from './firebaseConfig'
import { SERVICE_WORKER_CACHE_VERSION } from './runtimeInfo'
import {
  dispatchProgressSynced,
  PROGRESS_CHANGED_EVENT,
  runWithoutProgressChangeEvent,
} from './progressEvents'
import {
  loadTrainerSessionSnapshot,
  saveTrainerSessionSnapshot,
  type TrainerSessionSnapshot,
} from './trainerSessionStorage'

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
  trainerSession?: TrainerSessionSnapshot | null
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

export type TrainerProgressSummary = {
  attempts: number
  correctAnswers: number
  mistakeTotal: number
  mistakeCards: number
  dailyCompletedCount: number
  streak: number
  updatedAt: string | null
}

export type TrainerSessionSummary = {
  mode: TrainerSessionSnapshot['mode']
  currentIndex: number
  itemCount: number
  checked: boolean
  finished: boolean
  updatedAt: string | null
}

export type SyncDiagnosticsState = {
  firebaseConfigured: boolean
  firestoreStatus: 'unknown' | 'available' | 'unavailable'
  listenerStatus: 'inactive' | 'starting' | 'active'
  activeUidSuffix: string | null
  lastCloudReadAt: string | null
  lastCloudWriteAt: string | null
  lastSyncError: string | null
  cloudTrainer: TrainerProgressSummary | null
  localTrainerSession: TrainerSessionSummary | null
  cloudTrainerSession: TrainerSessionSummary | null
  cacheVersion: string
}

export type SyncComparisonResult = {
  ok: true
  status: 'synced'
  matches: boolean
  local: TrainerProgressSummary
  cloud: TrainerProgressSummary | null
}

const BACKUP_PREFIX = 'b1:backup:before-cloud-sync:'
const CLOUD_SYNC_DEBOUNCE_MS = 450
const CLOUD_AUTOSAVE_INTERVAL_MS = 5000

const defaultCloudSyncState: CloudSyncState = {
  status: 'idle',
  message: '',
  lastSyncedAt: null,
}

const defaultSyncDiagnosticsState: SyncDiagnosticsState = {
  firebaseConfigured: firebaseConfigState.configured,
  firestoreStatus: 'unknown',
  listenerStatus: 'inactive',
  activeUidSuffix: null,
  lastCloudReadAt: null,
  lastCloudWriteAt: null,
  lastSyncError: null,
  cloudTrainer: null,
  localTrainerSession: null,
  cloudTrainerSession: null,
  cacheVersion: SERVICE_WORKER_CACHE_VERSION,
}

let cloudSyncState: CloudSyncState = defaultCloudSyncState
const cloudSyncListeners = new Set<CloudSyncListener>()
let syncDiagnosticsState: SyncDiagnosticsState = defaultSyncDiagnosticsState
const syncDiagnosticsListeners = new Set<(state: SyncDiagnosticsState) => void>()
let stopCloudSnapshot: (() => void) | null = null
let stopLocalChangeListener: (() => void) | null = null
let stopAutosaveListener: (() => void) | null = null
let autosaveInterval: ReturnType<typeof window.setInterval> | null = null
let pendingCloudWrite: ReturnType<typeof window.setTimeout> | null = null
let activeUid: string | null = null
let lastSavedFingerprint: string | null = null

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

function countMistakeCards(mistakesByItem: unknown): number {
  if (!isRecord(mistakesByItem)) {
    return 0
  }

  return Object.values(mistakesByItem).filter((count) => typeof count === 'number' && count > 0).length
}

function sumMistakes(mistakesByItem: unknown): number {
  if (!isRecord(mistakesByItem)) {
    return 0
  }

  return Object.values(mistakesByItem).reduce(
    (sum: number, count: unknown) => sum + (typeof count === 'number' ? count : 0),
    0,
  )
}

export function summarizeTrainerProgress(value: unknown): TrainerProgressSummary {
  const record = isRecord(value) ? value : {}

  return {
    attempts: typeof record.totalAttempts === 'number' ? record.totalAttempts : 0,
    correctAnswers: typeof record.correctAnswers === 'number' ? record.correctAnswers : 0,
    mistakeTotal: sumMistakes(record.mistakesByItem),
    mistakeCards: countMistakeCards(record.mistakesByItem),
    dailyCompletedCount: typeof record.dailyCompletedCount === 'number' ? record.dailyCompletedCount : 0,
    streak: typeof record.streak === 'number' ? record.streak : 0,
    updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : null,
  }
}

function isTrainerSessionSnapshot(value: unknown): value is TrainerSessionSnapshot {
  return (
    isRecord(value) &&
    value.schemaVersion === 1 &&
    (value.mode === 'daily' || value.mode === 'mistakes') &&
    Array.isArray(value.itemIds) &&
    value.itemIds.every((item) => typeof item === 'string') &&
    typeof value.currentIndex === 'number' &&
    typeof value.answer === 'string' &&
    typeof value.checked === 'boolean' &&
    (typeof value.correct === 'boolean' || value.correct === null) &&
    typeof value.revealedHint === 'boolean' &&
    typeof value.finished === 'boolean' &&
    typeof value.capturedAt === 'string'
  )
}

export function summarizeTrainerSession(value: unknown): TrainerSessionSummary | null {
  if (!isTrainerSessionSnapshot(value)) {
    return null
  }

  return {
    mode: value.mode,
    currentIndex: value.currentIndex,
    itemCount: value.itemIds.length,
    checked: value.checked,
    finished: value.finished,
    updatedAt: value.capturedAt,
  }
}

function trainerSummaryEquals(local: TrainerProgressSummary, remote: TrainerProgressSummary | null): boolean {
  if (!remote) {
    return false
  }

  return (
    local.attempts === remote.attempts &&
    local.correctAnswers === remote.correctAnswers &&
    local.mistakeTotal === remote.mistakeTotal &&
    local.mistakeCards === remote.mistakeCards &&
    local.dailyCompletedCount === remote.dailyCompletedCount &&
    local.streak === remote.streak
  )
}

function uidSuffix(uid: string): string {
  return uid.slice(-6)
}

function setSyncDiagnostics(next: Partial<SyncDiagnosticsState>): void {
  syncDiagnosticsState = { ...syncDiagnosticsState, ...next }
  syncDiagnosticsListeners.forEach((listener) => listener(syncDiagnosticsState))
}

function getSnapshotFingerprint(snapshot: ProgressSnapshot): string {
  return JSON.stringify({
    sections: snapshot.sections,
    trainerSession: snapshot.trainerSession ?? null,
  })
}

function markSnapshotSaved(snapshot: ProgressSnapshot): void {
  lastSavedFingerprint = getSnapshotFingerprint(snapshot)
}

function hasPendingAutosave(): boolean {
  return getSnapshotFingerprint(collectCloudProgressSnapshot()) !== lastSavedFingerprint
}

function startAutosaveHeartbeat(uid: string): void {
  if (typeof window === 'undefined') {
    return
  }

  if (autosaveInterval) {
    window.clearInterval(autosaveInterval)
  }

  autosaveInterval = window.setInterval(() => {
    if (activeUid !== uid || !hasPendingAutosave()) {
      return
    }

    scheduleCloudWrite(uid)
  }, CLOUD_AUTOSAVE_INTERVAL_MS)
}

function stopAutosaveHeartbeat(): void {
  if (typeof window === 'undefined') {
    return
  }

  if (autosaveInterval) {
    window.clearInterval(autosaveInterval)
    autosaveInterval = null
  }

  stopAutosaveListener?.()
  stopAutosaveListener = null
}

export function subscribeSyncDiagnostics(listener: (state: SyncDiagnosticsState) => void): () => void {
  syncDiagnosticsListeners.add(listener)
  listener(syncDiagnosticsState)

  return () => {
    syncDiagnosticsListeners.delete(listener)
  }
}

export function getSyncDiagnostics(): SyncDiagnosticsState {
  return syncDiagnosticsState
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

export function collectCloudProgressSnapshot(storage: Storage = window.localStorage): ProgressSnapshot {
  return {
    ...collectLocalProgressSnapshot(storage),
    trainerSession: loadTrainerSessionSnapshot(storage),
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

function mergeTrainerSession(local: TrainerSessionSnapshot | null, remote: TrainerSessionSnapshot | null): TrainerSessionSnapshot | null {
  if (!local) {
    return remote
  }

  if (!remote) {
    return local
  }

  if (local.finished !== remote.finished) {
    return remote.finished ? remote : local
  }

  if (local.currentIndex !== remote.currentIndex) {
    return remote.currentIndex > local.currentIndex ? remote : local
  }

  if (local.checked !== remote.checked) {
    return remote.checked ? remote : local
  }

  const localTime = Date.parse(local.capturedAt)
  const remoteTime = Date.parse(remote.capturedAt)

  return remoteTime > localTime ? remote : local
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
    trainerSession: mergeTrainerSession(local.trainerSession ?? null, remote.trainerSession ?? null),
  }
}

export function applyProgressSnapshot(snapshot: ProgressSnapshot, storage: Storage = window.localStorage): void {
  runWithoutProgressChangeEvent(() => {
    for (const section of Object.values(snapshot.sections)) {
      if (hasValue(section)) {
        storage.setItem(section.key, JSON.stringify(section.value))
      }
    }

    if (snapshot.trainerSession) {
      saveTrainerSessionSnapshot(snapshot.trainerSession, storage)
    }
  })

  dispatchProgressSynced()
}

export function normalizeRemoteSnapshot(value: unknown): ProgressSnapshot | null {
  if (!isRecord(value) || value.schemaVersion !== 1 || !isRecord(value.sections)) {
    return null
  }

  const trainerSession = 'trainerSession' in value && value.trainerSession !== null
    ? value.trainerSession
    : null

  return {
    schemaVersion: 1,
    capturedAt: typeof value.capturedAt === 'string' ? value.capturedAt : new Date().toISOString(),
    sections: value.sections as Record<ProgressSection, ProgressSectionSnapshot>,
    trainerSession: isTrainerSessionSnapshot(trainerSession) ? trainerSession : null,
  }
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
    setSyncDiagnostics({
      firestoreStatus: 'unavailable',
      lastSyncError: 'Firebase недоступен',
    })
    setCloudSyncState({
      status: 'unavailable',
      message: 'Синхронизация недоступна',
    })
    return
  }

  try {
    const { doc, serverTimestamp, setDoc } = await import('firebase/firestore')
    const snapshot = collectCloudProgressSnapshot()

    await setDoc(
      doc(services.db, 'users', uid, 'state', 'progress'),
      {
        ...snapshot,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )

    setSyncDiagnostics({
      firestoreStatus: 'available',
      lastCloudWriteAt: new Date().toISOString(),
      lastSyncError: null,
    })
    markSnapshotSaved(snapshot)
    setCloudSyncState({
      status: 'active',
      message: 'синхронизация включена',
      lastSyncedAt: new Date().toISOString(),
    })
  } catch {
    setSyncDiagnostics({
      firestoreStatus: 'available',
      lastSyncError: 'Не удалось синхронизировать прогресс',
    })
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

export function requestActiveCloudProgressSave(): void {
  if (!activeUid) {
    return
  }

  if (pendingCloudWrite && typeof window !== 'undefined') {
    window.clearTimeout(pendingCloudWrite)
    pendingCloudWrite = null
  }

  void writeLocalProgressToCloud(activeUid)
}

export async function startCloudProgressSync(uid: string): Promise<void> {
  if (activeUid === uid && cloudSyncState.status === 'active') {
    return
  }

  stopCloudProgressSync()
  activeUid = uid
  lastSavedFingerprint = null
  setSyncDiagnostics({
    activeUidSuffix: uidSuffix(uid),
    listenerStatus: 'starting',
    lastSyncError: null,
  })
  setCloudSyncState({
    status: 'starting',
    message: 'синхронизация...',
    lastSyncedAt: null,
  })

  const services = await getFirebaseServices()

  if (!services) {
    setSyncDiagnostics({
      firestoreStatus: 'unavailable',
      listenerStatus: 'inactive',
      lastSyncError: 'Firebase недоступен',
    })
    setCloudSyncState({
      status: 'unavailable',
      message: 'Синхронизация недоступна',
    })
    return
  }

  try {
    const { doc, getDoc, onSnapshot, serverTimestamp, setDoc } = await import('firebase/firestore')
    const progressRef = doc(services.db, 'users', uid, 'state', 'progress')
    const localSnapshot = collectCloudProgressSnapshot()
    preserveLocalProgressBackup(localSnapshot)
    const remoteDoc = await getDoc(progressRef)
    const remoteSnapshot = normalizeRemoteSnapshot(remoteDoc.data())
    const mergedSnapshot = mergeProgressSnapshots(localSnapshot, remoteSnapshot)

    applyProgressSnapshot(mergedSnapshot)
    markSnapshotSaved(mergedSnapshot)
    setSyncDiagnostics({
      firestoreStatus: 'available',
      lastCloudReadAt: new Date().toISOString(),
      lastSyncError: null,
      cloudTrainer: summarizeTrainerProgress(mergedSnapshot.sections.trainer.value),
      localTrainerSession: summarizeTrainerSession(mergedSnapshot.trainerSession),
      cloudTrainerSession: summarizeTrainerSession(mergedSnapshot.trainerSession),
    })

    await setDoc(
      progressRef,
      {
        ...mergedSnapshot,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )
    setSyncDiagnostics({
      lastCloudWriteAt: new Date().toISOString(),
      cloudTrainer: summarizeTrainerProgress(mergedSnapshot.sections.trainer.value),
    })

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
        markSnapshotSaved(merged)
        setSyncDiagnostics({
          firestoreStatus: 'available',
          listenerStatus: 'active',
          lastCloudReadAt: new Date().toISOString(),
          lastSyncError: null,
          cloudTrainer: summarizeTrainerProgress(cloudSnapshot.sections.trainer.value),
          localTrainerSession: summarizeTrainerSession(collectCloudProgressSnapshot().trainerSession),
          cloudTrainerSession: summarizeTrainerSession(cloudSnapshot.trainerSession),
        })
        setCloudSyncState({
          status: 'active',
          message: 'синхронизация включена',
          lastSyncedAt: new Date().toISOString(),
        })
      },
      () => {
        setSyncDiagnostics({
          listenerStatus: 'active',
          lastSyncError: 'Не удалось синхронизировать прогресс',
        })
        setCloudSyncState({
          status: 'failed',
          message: 'Не удалось синхронизировать прогресс',
        })
      },
    )

    const handleLocalProgressChange = () => scheduleCloudWrite(uid)
    window.addEventListener(PROGRESS_CHANGED_EVENT, handleLocalProgressChange)
    stopLocalChangeListener = () => window.removeEventListener(PROGRESS_CHANGED_EVENT, handleLocalProgressChange)

    const handleAutosaveFlush = () => {
      if (activeUid === uid && hasPendingAutosave()) {
        void writeLocalProgressToCloud(uid)
      }
    }

    window.addEventListener('pagehide', handleAutosaveFlush)
    document.addEventListener('visibilitychange', handleAutosaveFlush)
    stopAutosaveListener = () => {
      window.removeEventListener('pagehide', handleAutosaveFlush)
      document.removeEventListener('visibilitychange', handleAutosaveFlush)
    }
    startAutosaveHeartbeat(uid)

    setSyncDiagnostics({
      firestoreStatus: 'available',
      listenerStatus: 'active',
      cloudTrainer: summarizeTrainerProgress(mergedSnapshot.sections.trainer.value),
      localTrainerSession: summarizeTrainerSession(mergedSnapshot.trainerSession),
      cloudTrainerSession: summarizeTrainerSession(mergedSnapshot.trainerSession),
    })
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
  stopAutosaveHeartbeat()
  activeUid = null
  lastSavedFingerprint = null

  if (pendingCloudWrite && typeof window !== 'undefined') {
    window.clearTimeout(pendingCloudWrite)
    pendingCloudWrite = null
  }

  setSyncDiagnostics({
    listenerStatus: 'inactive',
    activeUidSuffix: null,
  })
  setCloudSyncState(defaultCloudSyncState)
}

export async function loadCloudProgressToLocal(uid: string): Promise<SyncResult> {
  const services = await getFirebaseServices()

  if (!services) {
    setSyncDiagnostics({
      firestoreStatus: 'unavailable',
      lastSyncError: 'Firebase не настроен',
    })
    return {
      ok: false,
      status: 'unavailable',
      message: 'Firebase не настроен',
    }
  }

  try {
    const { doc, getDoc } = await import('firebase/firestore')
    const progressRef = doc(services.db, 'users', uid, 'state', 'progress')
    const remoteDoc = await getDoc(progressRef)
    const remoteSnapshot = normalizeRemoteSnapshot(remoteDoc.data())

    if (!remoteSnapshot) {
      setSyncDiagnostics({
        firestoreStatus: 'available',
        lastCloudReadAt: new Date().toISOString(),
        lastSyncError: 'Облачный прогресс не найден',
      })
      return {
        ok: false,
        status: 'failed',
        message: 'Облачный прогресс не найден',
      }
    }

    const localCloudSnapshot = collectCloudProgressSnapshot()
    const mergedSnapshot = mergeProgressSnapshots(localCloudSnapshot, remoteSnapshot)
    applyProgressSnapshot(mergedSnapshot)
    markSnapshotSaved(mergedSnapshot)
    setSyncDiagnostics({
      firestoreStatus: 'available',
      lastCloudReadAt: new Date().toISOString(),
      lastSyncError: null,
      cloudTrainer: summarizeTrainerProgress(remoteSnapshot.sections.trainer.value),
      localTrainerSession: summarizeTrainerSession(localCloudSnapshot.trainerSession),
      cloudTrainerSession: summarizeTrainerSession(remoteSnapshot.trainerSession),
    })

    return {
      ok: true,
      status: 'synced',
      snapshot: mergedSnapshot,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Не удалось загрузить прогресс из облака'
    setSyncDiagnostics({
      firestoreStatus: 'available',
      lastSyncError: message,
    })
    return {
      ok: false,
      status: 'failed',
      message,
    }
  }
}

export async function saveLocalProgressToCloud(uid: string): Promise<SyncResult> {
  const services = await getFirebaseServices()

  if (!services) {
    setSyncDiagnostics({
      firestoreStatus: 'unavailable',
      lastSyncError: 'Firebase не настроен',
    })
    return {
      ok: false,
      status: 'unavailable',
      message: 'Firebase не настроен',
    }
  }

  try {
    const { doc, getDoc, serverTimestamp, setDoc } = await import('firebase/firestore')
    const localSnapshot = collectCloudProgressSnapshot()
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
    markSnapshotSaved(mergedSnapshot)
    setSyncDiagnostics({
      firestoreStatus: 'available',
      lastCloudReadAt: new Date().toISOString(),
      lastCloudWriteAt: new Date().toISOString(),
      lastSyncError: null,
      cloudTrainer: summarizeTrainerProgress(mergedSnapshot.sections.trainer.value),
      localTrainerSession: summarizeTrainerSession(localSnapshot.trainerSession),
      cloudTrainerSession: summarizeTrainerSession(mergedSnapshot.trainerSession),
    })

    return {
      ok: true,
      status: 'synced',
      snapshot: mergedSnapshot,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Не удалось синхронизировать прогресс'
    setSyncDiagnostics({
      firestoreStatus: 'available',
      lastSyncError: message,
    })
    return {
      ok: false,
      status: 'failed',
      message,
    }
  }
}

export async function syncLocalProgressToCloud(uid: string): Promise<SyncResult> {
  return saveLocalProgressToCloud(uid)
}

export async function compareCloudProgress(
  uid: string,
): Promise<SyncComparisonResult | { ok: false; status: 'unavailable' | 'failed'; message: string }> {
  const services = await getFirebaseServices()

  if (!services) {
    setSyncDiagnostics({
      firestoreStatus: 'unavailable',
      lastSyncError: 'Firebase не настроен',
    })
    return {
      ok: false,
      status: 'unavailable',
      message: 'Firebase не настроен',
    }
  }

  try {
    const { doc, getDoc } = await import('firebase/firestore')
    const progressRef = doc(services.db, 'users', uid, 'state', 'progress')
    const remoteDoc = await getDoc(progressRef)
    const remoteSnapshot = normalizeRemoteSnapshot(remoteDoc.data())
    const localSnapshot = collectCloudProgressSnapshot()
    const localSummary = summarizeTrainerProgress(localSnapshot.sections.trainer.value)
    const cloudSummary = remoteSnapshot ? summarizeTrainerProgress(remoteSnapshot.sections.trainer.value) : null

    setSyncDiagnostics({
      firestoreStatus: 'available',
      lastCloudReadAt: new Date().toISOString(),
      lastSyncError: remoteSnapshot ? null : 'Облачный прогресс не найден',
      cloudTrainer: cloudSummary,
      localTrainerSession: summarizeTrainerSession(localSnapshot.trainerSession),
      cloudTrainerSession: summarizeTrainerSession(remoteSnapshot?.trainerSession ?? null),
    })

    return {
      ok: true,
      status: 'synced',
      matches: trainerSummaryEquals(localSummary, cloudSummary),
      local: localSummary,
      cloud: cloudSummary,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Не удалось проверить синхронизацию'
    setSyncDiagnostics({
      firestoreStatus: 'available',
      lastSyncError: message,
    })
    return {
      ok: false,
      status: 'failed',
      message,
    }
  }
}
