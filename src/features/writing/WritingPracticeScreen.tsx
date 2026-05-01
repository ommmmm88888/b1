import { useEffect, useMemo, useState } from 'react'
import { writingTasks, writingTypeLabels } from '../../data/writingTasks'
import {
  clearWritingTask,
  getWritingTaskProgress,
  loadWritingProgress,
  saveWritingProgress,
  setSelectedWritingTask,
  setWritingCriterionChecked,
  setWritingDraft,
} from '../../lib/writingProgressStorage'
import type { WritingTaskType } from '../../types/writing'

const writingTypes = Object.keys(writingTypeLabels) as WritingTaskType[]

function countWords(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length
}

export function WritingPracticeScreen() {
  const [selectedType, setSelectedType] = useState<WritingTaskType>('email')
  const [progress, setProgress] = useState(() => loadWritingProgress(writingTasks[0].id))
  const tasksByType = useMemo(
    () => writingTasks.filter((task) => task.type === selectedType),
    [selectedType],
  )
  const selectedTask =
    tasksByType.find((task) => task.id === progress.selectedTaskId) ?? tasksByType[0] ?? writingTasks[0]
  const taskProgress = getWritingTaskProgress(progress, selectedTask.id)
  const wordCount = countWords(taskProgress.draft)
  const completedDraftCount = writingTasks.filter(
    (task) => getWritingTaskProgress(progress, task.id).draft.trim().length > 0,
  ).length
  const checkedCount = taskProgress.checkedCriteria.length

  useEffect(() => {
    saveWritingProgress(progress)
  }, [progress])

  function handleSelectType(type: WritingTaskType) {
    const firstTask = writingTasks.find((task) => task.type === type) ?? writingTasks[0]
    setSelectedType(type)
    setProgress((current) => setSelectedWritingTask(current, firstTask.id))
  }

  function handleSelectTask(taskId: string) {
    setProgress((current) => setSelectedWritingTask(current, taskId))
  }

  function handleDraftChange(draft: string) {
    setProgress((current) => setWritingDraft(current, selectedTask.id, draft))
  }

  function handleCriterionChange(criterion: string, checked: boolean) {
    setProgress((current) => setWritingCriterionChecked(current, selectedTask.id, criterion, checked))
  }

  function handleClear() {
    const confirmed = window.confirm('Очистить черновик и самопроверку для этого задания?')

    if (confirmed) {
      setProgress((current) => clearWritingTask(current, selectedTask.id))
    }
  }

  function handleSave() {
    setProgress((current) => setWritingDraft(current, selectedTask.id, taskProgress.draft))
  }

  return (
    <main className="app-shell">
      <div className="app-shell__grid">
        <section className="hero-card" aria-labelledby="writing-title">
          <div className="hero-card__eyebrow">B1 · письмо · локальные черновики</div>
          <h1 id="writing-title">Письменная практика</h1>
          <p>
            Практические экзаменационные шаблоны: e-mail, приглашение, объявление, жалоба, просьба
            и короткое аргументированное мнение. Проверка здесь осознанная: без AI и без сервера.
          </p>
          <div className="hero-card__meta">
            <div className="pill">
              <strong>Заданий:</strong>
              <span>{writingTasks.length}</span>
            </div>
            <div className="pill">
              <strong>Черновиков:</strong>
              <span>{completedDraftCount}</span>
            </div>
            <div className="pill">
              <strong>Слов сейчас:</strong>
              <span>{wordCount}</span>
            </div>
          </div>
          <p className="hero-card__note">Черновики сохраняются только в этом браузере.</p>
        </section>

        <aside className="side-card">
          <h2>Тип письма</h2>
          <p>Выберите формат и отработайте структуру перед написанием полного текста.</p>
          <div className="topic-picker" role="tablist" aria-label="Типы письменных заданий">
            {writingTypes.map((type) => (
              <button
                className={`topic-chip ${selectedType === type ? 'topic-chip--active' : ''}`}
                type="button"
                key={type}
                onClick={() => handleSelectType(type)}
                aria-pressed={selectedType === type}
              >
                <span>{writingTypeLabels[type]}</span>
                <small>{writingTasks.filter((task) => task.type === type).length} задания</small>
              </button>
            ))}
          </div>
        </aside>

        <section className="trainer-card">
          <div className="trainer-card__top">
            <div>
              <h2>{selectedTask.titleRu}</h2>
              <p>{selectedTask.promptRu}</p>
            </div>
            <div className="pill">
              <strong>Тип:</strong>
              <span>{writingTypeLabels[selectedTask.type]}</span>
            </div>
          </div>

          <div className="button-row">
            {tasksByType.map((task) => (
              <button
                className={`button ${task.id === selectedTask.id ? 'button--primary' : ''}`}
                type="button"
                key={task.id}
                onClick={() => handleSelectTask(task.id)}
              >
                {task.titleRu}
              </button>
            ))}
          </div>

          <div className="card-stage">
            <div className="card-stage__header">
              <span className="card-stage__category">Обязательные пункты</span>
            </div>
            <ul className="plan-list">
              {selectedTask.requiredElements.map((element) => (
                <li key={element}>{element}</li>
              ))}
            </ul>
          </div>

          <div className="card-stage">
            <div className="card-stage__header">
              <span className="card-stage__category">Черновик</span>
              <p className="muted">Ориентир для длинного задания: 100-150 слов. Сейчас: {wordCount}.</p>
            </div>
            <label className="note-field">
              <span>Ваш текст на польском</span>
              <textarea
                value={taskProgress.draft}
                onChange={(event) => handleDraftChange(event.currentTarget.value)}
                placeholder="Napisz tutaj swoją odpowiedź..."
                rows={10}
                spellCheck={false}
              />
            </label>
            <div className="button-row">
              <button className="button button--primary" type="button" onClick={handleSave}>
                Сохранить черновик
              </button>
              <button className="button" type="button" onClick={handleClear}>
                Очистить
              </button>
            </div>
          </div>

          <div className="card-stage">
            <div className="card-stage__header">
              <span className="card-stage__category">Самопроверка</span>
              <p className="muted">
                Отмечено {checkedCount} из {selectedTask.selfCheckCriteria.length}.
              </p>
            </div>
            <div className="task-list">
              {selectedTask.selfCheckCriteria.map((criterion) => (
                <label className="task-item" key={criterion}>
                  <input
                    className="task-item__checkbox"
                    type="checkbox"
                    checked={taskProgress.checkedCriteria.includes(criterion)}
                    onChange={(event) => handleCriterionChange(criterion, event.currentTarget.checked)}
                  />
                  <span className="task-item__body">
                    <span className="task-item__title">{criterion}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        </section>

        <aside className="summary-card">
          <h3>Шаблон и фразы</h3>
          <div className="card-stage__hint">
            <strong>Структура:</strong>
            <ul className="plan-list">
              {selectedTask.sampleStructureRu.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="card-stage__hint">
            <strong>Полезные фразы:</strong>
            <ul className="plan-list">
              {selectedTask.usefulPhrasesPl.map((phrase) => (
                <li key={phrase}>{phrase}</li>
              ))}
            </ul>
          </div>
          <div className="card-stage__answer">
            <strong>Образец:</strong> {selectedTask.sampleAnswerPl}
          </div>
          <div className="card-stage__hint">
            <strong>Типичные ошибки:</strong>
            <ul className="plan-list">
              {selectedTask.typicalMistakesRu.map((mistake) => (
                <li key={mistake}>{mistake}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </main>
  )
}
