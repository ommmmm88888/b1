import { useEffect, useMemo, useState } from 'react'
import { listeningTasks } from '../../data/listeningTasks'
import {
  loadListeningProgress,
  recordListeningResult,
  saveListeningProgress,
} from '../../lib/listeningProgressStorage'
import { canUseSpeechSynthesis, speakPolish, stopSpeech } from '../../lib/speechSynthesis'

type Answers = Record<string, string>

export function ListeningPracticeScreen() {
  const [selectedTaskId, setSelectedTaskId] = useState(listeningTasks[0].id)
  const [answers, setAnswers] = useState<Answers>({})
  const [checked, setChecked] = useState(false)
  const [textVisible, setTextVisible] = useState(false)
  const [shadowingDone, setShadowingDone] = useState(false)
  const [progress, setProgress] = useState(() => loadListeningProgress())
  const speechAvailable = canUseSpeechSynthesis()
  const selectedTask = listeningTasks.find((task) => task.id === selectedTaskId) ?? listeningTasks[0]
  const score = useMemo(() => {
    const correctCount = selectedTask.comprehensionQuestions.filter(
      (question) => answers[question.id] === question.correctAnswer,
    ).length

    return {
      correctCount,
      percent: Math.round((correctCount / selectedTask.comprehensionQuestions.length) * 100),
    }
  }, [answers, selectedTask])
  const completedPercent = Math.round((progress.completedTaskIds.length / listeningTasks.length) * 100)

  useEffect(() => {
    saveListeningProgress(progress)
  }, [progress])

  function handleSelectTask(taskId: string) {
    stopSpeech()
    setSelectedTaskId(taskId)
    setAnswers({})
    setChecked(false)
    setTextVisible(false)
    setShadowingDone(false)
  }

  function handleCheck() {
    setChecked(true)
    setProgress((current) => recordListeningResult(current, selectedTask.id, score.percent))
  }

  return (
    <main className="app-shell">
      <div className="app-shell__grid">
        <section className="hero-card" aria-labelledby="listening-title">
          <div className="hero-card__eyebrow">B1 · аудирование · shadowing без backend</div>
          <h1 id="listening-title">Аудирование и повтор</h1>
          <p>
            Легкий слой тренировки на слух через озвучивание браузера. Это не заменяет реальные
            экзаменационные записи, но помогает регулярно тренировать понимание и повтор за фразой.
          </p>
          <div className="hero-card__meta">
            <div className="pill">
              <strong>Заданий:</strong>
              <span>{listeningTasks.length}</span>
            </div>
            <div className="pill">
              <strong>Пройдено:</strong>
              <span>{progress.completedTaskIds.length}</span>
            </div>
            <div className="pill">
              <strong>Прогресс:</strong>
              <span>{completedPercent}%</span>
            </div>
          </div>
        </section>

        <aside className="side-card">
          <h2>Задания</h2>
          <p>Сначала слушайте без текста, затем откройте текст и повторяйте вслух.</p>
          <div className="topic-picker" role="tablist" aria-label="Задания на аудирование">
            {listeningTasks.map((task) => (
              <button
                className={`topic-chip ${selectedTask.id === task.id ? 'topic-chip--active' : ''}`}
                type="button"
                key={task.id}
                onClick={() => handleSelectTask(task.id)}
                aria-pressed={selectedTask.id === task.id}
              >
                <span>{task.titleRu}</span>
                <small>лучший результат {progress.bestScoresByTaskId[task.id] ?? 0}%</small>
              </button>
            ))}
          </div>
        </aside>

        <section className="trainer-card">
          <div className="trainer-card__top">
            <div>
              <h2>{selectedTask.titleRu}</h2>
              <p>{selectedTask.focus}</p>
            </div>
            <div className="pill">
              <strong>Темп:</strong>
              <span>{selectedTask.speedSuggestion}</span>
            </div>
          </div>

          {!speechAvailable ? (
            <div className="empty-state">
              В этом браузере озвучивание недоступно. Можно читать текст вслух самостоятельно.
            </div>
          ) : null}

          <div className="card-stage">
            <div className="card-stage__header">
              <span className="card-stage__category">Озвучивание</span>
              <p>{selectedTask.explanationRu}</p>
            </div>
            <div className="button-row">
              <button
                className="button button--primary"
                type="button"
                onClick={() => speakPolish(selectedTask.textPl, 1)}
                disabled={!speechAvailable}
              >
                Прослушать
              </button>
              <button
                className="button"
                type="button"
                onClick={() => speakPolish(selectedTask.textPl, 0.72)}
                disabled={!speechAvailable}
              >
                Повторить медленно
              </button>
              <button className="button button--ghost" type="button" onClick={stopSpeech}>
                Остановить
              </button>
              <button className="button" type="button" onClick={() => setTextVisible((current) => !current)}>
                {textVisible ? 'Скрыть текст' : 'Показать текст'}
              </button>
            </div>
            {textVisible ? <p className="reading-text">{selectedTask.textPl}</p> : null}
          </div>

          <div className="task-list">
            {selectedTask.comprehensionQuestions.map((question, index) => {
              const isCorrect = answers[question.id] === question.correctAnswer

              return (
                <div className="card-stage" key={question.id}>
                  <div className="card-stage__header">
                    <span className="card-stage__category">Вопрос {index + 1}</span>
                    <p className="card-stage__prompt">{question.promptRu}</p>
                  </div>
                  <div className="choice-list" role="radiogroup" aria-label={question.promptRu}>
                    {question.options.map((option) => (
                      <label className="choice-item" key={option}>
                        <input
                          type="radio"
                          name={question.id}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={(event) => {
                            const answer = event.currentTarget.value

                            setAnswers((current) => ({
                              ...current,
                              [question.id]: answer,
                            }))
                          }}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                  {checked ? (
                    <div
                      className={`feedback__status ${
                        isCorrect ? 'feedback__status--correct' : 'feedback__status--wrong'
                      }`}
                    >
                      {isCorrect ? 'Ответ верный' : `Правильно: ${question.correctAnswer}`}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>

          <div className="card-stage">
            <div className="card-stage__header">
              <span className="card-stage__category">Shadowing</span>
              <p>{selectedTask.shadowingInstruction}</p>
            </div>
            <label className="task-item">
              <input
                className="task-item__checkbox"
                type="checkbox"
                checked={shadowingDone}
                onChange={(event) => setShadowingDone(event.currentTarget.checked)}
              />
              <span className="task-item__body">
                <span className="task-item__title">Я повторил(а) текст вслух минимум два раза.</span>
              </span>
            </label>
          </div>

          <div className="button-row">
            <button
              className="button button--primary"
              type="button"
              onClick={handleCheck}
              disabled={Object.keys(answers).length < selectedTask.comprehensionQuestions.length}
            >
              Проверить
            </button>
          </div>
        </section>

        <aside className="summary-card">
          <h3>Слова и результат</h3>
          <div className="card-stage__hint">
            <strong>Полезная лексика:</strong>
            <ul className="plan-list">
              {selectedTask.usefulVocabulary.map((word) => (
                <li key={word}>{word}</li>
              ))}
            </ul>
          </div>
          <div className="summary-card__metrics">
            <div className="summary-card__metric">
              <span>Текущий результат</span>
              <strong>
                {checked ? `${score.correctCount} из ${selectedTask.comprehensionQuestions.length}` : 'ещё не проверен'}
              </strong>
            </div>
            <div className="summary-card__metric">
              <span>Лучший результат</span>
              <strong>{progress.bestScoresByTaskId[selectedTask.id] ?? 0}%</strong>
            </div>
            <div className="summary-card__metric">
              <span>Повтор вслух</span>
              <strong>{shadowingDone ? 'сделан' : 'не отмечен'}</strong>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
