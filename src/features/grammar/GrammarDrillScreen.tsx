import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { grammarDrills, grammarTopics } from '../../data/grammarDrills'
import { isAnswerCorrect } from '../../lib/answerCheck'
import { applyAnswerEditForRetry } from '../../lib/answerRetryState'
import { buildAnswerDiff, getMistakeLevel } from '../../lib/answerFeedback'
import {
  loadGrammarProgress,
  recordGrammarAttempt,
  saveGrammarProgress,
} from '../../lib/grammarProgressStorage'
import { PROGRESS_SYNCED_EVENT } from '../../lib/progressEvents'
import { requestActiveCloudProgressSave, subscribeCloudSyncState } from '../../lib/progressSync'
import {
  createGrammarSessionSnapshot,
  loadGrammarSessionSnapshot,
  saveGrammarSessionSnapshot,
  type GrammarSessionSnapshot,
} from '../../lib/grammarSessionStorage'
import type { GrammarProgressState, GrammarTask, GrammarTopicId } from '../../types/grammar'

interface GrammarSession {
  topicId: GrammarTopicId
  taskIndex: number
  answer: string
  checked: boolean
  correct: boolean | null
}

function createSession(topicId: GrammarTopicId): GrammarSession {
  return {
    topicId,
    taskIndex: 0,
    answer: '',
    checked: false,
    correct: null,
  }
}

function createSessionFromSnapshot(snapshot: GrammarSessionSnapshot | null): GrammarSession {
  if (!snapshot) {
    return createSession(grammarTopics[0].id)
  }

  const topicExists = grammarTopics.some((topic) => topic.id === snapshot.topicId)
  if (!topicExists) {
    return createSession(grammarTopics[0].id)
  }

  const topicId = snapshot.topicId as GrammarTopicId
  const tasks = getTasksByTopic(topicId)
  if (tasks.length === 0) {
    return createSession(grammarTopics[0].id)
  }

  return {
    topicId,
    taskIndex: Math.min(Math.max(snapshot.taskIndex, 0), tasks.length - 1),
    answer: snapshot.answer,
    checked: snapshot.checked,
    correct: snapshot.correct,
  }
}

function createSessionSnapshot(session: GrammarSession): GrammarSessionSnapshot {
  return createGrammarSessionSnapshot({
    topicId: session.topicId,
    taskIndex: session.taskIndex,
    answer: session.answer,
    checked: session.checked,
    correct: session.correct,
  })
}

function getTasksByTopic(topicId: GrammarTopicId): GrammarTask[] {
  return grammarDrills.filter((task) => task.topicId === topicId)
}

