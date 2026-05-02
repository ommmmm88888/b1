import { useMemo, useState } from 'react'
import { normalizePolishAnswer } from '../../lib/answerCheck'
import { grammarB1Blocks } from '../../data/grammarB1'
import type { GrammarB1Block, GrammarB1QuizItem } from '../../types/grammarB1'

type AnswersState = Record<string, string>

function isAnswerCorrect(candidate: string, acceptedAnswers: string[]): boolean {
  const normalizedCandidate = normalizePolishAnswer(candidate)

  return acceptedAnswers.some(
    (answer) => normalizePolishAnswer(answer) === normalizedCandidate,
  )
}

function GrammarMiniTest({
  blockId,
  questions,
}: {
  blockId: string
  questions: GrammarB1QuizItem[]
}) {
  const [answers, setAnswers] = useState<AnswersState>({})
  const [revealed, setRevealed] = useState(false)
  const score = useMemo(
    () => questions.filter((question) => isAnswerCorrect(answers[question.prompt] ?? '', question.acceptedAnswers)).length,
    [answers, questions],
  )

  function handleCheck() {
    setRevealed(true)
  }

  function handleReset() {
    setAnswers({})
    setRevealed(false)
  }

  return (
    <section className="card-stage grammar-b1-mini-test" aria-labelledby={`${blockId}-quiz-title`}>
      <div className="card-stage__header">
        <span className="card-stage__category">Мини-тест</span>
        <h3 id={`${blockId}-quiz-title`}>Проверьте себя</h3>
        <p className="muted">
          Ответы скрыты до проверки. После проверки показывается ваш результат и правильные формы.
        </p>
      </div>

      <div className="grammar-b1-mini-test__list">
        {questions.map((question, index) => {
          const value = answers[question.prompt] ?? ''
          const correct = isAnswerCorrect(value, question.acceptedAnswers)

          return (
            <label className="note-field" key={question.prompt}>
              <span>
                {index + 1}. {question.prompt}
              </span>
              <input
                type="text"
                value={value}
                onChange={(event) =>
                  setAnswers((current) => ({
                    ...current,
                    [question.prompt]: event.currentTarget.value,
                  }))
                }
                placeholder="Введите ответ"
                spellCheck={false}
              />
              {revealed ? (
                <div className="card-stage__answer">
                  <strong>{correct ? 'Верно.' : 'Нужно:'}</strong> {question.acceptedAnswers.join(' / ')}
                  {question.note ? ` — ${question.note}` : ''}
                </div>
              ) : null}
            </label>
          )
        })}
      </div>

      <div className="button-row">
        <button className="button button--primary" type="button" onClick={handleCheck}>
          Проверить себя
        </button>
        <button className="button" type="button" onClick={handleReset}>
          Скрыть ответы
        </button>
      </div>

      {revealed ? (
        <div className="card-stage__explanation">
          <strong>Результат:</strong> {score} из {questions.length}
        </div>
      ) : null}
    </section>
  )
}

