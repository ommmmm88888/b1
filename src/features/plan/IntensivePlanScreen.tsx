import { useEffect, useMemo, useState } from 'react'
import { intensivePlan } from '../../data/intensivePlan'
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

type PlanType = '8weeks' | '12days'

const WEEK_STORAGE_KEY = 'b1_intensive_selected_week'
const PLAN_TYPE_STORAGE_KEY = 'b1_intensive_plan_type'

function resolveInitialPlanType(): PlanType {
  const raw = globalThis.localStorage?.getItem(PLAN_TYPE_STORAGE_KEY)
  return raw === '12days' ? '12days' : '8weeks'
}

function resolveInitialWeek(): number {
  const raw = globalThis.localStorage?.getItem(WEEK_STORAGE_KEY)
  const parsed = Number(raw)

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > intensivePlan.length) {
    return 1
  }

  return parsed
}

function getCompletionFeedback(completionPercent: number): string {
  if (completionPercent === 0) {
    return 'Начните с короткого повторения - это снижает сопротивление.'
  }

  if (completionPercent < 50) {
    return 'День начат. Главное - закрыть письмо или говорение.'
  }

  if (completionPercent < 100) {
    return 'Хороший темп. Добейте одну слабую зону.'
  }

  return 'День закрыт. Завтра начните с повторения ошибок.'
}

