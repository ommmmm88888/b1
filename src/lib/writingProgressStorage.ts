import type { WritingProgressState, WritingTaskProgress } from '../types/writing'

const STORAGE_KEY = 'b1_writing_progress_v0'

function nowIso(): string {
  return new Date().toISOString()
}

function createTaskProgress(): WritingTaskProgress {
  return {
    draft: '',
    checkedCriteria: [],
    updatedAt: nowIso(),
  }
}

export function createInitialWritingProgress(selectedTaskId: string): WritingProgressState {
  return {
    selectedTaskId,
    tasks: {},
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeTaskProgress(value: unknown): WritingTaskProgress {
  if (!isRecord(value)) {
    return createTaskProgress()
  }

  return {
    draft: typeof value.draft === 'string' ? value.draft : '',
    checkedCriteria: Array.isArray(value.checkedCriteria)
      ? value.checkedCriteria.filter((item): item is string => typeof item === 'string')
      : [],
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : nowIso(),
  }
}

export function loadWritingProgress(defaultTaskId: string): WritingProgressState {
  if (typeof window === 'undefined') {
    return createInitialWritingProgress(defaultTaskId)
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return createInitialWritingProgress(defaultTaskId)
  }

  try {
    const parsed: unknown = JSON.parse(raw)

    if (!isRecord(parsed)) {
      return createInitialWritingProgress(defaultTaskId)
    }

    const tasks: Record<string, WritingTaskProgress> = {}

    if (isRecord(parsed.tasks)) {
      for (const [taskId, value] of Object.entries(parsed.tasks)) {
        tasks[taskId] = normalizeTaskProgress(value)
      }
    }

    return {
      selectedTaskId: typeof parsed.selectedTaskId === 'string' ? parsed.selectedTaskId : defaultTaskId,
      tasks,
    }
  } catch {
    return createInitialWritingProgress(defaultTaskId)
  }
}

export function saveWritingProgress(progress: WritingProgressState): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function getWritingTaskProgress(
  progress: WritingProgressState,
  taskId: string,
): WritingTaskProgress {
  return progress.tasks[taskId] ?? createTaskProgress()
}

export function setSelectedWritingTask(
  progress: WritingProgressState,
  selectedTaskId: string,
): WritingProgressState {
  return {
    ...progress,
    selectedTaskId,
  }
}

export function setWritingDraft(
  progress: WritingProgressState,
  taskId: string,
  draft: string,
): WritingProgressState {
  const taskProgress = getWritingTaskProgress(progress, taskId)

  return {
    ...progress,
    tasks: {
      ...progress.tasks,
      [taskId]: {
        ...taskProgress,
        draft,
        updatedAt: nowIso(),
      },
    },
  }
}

export function setWritingCriterionChecked(
  progress: WritingProgressState,
  taskId: string,
  criterion: string,
  checked: boolean,
): WritingProgressState {
  const taskProgress = getWritingTaskProgress(progress, taskId)
  const criteria = new Set(taskProgress.checkedCriteria)

  if (checked) {
    criteria.add(criterion)
  } else {
    criteria.delete(criterion)
  }

  return {
    ...progress,
    tasks: {
      ...progress.tasks,
      [taskId]: {
        ...taskProgress,
        checkedCriteria: [...criteria],
        updatedAt: nowIso(),
      },
    },
  }
}

export function clearWritingTask(progress: WritingProgressState, taskId: string): WritingProgressState {
  return {
    ...progress,
    tasks: {
      ...progress.tasks,
      [taskId]: createTaskProgress(),
    },
  }
}
