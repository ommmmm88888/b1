import { getFirebaseServices } from './firebase'

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

const BACKUP_PREFIX = 'b1:backup:before-cloud-sync:'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
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

function hasValue(section: ProgressSectionSnapshot): boolean {
  return section.value !== null && section.value !== undefined
}

function resolveSection(
  local: ProgressSectionSnapshot,
  remote: ProgressSectionSnapshot | undefined,
): ProgressSectionSnapshot {
  if (!remote || !hasValue(remote)) {
    return local
  }

  if (!hasValue(local)) {
    return remote
  }

  if (local.updatedAt && remote.updatedAt) {
    return Date.parse(remote.updatedAt) > Date.parse(local.updatedAt) ? remote : local
  }

  return remote
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
      return [key, resolveSection(local.sections[key], remote.sections[key])]
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
  for (const section of Object.values(snapshot.sections)) {
    if (hasValue(section)) {
      storage.setItem(section.key, JSON.stringify(section.value))
    }
  }
}

function normalizeRemoteSnapshot(value: unknown): ProgressSnapshot | null {
  if (!isRecord(value) || value.schemaVersion !== 1 || !isRecord(value.sections)) {
    return null
  }

  return value as ProgressSnapshot
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

    const progressRef = doc(services.db, 'users', uid, 'progress', 'current')
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
