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
        <section className="trainer-card trainer-card--compact" aria-labelledby="writing-title">
          <div className="trainer-card__top">
            <div>
              <div className="hero-card__eyebrow">B1 · письмо · ежедневная практика</div>
              <h1 id="writing-title">{selectedTask.titleRu}</h1>
              <p>{selectedTask.promptRu}</p>
            </div>
            <div className="trainer-compact-status" aria-label="Статус письменного задания">
              <span className="pill">
                <strong>Тип:</strong>
                <span>{writingTypeLabels[selectedTask.type]}</span>
              </span>
              <span className="pill">
                <strong>Слова:</strong>
                <span>{wordCount}/100-150</span>
              </span>
              <span className="pill">
                <strong>Самопроверка:</strong>
                <span>
                  {checkedCount}/{selectedTask.selfCheckCriteria.length}
                </span>
              </span>
              <span className="pill">
                <strong>Черновики:</strong>
                <span>{completedDraftCount}</span>
              </span>
            </div>
          </div>

          <details className="practice-help-details">
            <summary>Выбрать тип письма и другое задание</summary>
            <div className="practice-help-details__content">
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
            </div>
          </details>

          <div className="practice-editor-grid">
            <section className="card-stage" aria-labelledby="writing-editor-title">
              <div className="card-stage__header">
                <span className="card-stage__category">Черновик</span>
                <h2 id="writing-editor-title">Пишите ответ сразу здесь</h2>
                <p className="muted">Ориентир для длинного B1-задания: 100-150 слов.</p>
              </div>
              <label className="note-field note-field--compact">
                <span>Ваш текст на польском</span>
                <textarea
                  value={taskProgress.draft}
                  onChange={(event) => handleDraftChange(event.currentTarget.value)}
                  placeholder="Napisz tutaj swoją odpowiedź..."
                  rows={8}
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
            </section>

            <section className="card-stage" aria-labelledby="writing-check-title">
              <div className="card-stage__header">
                <span className="card-stage__category">Самопроверка</span>
                <h2 id="writing-check-title">Проверьте перед финальным вариантом</h2>
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
            </section>
          </div>

          <details className="practice-help-details">
            <summary>Шаблон, фразы, образец и типичные ошибки</summary>
            <div className="practice-help-details__content practice-help-details__content--grid">
              <div className="card-stage__hint">
                <strong>Обязательные пункты:</strong>
                <ul className="plan-list">
                  {selectedTask.requiredElements.map((element) => (
                    <li key={element}>{element}</li>
                  ))}
                </ul>
              </div>
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
              <div className="card-stage__hint">
                <strong>Типичные ошибки:</strong>
                <ul className="plan-list">
                  {selectedTask.typicalMistakesRu.map((mistake) => (
                    <li key={mistake}>{mistake}</li>
                  ))}
                </ul>
              </div>
              <div className="card-stage__answer practice-help-details__wide">
                <strong>Образец:</strong> {selectedTask.sampleAnswerPl}
              </div>
            </div>
          </details>
        </section>
      </div>
    </main>
  )
}
