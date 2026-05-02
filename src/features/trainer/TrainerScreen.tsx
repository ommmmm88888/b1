import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { b1Vocabulary } from '../../data/b1Vocabulary'
import { isAnswerCorrect } from '../../lib/answerCheck'
import { applyAnswerEditForRetry } from '../../lib/answerRetryState'
import { buildAnswerDiff, getMistakeLevel } from '../../lib/answerFeedback'
import {
  loadProgress,
  markDailySessionCompleted,
  recordAttempt,
  saveProgress,
} from '../../lib/progressStorage'
import { PROGRESS_SYNCED_EVENT } from '../../lib/progressEvents'
import { requestActiveCloudProgressSave, subscribeCloudSyncState } from '../../lib/progressSync'
import {
  createTrainerSessionSnapshot,
  loadTrainerSessionSnapshot,
  saveTrainerSessionSnapshot,
  type TrainerSessionSnapshot,
} from '../../lib/trainerSessionStorage'
import type { ProgressState, VocabularyItem } from '../../types/training'

type SessionMode = 'daily' | 'mistakes'

interface SessionState {
  mode: SessionMode
  items: VocabularyItem[]
  currentIndex: number
  answer: string
  checked: boolean
  correct: boolean | null
  revealedHint: boolean
  finished: boolean
}

const SESSION_GOAL = 10

function shuffle(items: VocabularyItem[]): VocabularyItem[] {
  const copy = [...items]

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]]
  }

  return copy
}

function getTodayKey(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = `${now.getMonth() + 1}`.padStart(2, '0')
  const day = `${now.getDate()}`.padStart(2, '0')

  return `${year}-${month}-${day}`
}

function buildSessionItems(mode: SessionMode, progress: ProgressState): VocabularyItem[] {
  if (mode === 'mistakes') {
    const mistakeItems = b1Vocabulary.filter((item) => (progress.mistakesByItem[item.id] ?? 0) > 0)
    return mistakeItems.length > 0 ? mistakeItems.slice(0, SESSION_GOAL) : shuffle(b1Vocabulary).slice(0, SESSION_GOAL)
  }

  return shuffle(b1Vocabulary).slice(0, SESSION_GOAL)
}

function createSession(mode: SessionMode, progress: ProgressState): SessionState {
  return {
    mode,
    items: buildSessionItems(mode, progress),
    currentIndex: 0,
    answer: '',
    checked: false,
    correct: null,
    revealedHint: false,
    finished: false,
  }
}

function createSessionFromSnapshot(snapshot: TrainerSessionSnapshot | null, progress: ProgressState): SessionState {
  if (!snapshot) {
    return createSession('daily', progress)
  }

  const itemById = new Map(b1Vocabulary.map((item) => [item.id, item] as const))
  const items = snapshot.itemIds.map((itemId) => itemById.get(itemId)).filter(Boolean) as VocabularyItem[]

  if (items.length === 0) {
    return createSession(snapshot.mode, progress)
  }

  return {
    mode: snapshot.mode,
    items,
    currentIndex: Math.min(snapshot.currentIndex, Math.max(items.length - 1, 0)),
    answer: snapshot.answer,
    checked: snapshot.checked,
    correct: snapshot.correct,
    revealedHint: snapshot.revealedHint,
    finished: snapshot.finished,
  }
}

function createSessionSnapshot(session: SessionState): TrainerSessionSnapshot {
  return createTrainerSessionSnapshot({
    mode: session.mode,
    itemIds: session.items.map((item) => item.id),
    currentIndex: session.currentIndex,
    answer: session.answer,
    checked: session.checked,
    correct: session.correct,
    revealedHint: session.revealedHint,
    finished: session.finished,
  })
}

