import { useMemo, useState } from 'react'
import { miniMockExam } from '../../data/miniMockExam'
import {
  calculateMockExamResult,
  type MockExamAnswers,
} from '../../lib/mockExamScoring'
import {
  clearLatestMockExamResult,
  loadLatestMockExamResult,
  saveLatestMockExamResult,
} from '../../lib/mockExamProgressStorage'
import { canUseSpeechSynthesis, speakPolish, stopSpeech } from '../../lib/speechSynthesis'
import type { MockExamResult } from '../../types/mockExam'

function createEmptyAnswers(): MockExamAnswers {
  return {
    reading: {},
    grammar: {},
    listening: {},
    writingCriteria: [],
    speakingCriteria: [],
  }
}

function toggleValue(values: string[], value: string, checked: boolean): string[] {
  const set = new Set(values)

  if (checked) {
    set.add(value)
  } else {
    set.delete(value)
  }

  return [...set]
}

export function MiniMockExamScreen() {
  const [started, setStarted] = useState(false)
  const [answers, setAnswers] = useState<MockExamAnswers>(() => createEmptyAnswers())
  const [result, setResult] = useState<MockExamResult | null>(() => loadLatestMockExamResult())
  const speechAvailable = canUseSpeechSynthesis()
  const readinessLabel = result ? `${result.overallReadinessPercent}%` : 'нет результата'
  const objectiveAnsweredCount = useMemo(
    () =>
      Object.keys(answers.reading).length +
      Object.keys(answers.grammar).length +
      Object.keys(answers.listening).length,
    [answers.grammar, answers.listening, answers.reading],
  )
  const objectiveTotal =
    miniMockExam.reading.questions.length + miniMockExam.grammar.length + miniMockExam.listening.questions.length

  function handleFinish() {
    const nextResult = calculateMockExamResult(answers)
    setResult(nextResult)
    saveLatestMockExamResult(nextResult)
  }

  function handleReset() {
    stopSpeech()
    setAnswers(createEmptyAnswers())
    setResult(null)
    setStarted(false)
    clearLatestMockExamResult()
  }

  if (!started) {
    return (
      <main className="app-shell">
        <div className="app-shell__grid">
          <section className="hero-card" aria-labelledby="mock-title">
            <div className="hero-card__eyebrow">B1 · мини-мок · 5 зон</div>
            <h1 id="mock-title">Пробный мини-экзамен</h1>
            <p>
              Короткая проверка готовности: чтение, лексика/грамматика, письмо, говорение и
              аудирование/shadowing. Это не официальный экзамен, а измеримый локальный срез.
            </p>
            <div className="hero-card__meta">
              <div className="pill">
                <strong>Последний результат:</strong>
                <span>{readinessLabel}</span>
              </div>
              <div className="pill">
                <strong>Сохранение:</strong>
                <span>только localStorage</span>
              </div>
            </div>
          </section>
          <aside className="side-card">
            <h2>Старт</h2>
            <p>Проходите зоны подряд. Письмо и говорение оцениваются по чеклисту самопроверки.</p>
            <div className="button-row">
              <button className="button button--primary" type="button" onClick={() => setStarted(true)}>
                Начать мини-мок
              </button>
              {result ? (
                <button className="button" type="button" onClick={handleReset}>
                  Сбросить результат
                </button>
              ) : null}
            </div>
          </aside>
          {result ? (
            <section className="summary-card">
              <h3>Последний результат</h3>
              <div className="summary-card__metrics">
                <div className="summary-card__metric">
                  <span>Готовность</span>
                  <strong>{result.overallReadinessPercent}%</strong>
                </div>
                <div className="summary-card__metric">
                  <span>Слабые зоны</span>
                  <strong>{result.weakestZones.join(', ')}</strong>
                </div>
              </div>
            </section>
          ) : null}
        </div>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <div className="app-shell__grid">
        <section className="hero-card" aria-labelledby="mock-active-title">
          <div className="hero-card__eyebrow">B1 · пробный экзамен</div>
          <h1 id="mock-active-title">Мини-мок в работе</h1>
          <p>Заполните объективные ответы и честно отметьте чеклисты письма и говорения.</p>
          <div className="hero-card__meta">
            <div className="pill">
              <strong>Объективные ответы:</strong>
              <span>
                {objectiveAnsweredCount} из {objectiveTotal}
              </span>
            </div>
            <div className="pill">
              <strong>Текущий итог:</strong>
              <span>{readinessLabel}</span>
            </div>
          </div>
        </section>

        <aside className="side-card">
          <h2>Управление</h2>
          <p>Результат сохранится локально после кнопки завершения.</p>
          <div className="button-row">
            <button className="button button--primary" type="button" onClick={handleFinish}>
              Завершить и показать результат
            </button>
            <button className="button" type="button" onClick={handleReset}>
              Сбросить и начать заново
            </button>
          </div>
        </aside>

        <section className="trainer-card">
          <div className="trainer-card__top">
            <div>
              <h2>1. Чтение</h2>
              <p>{miniMockExam.reading.titleRu}</p>
            </div>
          </div>
          <div className="card-stage">
            <p className="reading-text">{miniMockExam.reading.textPl}</p>
          </div>
          {miniMockExam.reading.questions.map((question) => (
            <div className="card-stage" key={question.id}>
              <p className="card-stage__prompt">{question.promptRu}</p>
              <div className="choice-list">
                {question.options.map((option) => (
                  <label className="choice-item" key={option}>
                    <input
                      type="radio"
                      name={question.id}
                      checked={answers.reading[question.id] === option}
                      onChange={() =>
                        setAnswers((current) => ({
                          ...current,
                          reading: { ...current.reading, [question.id]: option },
                        }))
                      }
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="trainer-card__top">
            <div>
              <h2>2. Лексика и грамматика</h2>
              <p>15 коротких заданий на точность.</p>
            </div>
          </div>
          {miniMockExam.grammar.map((task) => (
            <div className="card-stage" key={task.id}>
              <p className="card-stage__prompt">{task.promptRu}</p>
              <div className="choice-list">
                {task.choices?.map((choice) => (
                  <label className="choice-item" key={choice}>
                    <input
                      type="radio"
                      name={task.id}
                      checked={answers.grammar[task.id] === choice}
                      onChange={() =>
                        setAnswers((current) => ({
                          ...current,
                          grammar: { ...current.grammar, [task.id]: choice },
                        }))
                      }
                    />
                    <span>{choice}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="trainer-card__top">
            <div>
              <h2>3. Письмо</h2>
              <p>{miniMockExam.writing.promptRu}</p>
            </div>
          </div>
          <div className="card-stage">
            <span className="card-stage__category">Обязательные пункты</span>
            <ul className="plan-list">
              {miniMockExam.writing.requiredElements.map((element) => (
                <li key={element}>{element}</li>
              ))}
            </ul>
          </div>
          <div className="task-list">
            {miniMockExam.writing.selfCheckCriteria.map((criterion) => (
              <label className="task-item" key={criterion}>
                <input
                  className="task-item__checkbox"
                  type="checkbox"
                  checked={answers.writingCriteria.includes(criterion)}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      writingCriteria: toggleValue(current.writingCriteria, criterion, event.currentTarget.checked),
                    }))
                  }
                />
                <span className="task-item__body">
                  <span className="task-item__title">{criterion}</span>
                </span>
              </label>
            ))}
          </div>

          <div className="trainer-card__top">
            <div>
              <h2>4. Говорение</h2>
              <p>Ответьте устно на 3 prompt-а, затем отметьте самопроверку.</p>
            </div>
          </div>
          {miniMockExam.speaking.prompts.map((prompt) => (
            <div className="card-stage" key={prompt.id}>
              <p className="card-stage__prompt">{prompt.promptPl}</p>
              <ol className="plan-list">
                {prompt.planRu.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          ))}
          <div className="task-list">
            {miniMockExam.speaking.selfCheckCriteria.map((criterion) => (
              <label className="task-item" key={criterion}>
                <input
                  className="task-item__checkbox"
                  type="checkbox"
                  checked={answers.speakingCriteria.includes(criterion)}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      speakingCriteria: toggleValue(current.speakingCriteria, criterion, event.currentTarget.checked),
                    }))
                  }
                />
                <span className="task-item__body">
                  <span className="task-item__title">{criterion}</span>
                </span>
              </label>
            ))}
          </div>

          <div className="trainer-card__top">
            <div>
              <h2>5. Аудирование</h2>
              <p>{miniMockExam.listening.titleRu}</p>
            </div>
          </div>
          {!speechAvailable ? (
            <div className="empty-state">
              В этом браузере озвучивание недоступно. Можно прочитать текст вслух самостоятельно.
            </div>
          ) : null}
          <div className="button-row">
            <button
              className="button button--primary"
              type="button"
              onClick={() => speakPolish(miniMockExam.listening.textPl, 1)}
              disabled={!speechAvailable}
            >
              Прослушать
            </button>
            <button
              className="button"
              type="button"
              onClick={() => speakPolish(miniMockExam.listening.textPl, 0.72)}
              disabled={!speechAvailable}
            >
              Медленно
            </button>
            <button className="button button--ghost" type="button" onClick={stopSpeech}>
              Остановить
            </button>
          </div>
          {miniMockExam.listening.questions.map((question) => (
            <div className="card-stage" key={question.id}>
              <p className="card-stage__prompt">{question.promptRu}</p>
              <div className="choice-list">
                {question.options.map((option) => (
                  <label className="choice-item" key={option}>
                    <input
                      type="radio"
                      name={question.id}
                      checked={answers.listening[question.id] === option}
                      onChange={() =>
                        setAnswers((current) => ({
                          ...current,
                          listening: { ...current.listening, [question.id]: option },
                        }))
                      }
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </section>

        <aside className="summary-card">
          <h3>Результаты</h3>
          {result ? (
            <>
              <div className="summary-card__metrics">
                <div className="summary-card__metric">
                  <span>Готовность</span>
                  <strong>{result.overallReadinessPercent}%</strong>
                </div>
                <div className="summary-card__metric">
                  <span>Чтение</span>
                  <strong>{result.zoneScores.reading}%</strong>
                </div>
                <div className="summary-card__metric">
                  <span>Грамматика</span>
                  <strong>{result.zoneScores.grammar}%</strong>
                </div>
                <div className="summary-card__metric">
                  <span>Письмо</span>
                  <strong>{result.zoneScores.writing}%</strong>
                </div>
                <div className="summary-card__metric">
                  <span>Говорение</span>
                  <strong>{result.zoneScores.speaking}%</strong>
                </div>
                <div className="summary-card__metric">
                  <span>Аудирование</span>
                  <strong>{result.zoneScores.listening}%</strong>
                </div>
              </div>
              <div className="card-stage__hint">
                <strong>Слабые зоны:</strong> {result.weakestZones.join(', ')}
              </div>
              <div className="card-stage__hint">
                <strong>Что делать дальше:</strong>
                <ul className="plan-list">
                  {result.recommendedNextActions.map((action) => (
                    <li key={action}>{action}</li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <p>Завершите мини-мок, чтобы увидеть разбивку по зонам.</p>
          )}
        </aside>
      </div>
    </main>
  )
}
