import { useEffect, useMemo, useState } from 'react'
import { superIntensivePlan } from '../../data/superIntensivePlan'
import {
  getDayProgress,
  loadSuperIntensiveProgress,
  resetSuperIntensiveDay,
  saveSuperIntensiveProgress,
  setSelectedSuperIntensiveDay,
  setSuperIntensiveDayNote,
  setSuperIntensiveTaskCompleted,
} from '../../lib/superIntensiveProgressStorage'
import { calculateSuperIntensiveStats, getWeakZoneInsight } from '../../lib/superIntensiveStats'

function getCompletionFeedback(completionPercent: number): string {
  if (completionPercent === 0) {
    return 'Начните с первой короткой задачи.'
  }

  if (completionPercent < 50) {
    return 'День начат. Закройте самый важный блок.'
  }

  if (completionPercent < 100) {
    return 'Хороший темп. Осталось добить слабую зону.'
  }

  return 'День закрыт. Завтра начните с повторения ошибок.'
}

function getDayStatusLabel(status: 'not-started' | 'in-progress' | 'completed'): string {
  if (status === 'completed') {
    return 'закрыт'
  }

  if (status === 'in-progress') {
    return 'в процессе'
  }

  return 'не начат'
}

export function IntensivePlanScreen() {
  const [superProgress, setSuperProgress] = useState(() => loadSuperIntensiveProgress())
  const selectedDay = superProgress.selectedDay
  const dayPlan = useMemo(
    () => superIntensivePlan.find((day) => day.dayNumber === selectedDay) ?? superIntensivePlan[0],
    [selectedDay],
  )
  const dayProgress = useMemo(
    () => getDayProgress(superProgress, dayPlan.dayNumber),
    [dayPlan.dayNumber, superProgress],
  )
  const completedTaskCount = dayPlan.tasks.filter((task) =>
    dayProgress.completedTaskIds.includes(task.id),
  ).length
  const completionPercent =
    dayPlan.tasks.length > 0 ? Math.round((completedTaskCount / dayPlan.tasks.length) * 100) : 0
  const completionFeedback = getCompletionFeedback(completionPercent)
  const superStats = useMemo(
    () => calculateSuperIntensiveStats(superIntensivePlan, superProgress),
    [superProgress],
  )
  const weakZoneInsight = getWeakZoneInsight(superStats)
  const nextDayTask = dayPlan.tasks.find((task) => !dayProgress.completedTaskIds.includes(task.id))
  const nextTaskLabel = nextDayTask?.title ?? 'День закрыт'

  useEffect(() => {
    saveSuperIntensiveProgress(superProgress)
  }, [superProgress])

  function handleSelectDay(dayNumber: number) {
    setSuperProgress((current) => setSelectedSuperIntensiveDay(current, dayNumber))
  }

  function handleToggleTask(taskId: string, completed: boolean) {
    setSuperProgress((current) =>
      setSuperIntensiveTaskCompleted(current, dayPlan.dayNumber, taskId, completed),
    )
  }

  function handleNoteChange(note: string) {
    setSuperProgress((current) => setSuperIntensiveDayNote(current, dayPlan.dayNumber, note))
  }

  function handleResetCurrentDay() {
    const confirmed = window.confirm('Сбросить прогресс текущего дня? Заметка тоже будет очищена.')

    if (!confirmed) {
      return
    }

    setSuperProgress((current) => resetSuperIntensiveDay(current, dayPlan.dayNumber))
  }

  return (
    <main className="app-shell">
      <div className="app-shell__grid app-shell__grid--plan">
        <section className="trainer-card trainer-card--compact" aria-labelledby="plan-title">
          <div className="trainer-card__top">
            <div>
              <div className="hero-card__eyebrow">B1 · 12-дневный интенсив · дневное выполнение</div>
              <h1 id="plan-title">
                День {dayPlan.dayNumber}: {dayPlan.title}
              </h1>
              <p>{dayPlan.mainGoal}</p>
            </div>
            <div className="trainer-compact-status" aria-label="Статус интенсива">
              <span className="pill">
                <strong>План:</strong>
                <span>12 дней</span>
              </span>
              <span className="pill">
                <strong>День:</strong>
                <span>
                  {dayPlan.dayNumber}/{superIntensivePlan.length}
                </span>
              </span>
              <span className="pill">
                <strong>Выполнено:</strong>
                <span>
                  {completedTaskCount}/{dayPlan.tasks.length}
                </span>
              </span>
              <span className="pill">
                <strong>Следующее:</strong>
                <span>{nextTaskLabel}</span>
              </span>
            </div>
          </div>

          <section className="card-stage intensive-main-card" aria-labelledby="day-action-title">
            <div className="checklist-header">
              <div>
                <span className="card-stage__category">Сегодняшний блок</span>
                <h2 id="day-action-title">{completionPercent}% выполнено</h2>
                <p>{completionFeedback}</p>
              </div>
              <button className="button button--ghost" type="button" onClick={handleResetCurrentDay}>
                Сбросить день
              </button>
            </div>
            <div className="summary-card__metrics">
              <div className="summary-card__metric">
                <span>Часы</span>
                <strong>{dayPlan.estimatedHours}</strong>
              </div>
              <div className="summary-card__metric">
                <span>Фокус</span>
                <strong>{dayPlan.focusArea}</strong>
              </div>
              <div className="summary-card__metric">
                <span>Навыки</span>
                <strong>{dayPlan.examSkillTargets.join(', ')}</strong>
              </div>
              <div className="summary-card__metric">
                <span>Критерий</span>
                <strong>{dayPlan.successCriteria}</strong>
              </div>
            </div>
            <div className="checklist-progress" aria-hidden="true">
              <div className="checklist-progress__fill" style={{ width: `${completionPercent}%` }} />
            </div>
            <div className="task-list">
              {dayPlan.tasks.map((task) => {
                const completed = dayProgress.completedTaskIds.includes(task.id)

                return (
                  <label className="task-item task-item--compact" key={task.id}>
                    <input
                      className="task-item__checkbox"
                      type="checkbox"
                      checked={completed}
                      onChange={(event) => handleToggleTask(task.id, event.currentTarget.checked)}
                    />
                    <span className="task-item__body">
                      <span className="task-item__title">{task.title}</span>
                      <span className="task-item__meta">
                        {task.durationMinutes} мин · {task.type}
                      </span>
                    </span>
                  </label>
                )
              })}
            </div>
          </section>

          <div className="intensive-action-grid">
            <section className="card-stage" aria-labelledby="plan-picker-title">
              <div className="card-stage__header">
                <span className="card-stage__category">Навигация по плану</span>
                <h2 id="plan-picker-title">Выбор дня</h2>
              </div>
              <div className="day-picker" role="tablist" aria-label="Выбор дня супер-интенсива">
                {superIntensivePlan.map((day) => (
                  <button
                    key={day.dayNumber}
                    className={`week-chip day-chip ${
                      selectedDay === day.dayNumber ? 'week-chip--active' : ''
                    }`}
                    type="button"
                    onClick={() => handleSelectDay(day.dayNumber)}
                    aria-pressed={selectedDay === day.dayNumber}
                  >
                    <span>День {day.dayNumber}</span>
                    <small>
                      {getDayStatusLabel(
                        superStats.dayStatuses.find((status) => status.dayNumber === day.dayNumber)
                          ?.status ?? 'not-started',
                      )}
                    </small>
                  </button>
                ))}
              </div>
            </section>

            <section className="card-stage" aria-labelledby="day-note-title">
              <div className="card-stage__header">
                <span className="card-stage__category">Заметка и слабая зона</span>
                <h2 id="day-note-title">Короткий итог дня</h2>
                <p className="muted">{weakZoneInsight}</p>
              </div>
              <label className="note-field">
                <span>Заметка дня</span>
                <textarea
                  value={dayProgress.note}
                  onChange={(event) => handleNoteChange(event.currentTarget.value)}
                  placeholder="Что сегодня было самым трудным?"
                  rows={3}
                />
              </label>
            </section>
          </div>

          <details className="practice-help-details">
            <summary>Полный план, теория и заметки</summary>
            <div className="practice-help-details__content practice-help-details__content--grid">
              <div className="card-stage__hint">
                <strong>Тема для устного ответа:</strong> {dayPlan.speakingPrompt}
              </div>
              <div className="card-stage__hint">
                <strong>Тема письма:</strong> {dayPlan.writingPrompt ?? 'Сегодня можно без письменного блока'}
              </div>
              <div className="card-stage__hint practice-help-details__wide">
                <strong>Типичные ошибки UA/RU в PL:</strong>
                <ul className="plan-list">
                  {dayPlan.commonMistakesForUkrainianLearner.map((mistake) => (
                    <li key={mistake}>{mistake}</li>
                  ))}
                </ul>
              </div>
              <div className="card-stage__hint practice-help-details__wide">
                <strong>Полная 12-дневная траектория:</strong>
                <ul className="plan-list">
                  {superIntensivePlan.map((day) => (
                    <li key={day.dayNumber}>
                      День {day.dayNumber}: {day.title}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card-stage__hint practice-help-details__wide">
                <strong>Общий прогресс:</strong> {superStats.overallCompletionPercent}% · закрыто дней{' '}
                {superStats.daysCompleted} из {superStats.totalDays} · выполнено задач{' '}
                {superStats.totalTasksCompleted} из {superStats.totalTasksAvailable}
              </div>
            </div>
          </details>
        </section>
      </div>
    </main>
  )
}