function GrammarBlockCard({ block, index }: { block: GrammarB1Block; index: number }) {
  if (block.status === 'soon') {
    return (
      <section className="card-stage grammar-b1-block" id={block.id} aria-labelledby={`${block.id}-title`}>
        <div className="card-stage__header">
          <span className="card-stage__category">Скоро</span>
          <h2 id={`${block.id}-title`}>{block.title}</h2>
          <p className="muted">{block.subtitle}</p>
        </div>
        {block.intro.map((line) => (
          <p key={line} className="muted">
            {line}
          </p>
        ))}
        {block.preview?.length ? (
          <div className="card-stage__hint">
            <strong>Что будет внутри:</strong>
            <ul className="plan-list">
              {block.preview.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    )
  }

  return (
    <details className="grammar-b1-block practice-help-details" id={block.id} open={index === 0}>
      <summary>
        <span>{block.title}</span>
        <small>{block.subtitle}</small>
      </summary>
      <div className="practice-help-details__content grammar-b1-block__content">
        {block.intro.map((line) => (
          <p key={line} className="muted">
            {line}
          </p>
        ))}

        {block.tables.map((table) => (
          <section className="card-stage grammar-b1-card" key={table.title}>
            <div className="card-stage__header">
              <span className="card-stage__category">Таблица</span>
              <h3>{table.title}</h3>
              {table.note ? <p className="muted">{table.note}</p> : null}
            </div>
            <div className="grammar-b1-table-wrap" role="region" aria-label={table.title}>
              <table className="grammar-b1-table">
                <thead>
                  <tr>
                    {table.columns.map((column) => (
                      <th key={column}>{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row, rowIndex) => (
                    <tr key={`${table.title}-${rowIndex}`}>
                      {row.map((cell, cellIndex) => (
                        <td key={`${table.title}-${rowIndex}-${cellIndex}`}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}

        {block.mnemonic.length ? (
          <section className="card-stage grammar-b1-card">
            <div className="card-stage__header">
              <span className="card-stage__category">Мнемоника</span>
              <h3>Как запомнить</h3>
            </div>
            <ul className="plan-list">
              {block.mnemonic.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {block.examples.length ? (
          <section className="card-stage grammar-b1-card">
            <div className="card-stage__header">
              <span className="card-stage__category">Примеры</span>
              <h3>Примеры с переводом</h3>
            </div>
            <div className="grammar-b1-examples">
              {block.examples.map((example) => (
                <div className="card-stage__hint" key={example.pl}>
                  <strong>{example.pl}</strong>
                  <div className="muted">{example.ru}</div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {block.quiz.length ? <GrammarMiniTest blockId={block.id} questions={block.quiz} /> : null}
      </div>
    </details>
  )
}

export function GrammarB1Screen() {
  const readyCount = grammarB1Blocks.filter((block) => block.status === 'ready').length
  const soonCount = grammarB1Blocks.length - readyCount

  return (
    <main className="app-shell">
      <div className="app-shell__grid">
        <section className="hero-card" aria-labelledby="grammar-b1-title">
          <div className="hero-card__eyebrow">B1 · грамматика · структурированный разбор</div>
          <h1 id="grammar-b1-title">Грамматика B1</h1>
          <p>
            Шпаргалка и мини-практика по ключевым темам B1: падежи, склонение, глаголы и
            будущие разделы. Материал рассчитан на чтение с телефона и с десктопа.
          </p>
          <div className="hero-card__meta">
            <div className="pill">
              <strong>Готово:</strong>
              <span>{readyCount} блока</span>
            </div>
            <div className="pill">
              <strong>Скоро:</strong>
              <span>{soonCount} блока</span>
            </div>
            <div className="pill">
              <strong>Формат:</strong>
              <span>теория · таблицы · мнемоника · примеры · тест</span>
            </div>
          </div>
        </section>

        <aside className="side-card">
          <h2>Навигация</h2>
          <p>Первые три блока уже наполнены материалом. Остальные разделы подготовлены структурно.</p>
          <div className="topic-picker" role="navigation" aria-label="Быстрый переход по грамматике B1">
            {grammarB1Blocks.map((block) => (
              <button
                className={`topic-chip ${block.id === 'cases' ? 'topic-chip--active' : ''}`}
                type="button"
                key={block.id}
                onClick={() => document.getElementById(block.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              >
                <span>{block.title}</span>
                <small>{block.status === 'ready' ? 'готово' : 'скоро'}</small>
              </button>
            ))}
          </div>
          <div className="side-card__stats">
            <div className="stat">
              <strong>Подсказка</strong>
              <div className="muted">Разверните блок и проверьте себя в мини-тесте.</div>
            </div>
          </div>
        </aside>

        <section className="trainer-card trainer-card--compact grammar-b1-main" aria-label="Содержание грамматики B1">
          {grammarB1Blocks.map((block, index) => (
            <GrammarBlockCard block={block} index={index} key={block.id} />
          ))}
        </section>
      </div>
    </main>
  )
}