export function GrammarDrillScreen() {
  const [progress, setProgress] = useState(() => loadGrammarProgress())
  const [session, setSession] = useState<GrammarSession>(() => createSessionFromSnapshot(loadGrammarSessionSnapshot()))
  const answerInputRef = useRef<HTMLInputElement | null>(null)
  const nextButtonRef = useRef<HTMLButtonElement | null>(null)
  const choiceInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const skipHydrationSaveRef = useRef(0)
  const skipProgressSyncSaveRef = useRef(false)
  const skipSessionSyncSaveRef = useRef(true)

  const topic = grammarTopics.find((item) => item.id === session.topicId) ?? grammarTopics[0]
  const topicTasks = useMemo(() => getTasksByTopic(session.topicId), [session.topicId])
  const currentTask = topicTasks[session.taskIndex] ?? topicTasks[0]
  const attempts = progress.totalAttempts
  const accuracy = attempts > 0 ? Math.round((progress.correctAnswers / attempts) * 100) : 0
  const currentMistakes = currentTask ? progress.mistakesByTaskId[currentTask.id] ?? 0 : 0
  const mistakeLevel = getMistakeLevel(currentMistakes)
  const sessionPosition = topicTasks.length > 0 ? session.taskIndex + 1 : 0
  const expectedAnswer = currentTask?.acceptedAnswers[0] ?? ''
  const answerDiff = buildAnswerDiff(session.answer, expectedAnswer)

  const refreshProgressFromStorage = useCallback(() => {
    skipProgressSyncSaveRef.current = true
    skipSessionSyncSaveRef.current = true
    setProgress(loadGrammarProgress())
    setSession(createSessionFromSnapshot(loadGrammarSessionSnapshot()))
  }, [])

  const commitProgress = useCallback((updater: (current: GrammarProgressState) => GrammarProgressState) => {
    setProgress((current) => {
      const nextProgress = updater(current)
      skipProgressSyncSaveRef.current = true
      saveGrammarProgress(nextProgress)
      return nextProgress
    })
  }, [])

  const commitSession = useCallback((nextSession: GrammarSession) => {
    skipSessionSyncSaveRef.current = true
    saveGrammarSessionSnapshot(createSessionSnapshot(nextSession), window.localStorage, { notify: false })
    setSession(nextSession)
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      skipHydrationSaveRef.current = 2
      refreshProgressFromStorage()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [refreshProgressFromStorage])

  useEffect(() => {
    if (skipHydrationSaveRef.current > 0) {
      skipHydrationSaveRef.current -= 1
      return
    }

    if (skipProgressSyncSaveRef.current) {
      skipProgressSyncSaveRef.current = false
      saveGrammarProgress(progress)
      return
    }

    saveGrammarProgress(progress)
    requestActiveCloudProgressSave()
  }, [progress])

  useEffect(() => {
    if (skipSessionSyncSaveRef.current) {
      skipSessionSyncSaveRef.current = false
      return
    }

    saveGrammarSessionSnapshot(createSessionSnapshot(session), window.localStorage, { notify: false })
    requestActiveCloudProgressSave()
  }, [session])

  useEffect(() => {
    const handleSynced = () => {
      refreshProgressFromStorage()
    }

    window.addEventListener(PROGRESS_SYNCED_EVENT, handleSynced)
    return () => window.removeEventListener(PROGRESS_SYNCED_EVENT, handleSynced)
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
    if (session.checked) {
      nextButtonRef.current?.focus()
      return
    }

    if (currentTask?.answerMode === 'choice') {
      const selectedChoice = choiceInputRefs.current.find((input) => input?.checked) ?? choiceInputRefs.current[0]
      selectedChoice?.focus()
      return
    }

    answerInputRef.current?.focus()
  }, [currentTask?.answerMode, session.checked, session.taskIndex, session.topicId])

  function handleSelectTopic(topicId: GrammarTopicId) {
    const nextSession = createSession(topicId)

    commitSession(nextSession)
    requestActiveCloudProgressSave()
  }

  function handleCheck() {
    if (!currentTask || session.checked) {
      return
    }

    const candidate = currentTask.answerMode === 'choice' ? session.answer : session.answer.trim()
    const correct = isAnswerCorrect(candidate, currentTask.acceptedAnswers)
    const nextSession = {
      ...session,
      checked: true,
      correct,
    }

    commitProgress((current) => recordGrammarAttempt(current, currentTask.id, correct))
    commitSession(nextSession)
    requestActiveCloudProgressSave()

    window.setTimeout(() => {
      nextButtonRef.current?.focus()
    }, 0)
  }

  function handleNext() {
    const nextSession = {
      ...session,
      taskIndex: topicTasks.length > 0 ? (session.taskIndex + 1) % topicTasks.length : 0,
      answer: '',
      checked: false,
      correct: null,
    }

    commitSession(nextSession)
    requestActiveCloudProgressSave()

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

  function handleChoiceKeyDown(event: KeyboardEvent<HTMLInputElement>) {
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

  return (
    <main className="app-shell">
      <div className="app-shell__grid">
        <section className="trainer-card trainer-card--compact" aria-labelledby="grammar-title">
          <div className="trainer-compact-status">
            <div className="pill">
              <strong>Тем:</strong>
              <span>{grammarTopics.length}</span>
            </div>
            <div className="pill">
              <strong>Тема:</strong>
              <span>{topic.titleRu}</span>
            </div>
            <div className="pill">
              <strong>Точность:</strong>
              <span>{accuracy}%</span>
            </div>
            <div className="pill">
              <strong>Ошибок:</strong>
              <span>{Object.values(progress.mistakesByTaskId).reduce((sum, count) => sum + count, 0)}</span>
            </div>
            <div className="pill">
              <strong>Прогресс:</strong>
              <span>
                {sessionPosition}/{topicTasks.length}
              </span>
            </div>
          </div>
          <div className="trainer-card__top">
            <div>
              <h1 id="grammar-title">Грамматические микродриллы</h1>
              <p className="muted">{topic.focusRu}</p>
            </div>
            <details className="trainer-info-details">
              <summary>Темы и сводка</summary>
              <div className="trainer-info-details__content">
                <div className="topic-picker" role="tablist" aria-label="Темы грамматики">
                  {grammarTopics.map((item) => (
                    <button
                      className={`topic-chip ${session.topicId === item.id ? 'topic-chip--active' : ''}`}
                      type="button"
                      key={item.id}
                      onClick={() => handleSelectTopic(item.id)}
                      aria-pressed={session.topicId === item.id}
                    >
                      <span>{item.titleRu}</span>
                      <small>{getTasksByTopic(item.id).length} заданий</small>
                    </button>
                  ))}
                </div>
                <div className="summary-card__metrics">
                  <div className="summary-card__metric">
                    <span>Попытки</span>
                    <strong>{progress.totalAttempts}</strong>
                  </div>
                  <div className="summary-card__metric">
                    <span>Правильные</span>
                    <strong>{progress.correctAnswers}</strong>
                  </div>
                  <div className="summary-card__metric">
                    <span>Заданий всего</span>
                    <strong>{grammarDrills.length}</strong>
                  </div>
                  <div className="summary-card__metric">
                    <span>С ошибками</span>
                    <strong>{Object.values(progress.mistakesByTaskId).filter((count) => count > 0).length}</strong>
                  </div>
                </div>
              </div>
            </details>
          </div>

          <div className="progress-block">
            <div className="progress-label">
              <span>Прогресс темы</span>
              <span>
                {sessionPosition}/{topicTasks.length}
              </span>
            </div>
            <div className="progress-bar" aria-hidden="true">
              <div
                className="progress-bar__fill"
                style={{
                  width: `${topicTasks.length > 0 ? Math.max(4, (sessionPosition / topicTasks.length) * 100) : 0}%`,
                }}
              />
            </div>
          </div>

          {currentTask ? (
            <div className="card-stage">
              <div className="card-stage__header">
                <span className="card-stage__category">{currentTask.difficulty} · {topic.titleRu}</span>
                <p className="card-stage__prompt">{currentTask.promptRu}</p>
              </div>

              {currentTask.answerMode === 'choice' && currentTask.choices ? (
                <div className="choice-list" role="radiogroup" aria-label="Варианты ответа">
                  {currentTask.choices.map((choice, index) => {
                    const isSelected = session.answer === choice
                    const isCorrectChoice = currentTask.acceptedAnswers.includes(choice)
                    const isWrongSelection = session.checked && !session.correct && isSelected

                    return (
                      <label
                        className={`choice-item ${isSelected ? 'choice-item--selected' : ''} ${
                          isWrongSelection ? 'choice-item--wrong' : ''
                        } ${session.checked && isCorrectChoice ? 'choice-item--correct' : ''}`}
                        key={choice}
                      >
                        <input
                          ref={(element) => {
                            choiceInputRefs.current[index] = element
                          }}
                          type="radio"
                          name={currentTask.id}
                          value={choice}
                          checked={isSelected}
                          aria-checked={isSelected}
                          onChange={(event) => {
                            const answer = event.currentTarget.value

                            setSession((current) => applyAnswerEditForRetry(current, answer))
                          }}
                          onKeyDown={handleChoiceKeyDown}
                        />
                        <span className="choice-item__text">{choice}</span>
                        <span className="choice-item__badges" aria-hidden="true">
                          {isSelected ? (
                            <span className="choice-item__badge choice-item__badge--selected">
                              {isWrongSelection ? 'Ваш выбор' : 'Выбрано'}
                            </span>
                          ) : null}
                          {session.checked && isCorrectChoice ? (
                            <span className="choice-item__badge choice-item__badge--correct">
                              Правильный ответ
                            </span>
                          ) : null}
                        </span>
                      </label>
                    )
                  })}
                </div>
              ) : (
                <div className="input-row">
                  <label htmlFor="grammar-answer">Введите польскую форму</label>
                  <input
                    ref={answerInputRef}
                    id="grammar-answer"
                    value={session.answer}
                    onKeyDown={handleAnswerKeyDown}
                    onChange={(event) => {
                      const answer = event.target.value

                      setSession((current) => applyAnswerEditForRetry(current, answer))
                    }}
                    placeholder="Например: nowej pracy"
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
              )}

              <div className="button-row">
                <button
                  className="button button--primary"
                  type="button"
                  onClick={handleCheck}
                  disabled={session.checked || session.answer.trim().length === 0}
                >
                  Проверить
                </button>
                <button ref={nextButtonRef} className="button" type="button" onClick={handleNext} disabled={!session.checked}>
                  Следующее
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
                    <strong>Правильный ответ:</strong> {currentTask.acceptedAnswers[0]}
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
                    <strong>Почему так:</strong> {currentTask.explanationRu}
                  </div>
                  <div className="card-stage__hint">
                    <strong>Частая ошибка:</strong> {currentTask.commonMistakeRu}
                  </div>
                  <div className="card-stage__answer">
                    <strong>Пример:</strong> {currentTask.examplePl}
                  </div>
                  <div className="muted">Ошибок по этому заданию: {currentMistakes}</div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="empty-state">Для этой темы пока нет заданий.</div>
          )}
        </section>
      </div>
    </main>
  )
}
