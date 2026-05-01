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
        <section className="trainer-card trainer-card--compact" aria-labelledby="speaking-title">
          <div className="trainer-card__top">
            <div>
              <div className="hero-card__eyebrow">B1 · говорение · таймер и план</div>
              <h1 id="speaking-title">{selectedPrompt.titleRu}</h1>
              <p>{selectedPrompt.situationRu}</p>
            </div>
            <div className="trainer-compact-status" aria-label="Статус говорения">
              <span className="pill">
                <strong>Тип:</strong>
                <span>{speakingTypeLabels[selectedPrompt.type]}</span>
              </span>
              <span className="pill">
                <strong>Цель:</strong>
                <span>{selectedPrompt.minimumAnswerGoal}</span>
              </span>
              <span className="pill">
                <strong>Прогресс:</strong>
                <span>{completionPercent}%</span>
              </span>
              <span className="pill">
                <strong>Статус:</strong>
                <span>{completed ? 'выполнено' : 'не выполнено'}</span>
              </span>
            </div>
          </div>

          <details className="practice-help-details">
            <summary>Выбрать тип и другое устное задание</summary>
            <div className="practice-help-details__content">
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
            </div>
          </details>

          <div className="speaking-flow">
            <section className="card-stage" aria-labelledby="speaking-prompt-title">
              <div className="card-stage__header">
                <span className="card-stage__category">1. Prompt</span>
                <h2 id="speaking-prompt-title">Задание</h2>
                <p className="card-stage__prompt">{selectedPrompt.promptPl}</p>
              </div>
            </section>

            <section className="card-stage" aria-labelledby="speaking-timer-title">
              <div className="card-stage__header">
                <span className="card-stage__category">2. Таймер</span>
                <h2 id="speaking-timer-title">
                  {timerMode === 'prep' ? 'Подготовка' : 'Ответ'} · {formatTime(secondsLeft)}
                </h2>
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
            </section>

            <section className="card-stage" aria-labelledby="speaking-plan-title">
              <div className="card-stage__header">
                <span className="card-stage__category">3. План</span>
                <h2 id="speaking-plan-title">Ответ из трёх частей</h2>
              </div>
              <ol className="plan-list">
                {selectedPrompt.answerPlanRu.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </section>

            <section className="card-stage" aria-labelledby="speaking-check-title">
              <div className="card-stage__header">
                <span className="card-stage__category">4. Самопроверка</span>
                <h2 id="speaking-check-title">После ответа</h2>
              </div>
              <ul className="plan-list">
                {selectedPrompt.selfCheckCriteria.map((criterion) => (
                  <li key={criterion}>{criterion}</li>
                ))}
              </ul>
              <div className="button-row">
                <button className="button button--primary" type="button" onClick={handleCompleted}>
                  {completed ? 'Снять отметку' : 'Отметить как выполнено'}
                </button>
              </div>
            </section>
          </div>

          <details className="practice-help-details">
            <summary>Фразы и частые ошибки</summary>
            <div className="practice-help-details__content practice-help-details__content--grid">
              <div className="card-stage__hint">
                <strong>Полезные фразы:</strong>
                <ul className="plan-list">
                  {selectedPrompt.usefulPhrasesPl.map((phrase) => (
                    <li key={phrase}>{phrase}</li>
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
            </div>
          </details>
        </section>
      </div>
    </main>
  )
}