export function IntensivePlanScreen() {
  const [planType, setPlanType] = useState<PlanType>(resolveInitialPlanType)
  const [selectedWeek, setSelectedWeek] = useState<number>(resolveInitialWeek)
  const [superProgress, setSuperProgress] = useState(() => loadSuperIntensiveProgress())
  const selectedDay = superProgress.selectedDay

  useEffect(() => {
    globalThis.localStorage?.setItem(PLAN_TYPE_STORAGE_KEY, planType)
  }, [planType])

  useEffect(() => {
    // TODO v0.4: sync with richer progress model for week completion tracking.
    globalThis.localStorage?.setItem(WEEK_STORAGE_KEY, `${selectedWeek}`)
  }, [selectedWeek])

  useEffect(() => {
    saveSuperIntensiveProgress(superProgress)
  }, [superProgress])

  const weekPlan = useMemo(
    () => intensivePlan.find((week) => week.weekNumber === selectedWeek) ?? intensivePlan[0],
    [selectedWeek],
  )
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
        <section className="hero-card" aria-labelledby="plan-title">
          <div className="hero-card__eyebrow">Методика v0.3 · Интенсивная подготовка к B1</div>
          <h1 id="plan-title">
            {planType === '8weeks' ? '8-недельный интенсив A2B1' : '12-дневный супер-интенсив B1'}
          </h1>
          <p>
            {planType === '8weeks'
              ? 'Планировочный слой для дисциплинированной подготовки: ежедневный SRS, регулярная продуктивная практика и контроль через пробный экзамен B1.'
              : 'Для украинского ученика, который уже общается с поляками и готовится к экзамену быстро.'}
          </p>
          <div className="hero-card__meta">
            <div className="pill">
              <strong>Нагрузка:</strong>
              <span>{planType === '8weeks' ? '20-26 часов в неделю' : '3-5 часов в день'}</span>
            </div>
            <div className="pill">
              <strong>{planType === '8weeks' ? 'Текущая неделя:' : 'Текущий день:'}</strong>
              <span>{planType === '8weeks' ? weekPlan.weekNumber : dayPlan.dayNumber}</span>
            </div>
          </div>
          <p className="hero-card__note">
            {planType === '8weeks'
              ? 'Это интенсивный режим: он работает только при регулярной практике 5-6 дней в неделю.'
              : 'Это не курс с нуля. Режим подходит, если вы уже понимаете польскую речь и можете общаться в быту или на работе.'}
          </p>
        </section>

        <aside className="side-card">
          <h2>Тип плана</h2>
          <p>Выберите методику: длительный интенсив или короткий экзаменационный режим.</p>
          <div className="plan-type-switch" role="tablist" aria-label="Тип интенсива">
            <button
              className={`week-chip ${planType === '8weeks' ? 'week-chip--active' : ''}`}
              type="button"
              onClick={() => setPlanType('8weeks')}
              aria-pressed={planType === '8weeks'}
            >
              8 недель
            </button>
            <button
              className={`week-chip ${planType === '12days' ? 'week-chip--active' : ''}`}
              type="button"
              onClick={() => setPlanType('12days')}
              aria-pressed={planType === '12days'}
            >
              12 дней
            </button>
          </div>

          {planType === '8weeks' ? (
            <div className="side-card__stats">
              <div className="stat">
                <strong>SRS каждый день</strong>
                <div className="muted">ежедневный цикл закрепления лексики и структур</div>
              </div>
              <div className="stat">
                <strong>Устные лаборатории 3-4 раза</strong>
                <div className="muted">короткие разговорные блоки под таймер</div>
              </div>
              <div className="stat">
                <strong>Циклы письма 2 раза</strong>
                <div className="muted">черновик, правка и финальная версия</div>
              </div>
              <div className="stat">
                <strong>Блоки аудирования 2 раза</strong>
                <div className="muted">слушание с повтором и разбором</div>
              </div>
              <div className="stat">
                <strong>Пробный экзамен раз в 2 недели</strong>
                <div className="muted">проверка прогресса во всех 5 экзаменационных зонах</div>
              </div>
            </div>
          ) : (
            <div className="side-card__stats">
              <div className="stat">
                <strong>Ежедневная цель: 3-5 часов</strong>
                <div className="muted">компактный, плотный режим на 12 дней подряд</div>
              </div>
              <div className="stat">
                <strong>Фокус: формат экзамена</strong>
                <div className="muted">письмо, говорение, грамматическая коррекция, мини-мок</div>
              </div>
              <div className="stat">
                <strong>Контекст: от работы к экзамену</strong>
                <div className="muted">перенос бытовых и рабочих шаблонов в B1-формат</div>
              </div>
            </div>
          )}
        </aside>

        {planType === '8weeks' ? (
          <section className="trainer-card">
            <div className="trainer-card__top">
              <div>
                <h2>
                  Неделя {weekPlan.weekNumber}: {weekPlan.title}
                </h2>
                <p>{weekPlan.focus}</p>
              </div>
              <div className="pill">
                <strong>Пробник:</strong>
                <span>{weekPlan.mockExam ? 'Да' : 'Нет'}</span>
              </div>
            </div>

            <div className="summary-card__metrics">
              <div className="summary-card__metric">
                <span>Часы</span>
                <strong>{weekPlan.weeklyHoursTarget}</strong>
              </div>
              <div className="summary-card__metric">
                <span>SRS</span>
                <strong>{weekPlan.dailySrs}</strong>
              </div>
              <div className="summary-card__metric">
                <span>Устные лаборатории</span>
                <strong>{weekPlan.speakingLabs}</strong>
              </div>
              <div className="summary-card__metric">
                <span>Циклы письма</span>
                <strong>{weekPlan.writingCycles}</strong>
              </div>
              <div className="summary-card__metric">
                <span>Блоки аудирования</span>
                <strong>{weekPlan.listeningBlocks}</strong>
              </div>
              <div className="summary-card__metric">
                <span>Критерий недели</span>
                <strong>{weekPlan.successCriteria}</strong>
              </div>
            </div>

            <div className="card-stage">
              <div className="card-stage__header">
                <span className="card-stage__category">Рекомендуемые задачи недели</span>
              </div>
              <ul className="plan-list">
                {weekPlan.recommendedTasks.map((task) => (
                  <li key={task}>{task}</li>
                ))}
              </ul>
            </div>
          </section>
        ) : (
          <section className="trainer-card">
            <div className="trainer-card__top">
              <div>
                <h2>
                  День {dayPlan.dayNumber}: {dayPlan.title}
                </h2>
                <p>{dayPlan.mainGoal}</p>
              </div>
              <div className="pill">
                <strong>Фокус:</strong>
                <span>{dayPlan.focusArea}</span>
              </div>
            </div>

            <div className="summary-card__metrics">
              <div className="summary-card__metric">
                <span>Часы</span>
                <strong>{dayPlan.estimatedHours}</strong>
              </div>
              <div className="summary-card__metric">
                <span>Выполнение дня</span>
                <strong>
                  {completedTaskCount} из {dayPlan.tasks.length} задач · {completionPercent}%
                </strong>
              </div>
              <div className="summary-card__metric">
                <span>Экзаменационные навыки</span>
                <strong>{dayPlan.examSkillTargets.join(', ')}</strong>
              </div>
              <div className="summary-card__metric">
                <span>Тема для устного ответа</span>
                <strong>{dayPlan.speakingPrompt}</strong>
              </div>
              <div className="summary-card__metric">
                <span>Тема письма</span>
                <strong>{dayPlan.writingPrompt ?? 'Сегодня можно без письменного блока'}</strong>
              </div>
              <div className="summary-card__metric">
                <span>Критерий дня</span>
                <strong>{dayPlan.successCriteria}</strong>
              </div>
            </div>

            <div className="card-stage">
              <div className="checklist-header">
                <div>
                  <span className="card-stage__category">План на день</span>
                  <h3>{completionPercent}% выполнено</h3>
                  <p>{completionFeedback}</p>
                </div>
                <button className="button button--ghost" type="button" onClick={handleResetCurrentDay}>
                  Сбросить день
                </button>
              </div>
              <div className="checklist-progress" aria-hidden="true">
                <div className="checklist-progress__fill" style={{ width: `${completionPercent}%` }} />
              </div>
              <div className="task-list">
                {dayPlan.tasks.map((task) => {
                  const completed = dayProgress.completedTaskIds.includes(task.id)

                  return (
                    <label className="task-item" key={task.id}>
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
              <label className="note-field">
                <span>Заметка дня</span>
                <textarea
                  value={dayProgress.note}
                  onChange={(event) => handleNoteChange(event.currentTarget.value)}
                  placeholder="Что сегодня было самым трудным?"
                  rows={3}
                />
              </label>
            </div>

            <div className="card-stage">
              <div className="card-stage__header">
                <span className="card-stage__category">Типичные ошибки (UA/RU в PL)</span>
              </div>
              <ul className="plan-list">
                {dayPlan.commonMistakesForUkrainianLearner.map((mistake) => (
                  <li key={mistake}>{mistake}</li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <aside className="summary-card">
          <h3>{planType === '8weeks' ? 'Выбор недели' : 'Выбор дня'}</h3>
          <p>
            {planType === '8weeks'
              ? 'Переключайтесь между неделями, чтобы видеть фокус и рабочий объем.'
              : 'Переключайтесь между днями 1-12, чтобы идти по плану последовательно.'}
          </p>
          <div
            className={planType === '8weeks' ? 'week-picker' : 'day-picker'}
            role="tablist"
            aria-label={planType === '8weeks' ? 'Выбор недели интенсива' : 'Выбор дня супер-интенсива'}
          >
            {planType === '8weeks'
              ? intensivePlan.map((week) => (
                  <button
                    key={week.weekNumber}
                    className={`week-chip ${selectedWeek === week.weekNumber ? 'week-chip--active' : ''}`}
                    type="button"
                    onClick={() => setSelectedWeek(week.weekNumber)}
                    aria-pressed={selectedWeek === week.weekNumber}
                  >
                    Неделя {week.weekNumber}
                  </button>
                ))
              : superIntensivePlan.map((day) => (
                  <button
                    key={day.dayNumber}
                    className={`week-chip ${selectedDay === day.dayNumber ? 'week-chip--active' : ''}`}
                    type="button"
                    onClick={() => handleSelectDay(day.dayNumber)}
                    aria-pressed={selectedDay === day.dayNumber}
                  >
                    День {day.dayNumber}
                  </button>
                ))}
          </div>
        </aside>
      </div>
    </main>
  )
}
