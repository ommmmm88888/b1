import { useEffect, useMemo, useState } from 'react'
import { intensivePlan } from '../../data/intensivePlan'

const STORAGE_KEY = 'b1_intensive_selected_week'

function resolveInitialWeek(): number {
  const raw = globalThis.localStorage?.getItem(STORAGE_KEY)
  const parsed = Number(raw)

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > intensivePlan.length) {
    return 1
  }

  return parsed
}

export function IntensivePlanScreen() {
  const [selectedWeek, setSelectedWeek] = useState<number>(resolveInitialWeek)

  useEffect(() => {
    // TODO v0.4: sync with richer progress model for week completion tracking.
    globalThis.localStorage?.setItem(STORAGE_KEY, `${selectedWeek}`)
  }, [selectedWeek])

  const weekPlan = useMemo(
    () => intensivePlan.find((week) => week.weekNumber === selectedWeek) ?? intensivePlan[0],
    [selectedWeek],
  )

  return (
    <main className="app-shell">
      <div className="app-shell__grid app-shell__grid--plan">
        <section className="hero-card" aria-labelledby="plan-title">
          <div className="hero-card__eyebrow">Методика v0.3 · 8 недель · A2B1</div>
          <h1 id="plan-title">8-недельный интенсив A2B1</h1>
          <p>
            Планировочный слой для дисциплинированной подготовки: ежедневный SRS, регулярная
            продуктивная практика и контроль через B1-style mock.
          </p>
          <div className="hero-card__meta">
            <div className="pill">
              <strong>Нагрузка:</strong>
              <span>20-26 часов в неделю</span>
            </div>
            <div className="pill">
              <strong>Текущая неделя:</strong>
              <span>{weekPlan.weekNumber}</span>
            </div>
          </div>
          <p className="hero-card__note">
            Это интенсивный режим: он работает только при регулярной практике 5-6 дней в неделю.
          </p>
        </section>

        <aside className="side-card">
          <h2>Ритм недели</h2>
          <div className="side-card__stats">
            <div className="stat">
              <strong>SRS каждый день</strong>
              <div className="muted">ежедневный цикл закрепления лексики и структур</div>
            </div>
            <div className="stat">
              <strong>Speaking labs 3-4 раза</strong>
              <div className="muted">короткие разговорные блоки под таймер</div>
            </div>
            <div className="stat">
              <strong>Writing cycles 2 раза</strong>
              <div className="muted">черновик, правка и финальная версия</div>
            </div>
            <div className="stat">
              <strong>Listening blocks 2 раза</strong>
              <div className="muted">слушание с повтором и разбором</div>
            </div>
            <div className="stat">
              <strong>Mock exam раз в 2 недели</strong>
              <div className="muted">проверка прогресса во всех 5 экзаменационных зонах</div>
            </div>
          </div>
        </aside>

        <section className="trainer-card">
          <div className="trainer-card__top">
            <div>
              <h2>Неделя {weekPlan.weekNumber}: {weekPlan.title}</h2>
              <p>{weekPlan.focus}</p>
            </div>
            <div className="pill">
              <strong>Mock:</strong>
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
              <span>Speaking labs</span>
              <strong>{weekPlan.speakingLabs}</strong>
            </div>
            <div className="summary-card__metric">
              <span>Writing cycles</span>
              <strong>{weekPlan.writingCycles}</strong>
            </div>
            <div className="summary-card__metric">
              <span>Listening blocks</span>
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

        <aside className="summary-card">
          <h3>Выбор недели</h3>
          <p>Переключайтесь между неделями, чтобы видеть фокус и рабочий объем.</p>
          <div className="week-picker" role="tablist" aria-label="Выбор недели интенсива">
            {intensivePlan.map((week) => (
              <button
                key={week.weekNumber}
                className={`week-chip ${selectedWeek === week.weekNumber ? 'week-chip--active' : ''}`}
                type="button"
                onClick={() => setSelectedWeek(week.weekNumber)}
                aria-pressed={selectedWeek === week.weekNumber}
              >
                Неделя {week.weekNumber}
              </button>
            ))}
          </div>
        </aside>
      </div>
    </main>
  )
}