export function TrainerScreen() {
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress())
  const [session, setSession] = useState<SessionState>(() =>
    createSessionFromSnapshot(loadTrainerSessionSnapshot(), loadProgress()),
  )
  const answerInputRef = useRef<HTMLInputElement | null>(null)
  const nextButtonRef = useRef<HTMLButtonElement | null>(null)
  const startSessionButtonRef = useRef<HTMLButtonElement | null>(null)
  const skipHydrationSaveRef = useRef(0)
  const skipSyncSaveRef = useRef(false)
  const skipSessionSyncSaveRef = useRef(true)

  const currentItem = session.items[session.currentIndex]

  const refreshProgressFromStorage = useCallback(() => {
    skipSyncSaveRef.current = true
    skipSessionSyncSaveRef.current = true
    const currentProgress = loadProgress()
    setProgress(currentProgress)
    setSession(createSessionFromSnapshot(loadTrainerSessionSnapshot(), currentProgress))
  }, [])

  const commitProgress = useCallback(
    (updater: (current: ProgressState) => ProgressState) => {
      setProgress((current) => {
        const nextProgress = updater(current)
        skipSyncSaveRef.current = true
        saveProgress(nextProgress)
        return nextProgress
      })
    },
    [],
  )

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      skipHydrationSaveRef.current = 2
      refreshProgressFromStorage()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [refreshProgressFromStorage])

  useEffect(() => {
    saveTrainerSessionSnapshot(createSessionSnapshot(session))

    if (skipSessionSyncSaveRef.current) {
      skipSessionSyncSaveRef.current = false
      return
    }

    requestActiveCloudProgressSave()
  }, [session])

  useEffect(() => {
    if (skipHydrationSaveRef.current > 0) {
      skipHydrationSaveRef.current -= 1
      return
    }

    if (skipSyncSaveRef.current) {
      skipSyncSaveRef.current = false
      return
    }

    saveProgress(progress)
  }, [progress])

  useEffect(() => {
    const handleProgressSynced = () => {
      refreshProgressFromStorage()
    }

    window.addEventListener(PROGRESS_SYNCED_EVENT, handleProgressSynced)

    return () => window.removeEventListener(PROGRESS_SYNCED_EVENT, handleProgressSynced)
  }, [refreshProgressFromStorage])

  useEffect(() => {
    const unsubscribe = subscribeCloudSyncState((state) => {
      if (state.status === 'active') {
        refreshProgressFromStorage()
      }
    })

    return unsubscribe
  }, [refreshProgressFromStorage])

  useEffect(() => {
    const handleFocus = () => refreshProgressFromStorage()
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshProgressFromStorage()
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [refreshProgressFromStorage])

  useEffect(() => {
    if (session.finished) {
      startSessionButtonRef.current?.focus()
      return
    }

    if (session.checked) {
      nextButtonRef.current?.focus()
      return
    }

    answerInputRef.current?.focus()
  }, [session.checked, session.currentIndex, session.finished])

  const sessionStats = useMemo(() => {
    const attempts = progress.totalAttempts
    const correctAnswers = progress.correctAnswers
    const accuracy = attempts > 0 ? (correctAnswers / attempts) * 100 : 0
    const mistakeTotal = Object.values(progress.mistakesByItem).reduce((sum, count) => sum + count, 0)
    const mistakeCards = Object.values(progress.mistakesByItem).filter((count) => count > 0).length

    return {
      attempts,
      correctAnswers,
      accuracy,
      mistakeTotal,
      mistakeCards,
    }
  }, [progress.correctAnswers, progress.mistakesByItem, progress.totalAttempts])

  const sessionProgress = session.items.length > 0 ? session.currentIndex / session.items.length : 0
  const completedCount = session.items.length === 0 ? 0 : Math.min(session.currentIndex + (session.checked ? 1 : 0), session.items.length)
  const roundCompletionLabel = `${completedCount}/${session.items.length || 0}`
  const deckAccuracy = `${sessionStats.correctAnswers}/${sessionStats.attempts}`
  const currentMistakes = currentItem ? progress.mistakesByItem[currentItem.id] ?? 0 : 0
  const mistakeLevel = getMistakeLevel(currentMistakes)
  const expectedAnswer = currentItem?.acceptedAnswers[0] ?? ''
  const answerDiff = buildAnswerDiff(session.answer, expectedAnswer)

  function handleCheck() {
    if (!currentItem || session.checked) {
      return
    }

    const correct = isAnswerCorrect(session.answer, currentItem.acceptedAnswers)

    commitProgress((current) => recordAttempt(current, currentItem.id, correct))
    setSession((current) => ({
      ...current,
      checked: true,
      correct,
      revealedHint: !correct,
    }))

    window.setTimeout(() => {
      nextButtonRef.current?.focus()
    }, 0)
  }

  function handleNext() {
    if (!session.checked || !currentItem) {
      return
    }

    const isLastItem = session.currentIndex >= session.items.length - 1

    if (isLastItem) {
      if (session.mode === 'daily') {
        const today = getTodayKey()
        commitProgress((current) => markDailySessionCompleted(current, today))
      }

      setSession((current) => ({
        ...current,
        finished: true,
      }))

      window.setTimeout(() => {
        startSessionButtonRef.current?.focus()
      }, 0)
      return
    }

    setSession((current) => ({
      ...current,
      currentIndex: current.currentIndex + 1,
      answer: '',
      checked: false,
      correct: null,
      revealedHint: false,
    }))

    window.setTimeout(() => {
      answerInputRef.current?.focus()
    }, 0)
  }

  function handleRepeatMistakes() {
    const currentProgress = loadProgress()
    setSession(createSession('mistakes', currentProgress))
  }

  function handleStartDaily() {
    const currentProgress = loadProgress()
    setSession(createSession('daily', currentProgress))
  }

  function handleAnswerKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') {
      return
    }

    event.preventDefault()

    if (session.checked) {
      handleNext()
      return
    }

    handleCheck()
  }

  const sessionTitle = session.mode === 'daily' ? 'Ежедневная практика' : 'Повтор ошибок'
  const sessionSubtitle =
    session.mode === 'daily'
      ? '10 коротких заданий на практический RU → PL перевод.'
      : 'Карточки, где раньше были ошибки. Удобно для добора слабых мест.'

  return (
    <main className="app-shell">
      <div className="app-shell__grid">
        <section className="trainer-card trainer-card--compact">
          <div className="trainer-compact-status">
            <div className="pill">
              <strong>Режим:</strong>
              <span>{session.mode === 'daily' ? 'обычный' : 'ошибки'}</span>
            </div>
            <div className="pill">
              <strong>Прогресс:</strong>
              <span>{roundCompletionLabel}</span>
            </div>
            <div className="pill">
              <strong>Точность:</strong>
              <span>{`${Math.round(sessionStats.accuracy)}%`}</span>
            </div>
            <div className="pill">
              <strong>Ошибок:</strong>
              <span>{sessionStats.mistakeTotal}</span>
            </div>
            <div className="pill">
              <strong>Цель:</strong>
              <span>{SESSION_GOAL}</span>
            </div>
          </div>
          <div className="trainer-card__top">
            <div>
              <h2>{sessionTitle}</h2>
              <p className="muted">{sessionSubtitle}</p>
            </div>
            <details className="trainer-info-details">
              <summary>Сводка и подсказки</summary>
              <div className="trainer-info-details__content">
                <div className="summary-card__metrics">
                  <div className="summary-card__metric">
                    <span>Попытки</span>
                    <strong>{sessionStats.attempts}</strong>
                  </div>
                  <div className="summary-card__metric">
                    <span>Правильные</span>
                    <strong>{deckAccuracy}</strong>
                  </div>
                  <div className="summary-card__metric">
                    <span>Карточек с ошибками</span>
                    <strong>{sessionStats.mistakeCards}</strong>
                  </div>
                  <div className="summary-card__metric">
                    <span>Серия</span>
                    <strong>{progress.streak} дн.</strong>
                  </div>
                </div>
              </div>
            </details>
          </div>

          <div className="progress-block">
            <div className="progress-label">
              <span>
                Задание {session.items.length > 0 ? session.currentIndex + 1 : 0} из{' '}
                {session.items.length}
              </span>
              <span>{roundCompletionLabel}</span>
            </div>
            <div className="progress-bar" aria-hidden="true">
              <div
                className="progress-bar__fill"
                style={{ width: `${Math.max(4, sessionProgress * 100)}%` }}
              />
            </div>
          </div>

          {session.finished ? (
            <div className="summary-card">
              <h3>Сессия завершена</h3>
              <p>
                Вы прошли {session.items.length} заданий. Это удобная точка для фиксации прогресса
                и повторения ошибок.
              </p>
              <div className="summary-card__metrics">
              <div className="summary-card__metric">
                <span>Точность за все время</span>
                  <strong>{`${Math.round(sessionStats.accuracy)}%`}</strong>
                </div>
                <div className="summary-card__metric">
                  <span>Карточек с ошибками</span>
                  <strong>{sessionStats.mistakeCards}</strong>
                </div>
                <div className="summary-card__metric">
                  <span>Ежедневных завершений</span>
                  <strong>{progress.dailyCompletedCount}</strong>
                </div>
                <div className="summary-card__metric">
                  <span>Серия</span>
                  <strong>{progress.streak} дн.</strong>
                </div>
              </div>
              <div className="summary-card__actions">
                <button
                  className="button button--primary"
                  type="button"
                  ref={startSessionButtonRef}
                  onClick={handleStartDaily}
                >
                  Начать новую дневную сессию
                </button>
                <button className="button" type="button" onClick={handleRepeatMistakes}>
                  Повторить ошибки
                </button>
              </div>
            </div>
          ) : currentItem ? (
            <>
              <div className="card-stage">
                <div className="card-stage__header">
                  <span className="card-stage__category">{currentItem.category}</span>
                  <p className="card-stage__prompt">{currentItem.ruPrompt}</p>
                </div>

                <div className="input-row">
                  <label htmlFor="answer">Введите перевод на польский</label>
                  <input
                    ref={answerInputRef}
                    id="answer"
                    value={session.answer}
                    onKeyDown={handleAnswerKeyDown}
                    onChange={(event) => {
                      const answer = event.target.value

                      setSession((current) => applyAnswerEditForRetry(current, answer))
                    }}
                    placeholder="Например: Muszę wziąć pod uwagę cenę"
                    autoComplete="off"
                    spellCheck={false}
                    inputMode="text"
                  />
                </div>

                {session.revealedHint ? (
                  <div className="card-stage__hint">
                    <strong>Подсказка:</strong> {currentItem.hintRu}
                  </div>
                ) : (
                  <div className="card-stage__hint">
                    <strong>Подсказка:</strong> попробуйте сначала без нее, потом откроется автоматически после ошибки.
                  </div>
                )}

                <div className="button-row">
                  <button className="button button--primary" type="button" onClick={handleCheck} disabled={session.checked}>
                    Проверить
                  </button>
                  <button
                    className="button"
                    type="button"
                    ref={nextButtonRef}
                    onClick={handleNext}
                    disabled={!session.checked}
                  >
                    Следующее
                  </button>
                  <button className="button button--ghost" type="button" onClick={handleRepeatMistakes}>
                    Повторить ошибки
                  </button>
                </div>

                {session.checked && session.correct !== null ? (
                  <div className="feedback feedback--compact">
                    <div
                      className={`feedback__status ${
                        session.correct ? 'feedback__status--correct' : 'feedback__status--wrong'
                      }`}
                    >
                      {session.correct ? 'Ответ верный' : 'Ответ неверный'}
                    </div>
                    {!session.correct ? (
                      <div className={`mistake-badge mistake-badge--${mistakeLevel.level}`}>
                        {mistakeLevel.label}
                      </div>
                    ) : null}
                    <div className="card-stage__answer">
                      <strong>Ваш ответ:</strong> {session.answer.trim() || '—'}
                    </div>
                    <div className="card-stage__answer">
                      <strong>Правильный ответ:</strong> {currentItem.acceptedAnswers[0]}
                    </div>
                    {!session.correct ? (
                      <div className="answer-diff" aria-label="Разбор различий в ответе">
                        {answerDiff.map((chunk, index) => (
                          <span key={`${chunk.text}-${index}`} className={`answer-diff__token answer-diff__token--${chunk.type}`}>
                            {chunk.parts
                              ? chunk.parts.map((part, partIndex) => (
                                  <span
                                    key={`${part.text}-${partIndex}`}
                                    className={part.changed ? 'answer-diff__char--changed' : undefined}
                                  >
                                    {part.text}
                                  </span>
                                ))
                              : chunk.text}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <div className="card-stage__explanation">
                      <strong>Почему так:</strong> {currentItem.explanationRu}
                    </div>
                    <div className="muted">
                      Ошибок по этой карточке: {currentMistakes}
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <div className="empty-state">Сессия пуста. Начните новую практику.</div>
          )}
        </section>
      </div>
    </main>
  )
}
