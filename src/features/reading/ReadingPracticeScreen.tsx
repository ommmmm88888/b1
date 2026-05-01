import { useEffect, useMemo, useState } from 'react'
import { readingTasks } from '../../data/readingTasks'
import {
  loadReadingProgress,
  recordReadingResult,
  saveReadingProgress,
} from '../../lib/readingProgressStorage'

type Answers = Record<string, string>

export function ReadingPracticeScreen() {
  const [selectedTaskId, setSelectedTaskId] = useState(readingTasks[0].id)
  const [answers, setAnswers] = useState<Answers>({})
  const [checked, setChecked] = useState(false)
  const [progress, setProgress] = useState(() => loadReadingProgress())
  const selectedTask = readingTasks.find((task) => task.id === selectedTaskId) ?? readingTasks[0]
  const score = useMemo(() => {
    const correctCount = selectedTask.questions.filter(
      (question) => answers[question.id] === question.correctAnswer,
    ).length

    return {
      correctCount,
      percent: Math.round((correctCount / selectedTask.questions.length) * 100),
    }
  }, [answers, selectedTask])
  const completedPercent = Math.round((progress.completedTaskIds.length / readingTasks.length) * 100)

  useEffect(() => {
    saveReadingProgress(progress)
  }, [progress])

  function handleSelectTask(taskId: string) {
    setSelectedTaskId(taskId)
    setAnswers({})
    setChecked(false)
  }

  function handleCheck() {
    setChecked(true)
    setProgress((current) => recordReadingResult(current, selectedTask.id, score.percent))
  }

  return (
    <main className="app-shell">
      <div className="app-shell__grid">
        <section className="hero-card" aria-labelledby="reading-title">
          <div className="hero-card__eyebrow">B1 · чтение · понимание деталей</div>
          <h1 id="reading-title">Практика чтения</h1>
          <p>
            Короткие B1-тексты с вопросами на главную мысль, детали, true/false и выбор ответа.
            Формат помогает тренировать чтение без перегруза.
          </p>
          <div className="hero-card__meta">
            <div className="pill">
              <strong>Текстов:</strong>
              <span>{readingTasks.length}</span>
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
          <h2>Тексты</h2>
          <p>Выберите текст и ответьте на вопросы после чтения.</p>
          <div className="topic-picker" role="tablist" aria-label="Тексты для чтения">
            {readingTasks.map((task) => (
              <button
                className={`topic-chip ${selectedTask.id === task.id ? 'topic-chip--active' : ''}`}
                type="button"
                key={task.id}
                onClick={() => handleSelectTask(task.id)}
                aria-pressed={selectedTask.id === task.id}
              >
                <span>{task.titleRu}</span>
                <small>
                  {task.topic} · лучший результат {progress.bestScoresByTaskId[task.id] ?? 0}%
                </small>
              </button>
            ))}
          </div>
        </aside>

        <section className="trainer-card">
          <div className="trainer-card__top">
            <div>
              <h2>{selectedTask.titleRu}</h2>
              <p>{selectedTask.topic}</p>
            </div>
            <div className="pill">
              <strong>Вопросов:</strong>
              <span>{selectedTask.questions.length}</span>
            </div>
          </div>

          <div className="card-stage">
            <div className="card-stage__header">
              <span className="card-stage__category">Текст</span>
              <p className="reading-text">{selectedTask.textPl}</p>
            </div>
          </div>

          <div className="task-list">
            {selectedTask.questions.map((question, index) => {
              const selectedAnswer = answers[question.id]
              const isCorrect = selectedAnswer === question.correctAnswer

              return (
                <div className="card-stage" key={question.id}>
                  <div className="card-stage__header">
                    <span className="card-stage__category">
                      {index + 1}. {question.type}
                    </span>
                    <p className="card-stage__prompt">{question.promptRu}</p>
                  </div>
                  <div className="choice-list" role="radiogroup" aria-label={question.promptRu}>
                    {question.options.map((option) => (
                      <label
                        className={`choice-item ${
                          checked && selectedAnswer === option && option !== question.correctAnswer
                            ? 'choice-item--wrong'
                            : ''
                        } ${checked && option === question.correctAnswer ? 'choice-item--correct' : ''}`}
                        key={option}
                      >
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
                    <div className="feedback feedback--compact">
                      <div
                        className={`feedback__status ${
                          isCorrect ? 'feedback__status--correct' : 'feedback__status--wrong'
                        }`}
                      >
                        {isCorrect ? 'Ответ верный' : 'Ответ неверный'}
                      </div>
                      <div className="card-stage__answer">
                        <strong>Ваш ответ:</strong> {selectedAnswer ?? '—'}
                      </div>
                      <div className="card-stage__answer">
                        <strong>Правильный ответ:</strong> {question.correctAnswer}
                      </div>
                      <div className="card-stage__explanation">
                        <strong>Пояснение:</strong> {question.explanationRu}
                      </div>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>

          <div className="button-row">
            <button
              className="button button--primary"
              type="button"
              onClick={handleCheck}
              disabled={Object.keys(answers).length < selectedTask.questions.length}
            >
              Проверить
            </button>
            <button
              className="button"
              type="button"
              onClick={() => {
                setAnswers({})
                setChecked(false)
              }}
            >
              Сбросить ответы
            </button>
          </div>
        </section>

        <aside className="summary-card">
          <h3>Результат</h3>
          <p>После проверки сохраняется лучший результат по каждому тексту.</p>
          <div className="summary-card__metrics">
            <div className="summary-card__metric">
              <span>Текущий текст</span>
              <strong>
                {checked ? `${score.correctCount} из ${selectedTask.questions.length}` : 'ещё не проверен'}
              </strong>
            </div>
            <div className="summary-card__metric">
              <span>Процент</span>
              <strong>{checked ? `${score.percent}%` : '0%'}</strong>
            </div>
            <div className="summary-card__metric">
              <span>Лучший результат</span>
              <strong>{progress.bestScoresByTaskId[selectedTask.id] ?? 0}%</strong>
            </div>
            <div className="summary-card__metric">
              <span>Пройдено текстов</span>
              <strong>
                {progress.completedTaskIds.length} из {readingTasks.length}
              </strong>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
