import { useEffect, useMemo, useState } from 'react'
import { speakingPrompts, speakingTypeLabels } from '../../data/speakingPrompts'
import {
  loadSpeakingProgress,
  saveSpeakingProgress,
  setSpeakingPromptCompleted,
} from '../../lib/speakingProgressStorage'
import type { SpeakingPromptType } from '../../types/speaking'

const speakingTypes = Object.keys(speakingTypeLabels) as SpeakingPromptType[]
type TimerMode = 'prep' | 'answer'

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const rest = `${seconds % 60}`.padStart(2, '0')

  return `${minutes}:${rest}`
}

export function SpeakingPracticeScreen() {
  const [selectedType, setSelectedType] = useState<SpeakingPromptType>('picture')
  const [selectedPromptId, setSelectedPromptId] = useState(speakingPrompts[0].id)
  const [progress, setProgress] = useState(() => loadSpeakingProgress())
  const [timerMode, setTimerMode] = useState<TimerMode>('prep')
  const [secondsLeft, setSecondsLeft] = useState(30)
  const [timerRunning, setTimerRunning] = useState(false)
  const promptsByType = useMemo(
    () => speakingPrompts.filter((prompt) => prompt.type === selectedType),
    [selectedType],
  )
  const selectedPrompt =
    promptsByType.find((prompt) => prompt.id === selectedPromptId) ?? promptsByType[0] ?? speakingPrompts[0]
  const completed = progress.completedPromptIds.includes(selectedPrompt.id)
  const completionPercent = Math.round((progress.completedPromptIds.length / speakingPrompts.length) * 100)

  useEffect(() => {
    saveSpeakingProgress(progress)
  }, [progress])

  useEffect(() => {
    if (!timerRunning) {
      return
    }

    const timerId = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          setTimerRunning(false)
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [timerRunning])

  function handleSelectType(type: SpeakingPromptType) {
    const firstPrompt = speakingPrompts.find((prompt) => prompt.type === type) ?? speakingPrompts[0]
    setSelectedType(type)
    setSelectedPromptId(firstPrompt.id)
    setTimerRunning(false)
    setTimerMode('prep')
    setSecondsLeft(30)
  }

  function handleTimerStart(mode: TimerMode) {
    setTimerMode(mode)
    setSecondsLeft(mode === 'prep' ? 30 : 90)
    setTimerRunning(true)
  }

  function handleCompleted() {
    setProgress((current) => setSpeakingPromptCompleted(current, selectedPrompt.id, !completed))
  }

  return (
    <main className="app-shell">
      <div className="app-shell__grid">
        <section className="hero-card" aria-labelledby="speaking-title">
          <div className="hero-card__eyebrow">B1 · говорение · экзаменационный формат</div>
          <h1 id="speaking-title">Практика говорения</h1>
          <p>
            Короткие устные задания переводят бытовой и рабочий польский в формат экзамена:
            структура ответа, аргументация, сравнение, диалог и самопроверка.
          </p>
          <div className="hero-card__meta">
            <div className="pill">
              <strong>Заданий:</strong>
              <span>{speakingPrompts.length}</span>
            </div>
            <div className="pill">
              <strong>Выполнено:</strong>
              <span>{progress.completedPromptIds.length}</span>
            </div>
            <div className="pill">
              <strong>Прогресс:</strong>
              <span>{completionPercent}%</span>
            </div>
          </div>
          <p className="hero-card__note">Запись микрофона не требуется. Отмечайте выполненные ответы вручную.</p>
        </section>

        <aside className="side-card">
          <h2>Тип задания</h2>
          <p>Выберите формат, затем проговорите ответ по трехшаговому плану.</p>
          <div className="topic-picker" role="tablist" aria-label="Типы заданий на говорение">
            {speakingTypes.map((type) => (
              <button
                className={`topic-chip ${selectedType === type ? 'topic-chip--active' : ''}`}
                type="button"
                key={type}
                onClick={() => handleSelectType(type)}
                aria-pressed={selectedType === type}
              >
                <span>{speakingTypeLabels[type]}</span>
                <small>{speakingPrompts.filter((prompt) => prompt.type === type).length} заданий</small>
              </button>
            ))}
          </div>
        </aside>

        <section className="trainer-card">
          <div className="trainer-card__top">
            <div>
              <h2>{selectedPrompt.titleRu}</h2>
              <p>{selectedPrompt.situationRu}</p>
            </div>
            <div className="pill">
              <strong>Тип:</strong>
              <span>{speakingTypeLabels[selectedPrompt.type]}</span>
            </div>
          </div>

          <div className="progress-block">
            <div className="progress-label">
              <span>Общий прогресс говорения</span>
              <span>{completionPercent}%</span>
            </div>
            <div className="progress-bar" aria-hidden="true">
              <div className="progress-bar__fill" style={{ width: `${completionPercent}%` }} />
            </div>
          </div>

          <div className="button-row">
            {promptsByType.map((prompt) => (
              <button
                className={`button ${prompt.id === selectedPrompt.id ? 'button--primary' : ''}`}
                type="button"
                key={prompt.id}
                onClick={() => {
                  setSelectedPromptId(prompt.id)
                  setTimerRunning(false)
                }}
              >
                {prompt.titleRu}
              </button>
            ))}
          </div>

          <div className="card-stage">
            <div className="card-stage__header">
              <span className="card-stage__category">Задание</span>
              <p className="card-stage__prompt">{selectedPrompt.promptPl}</p>
            </div>
            <div className="summary-card__metrics">
              <div className="summary-card__metric">
                <span>Цель ответа</span>
                <strong>{selectedPrompt.minimumAnswerGoal}</strong>
              </div>
              <div className="summary-card__metric">
                <span>Статус</span>
                <strong>{completed ? 'выполнено' : 'не выполнено'}</strong>
              </div>
            </div>
          </div>

          <div className="card-stage">
            <div className="card-stage__header">
              <span className="card-stage__category">Таймер</span>
              <p className="card-stage__prompt">
                {timerMode === 'prep' ? 'Подготовка' : 'Ответ'} · {formatTime(secondsLeft)}
              </p>
            </div>
            <div className="button-row">
              <button className="button" type="button" onClick={() => handleTimerStart('prep')}>
                30 сек подготовка
              </button>
              <button className="button button--primary" type="button" onClick={() => handleTimerStart('answer')}>
                90 сек ответ
              </button>
              <button className="button button--ghost" type="button" onClick={() => setTimerRunning(false)}>
                Пауза
              </button>
            </div>
          </div>

          <div className="card-stage">
            <div className="card-stage__header">
              <span className="card-stage__category">План ответа</span>
            </div>
            <ol className="plan-list">
              {selectedPrompt.answerPlanRu.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>

          <div className="button-row">
            <button className="button button--primary" type="button" onClick={handleCompleted}>
              {completed ? 'Снять отметку' : 'Отметить как выполнено'}
            </button>
          </div>
        </section>

        <aside className="summary-card">
          <h3>Опоры для ответа</h3>
          <div className="card-stage__hint">
            <strong>Полезные фразы:</strong>
            <ul className="plan-list">
              {selectedPrompt.usefulPhrasesPl.map((phrase) => (
                <li key={phrase}>{phrase}</li>
              ))}
            </ul>
          </div>
          <div className="card-stage__hint">
            <strong>Самопроверка:</strong>
            <ul className="plan-list">
              {selectedPrompt.selfCheckCriteria.map((criterion) => (
                <li key={criterion}>{criterion}</li>
              ))}
            </ul>
          </div>
          <div className="card-stage__hint">
            <strong>Частые ошибки:</strong>
            <ul className="plan-list">
              {selectedPrompt.commonMistakesRu.map((mistake) => (
                <li key={mistake}>{mistake}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </main>
  )
}
