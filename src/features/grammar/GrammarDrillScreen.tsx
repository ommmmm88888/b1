import { useEffect, useMemo, useState } from 'react'
import { grammarDrills, grammarTopics } from '../../data/grammarDrills'
import { isAnswerCorrect } from '../../lib/answerCheck'
import {
  loadGrammarProgress,
  recordGrammarAttempt,
  saveGrammarProgress,
} from '../../lib/grammarProgressStorage'
import type { GrammarTask, GrammarTopicId } from '../../types/grammar'

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

function getTasksByTopic(topicId: GrammarTopicId): GrammarTask[] {
  return grammarDrills.filter((task) => task.topicId === topicId)
}

export function GrammarDrillScreen() {
  const [progress, setProgress] = useState(() => loadGrammarProgress())
  const [session, setSession] = useState<GrammarSession>(() => createSession(grammarTopics[0].id))

  const topic = grammarTopics.find((item) => item.id === session.topicId) ?? grammarTopics[0]
  const topicTasks = useMemo(() => getTasksByTopic(session.topicId), [session.topicId])
  const currentTask = topicTasks[session.taskIndex] ?? topicTasks[0]
  const attempts = progress.totalAttempts
  const accuracy = attempts > 0 ? Math.round((progress.correctAnswers / attempts) * 100) : 0
  const currentMistakes = currentTask ? progress.mistakesByTaskId[currentTask.id] ?? 0 : 0
  const sessionPosition = topicTasks.length > 0 ? session.taskIndex + 1 : 0

  useEffect(() => {
    saveGrammarProgress(progress)
  }, [progress])

  function handleSelectTopic(topicId: GrammarTopicId) {
    setSession(createSession(topicId))
  }

  function handleCheck() {
    if (!currentTask || session.checked) {
      return
    }

    const candidate = currentTask.answerMode === 'choice' ? session.answer : session.answer.trim()
    const correct = isAnswerCorrect(candidate, currentTask.acceptedAnswers)

    setProgress((current) => recordGrammarAttempt(current, currentTask.id, correct))
    setSession((current) => ({
      ...current,
      checked: true,
      correct,
    }))
  }

  function handleNext() {
    setSession((current) => ({
      ...current,
      taskIndex: topicTasks.length > 0 ? (current.taskIndex + 1) % topicTasks.length : 0,
      answer: '',
      checked: false,
      correct: null,
    }))
  }

  return (
    <main className="app-shell">
      <div className="app-shell__grid">
        <section className="hero-card" aria-labelledby="grammar-title">
          <div className="hero-card__eyebrow">B1 · грамматическая точность · локальный прогресс</div>
          <h1 id="grammar-title">Грамматические микродриллы</h1>
          <p>
            Короткие задания на ошибки, которые чаще всего мешают русско- и украиноязычным
            ученикам в письме, говорении и лексико-грамматической части B1.
          </p>
          <div className="hero-card__meta">
            <div className="pill">
              <strong>Тем:</strong>
              <span>{grammarTopics.length}</span>
            </div>
            <div className="pill">
              <strong>Заданий:</strong>
              <span>{grammarDrills.length}</span>
            </div>
            <div className="pill">
              <strong>Точность:</strong>
              <span>{accuracy}%</span>
            </div>
          </div>
          <p className="hero-card__note">Проверка идет локально. Сервер и аккаунт не используются.</p>
        </section>

        <aside className="side-card">
          <h2>Темы</h2>
          <p>Выберите один блок и доведите его до стабильности короткими повторениями.</p>
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
        </aside>

        <section className="trainer-card">
          <div className="trainer-card__top">
            <div>
              <h2>{topic.titleRu}</h2>
              <p>{topic.focusRu}</p>
            </div>
            <div className="pill">
              <strong>Задание:</strong>
              <span>
                {sessionPosition} из {topicTasks.length}
              </span>
            </div>
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
                  {currentTask.choices.map((choice) => (
                    <label className="choice-item" key={choice}>
                      <input
                        type="radio"
                        name={currentTask.id}
                        value={choice}
                        checked={session.answer === choice}
                        onChange={(event) => {
                          const answer = event.currentTarget.value

                          setSession((current) => ({
                            ...current,
                            answer,
                          }))
                        }}
                      />
                      <span>{choice}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="input-row">
                  <label htmlFor="grammar-answer">Введите польскую форму</label>
                  <input
                    id="grammar-answer"
                    value={session.answer}
                    onChange={(event) => {
                      const answer = event.target.value

                      setSession((current) => ({
                        ...current,
                        answer,
                      }))
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
                <button className="button" type="button" onClick={handleNext} disabled={!session.checked}>
                  Следующее
                </button>
              </div>

              {session.checked && session.correct !== null ? (
                <div className="feedback">
                  <div
                    className={`feedback__status ${
                      session.correct ? 'feedback__status--correct' : 'feedback__status--wrong'
                    }`}
                  >
                    {session.correct ? 'Ответ верный' : 'Ответ неверный'}
                  </div>
                  <div className="card-stage__answer">
                    <strong>Правильный ответ:</strong> {currentTask.acceptedAnswers[0]}
                  </div>
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

        <aside className="summary-card">
          <h3>Сводка грамматики</h3>
          <p>Счетчик помогает увидеть, насколько стабильно вы проходите микродриллы.</p>
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
              <span>Точность</span>
              <strong>{accuracy}%</strong>
            </div>
            <div className="summary-card__metric">
              <span>Заданий с ошибками</span>
              <strong>{Object.values(progress.mistakesByTaskId).filter((count) => count > 0).length}</strong>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
