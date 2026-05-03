import { useMemo, useState } from 'react'
import { grammarB1Handbook } from '../../data/grammarB1'
import { normalizePolishAnswer } from '../../lib/answerCheck'
import type { GrammarB1MiniTestItem, GrammarB1ReadyTopic } from '../../types/grammarB1'

function GrammarMiniTest({
  blockId,
  questions,
}: {
  blockId: string
  questions: GrammarB1MiniTestItem[]
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [revealed, setRevealed] = useState(false)

  const score = useMemo(
    () =>
      questions.filter(
        (question) => normalizePolishAnswer(question.answer) === normalizePolishAnswer(answers[question.prompt] ?? ''),
      ).length,
    [answers, questions],
  )

  return (
    <section className="card-stage grammar-ref-mini" aria-labelledby={`${blockId}-quiz-title`}>
      <div className="card-stage__header">
        <span className="card-stage__category">Проверить себя</span>
        <h3 id={`${blockId}-quiz-title`}>Мини-тест</h3>
        <p className="muted">Ответы скрыты до действия пользователя.</p>
      </div>

      <div className="grammar-ref-mini__list">
        {questions.map((question, index) => {
          const value = answers[question.prompt] ?? ''
          const isCorrect = normalizePolishAnswer(question.answer) === normalizePolishAnswer(value)

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
                  <strong>{isCorrect ? 'Верно.' : 'Нужно:'}</strong> {question.answer}
                  {question.explanation ? ` — ${question.explanation}` : ''}
                </div>
              ) : null}
            </label>
          )
        })}
      </div>

      <div className="button-row">
        <button className="button button--primary" type="button" onClick={() => setRevealed((current) => !current)}>
          {revealed ? 'Скрыть ответ' : 'Показать ответ'}
        </button>
        {revealed ? (
          <button
            className="button"
            type="button"
            onClick={() => {
              setAnswers({})
              setRevealed(false)
            }}
          >
            Очистить
          </button>
        ) : null}
      </div>

      {revealed ? (
        <div className="card-stage__explanation">
          <strong>Результат:</strong> {score} из {questions.length}
        </div>
      ) : null}
    </section>
  )
}

function ReadyTopicCard({ topic }: { topic: GrammarB1ReadyTopic }) {
  return (
    <article className="card-stage grammar-ref-card" id={topic.id}>
      <div className="card-stage__header">
        <span className="card-stage__category">Готово</span>
        <h2>{topic.title}</h2>
        {topic.shortTitle ? <p className="muted">{topic.shortTitle}</p> : null}
      </div>

      <div className="grammar-ref-card__grid">
        <div className="grammar-ref-card__tile">
          <span>Когда это нужно</span>
          <div className="grammar-ref-card__lines">
            {topic.quickUseCase.map((line) => (
              <div className="grammar-ref-card__line" key={line}>
                {line}
              </div>
            ))}
          </div>
        </div>
        <div className="grammar-ref-card__tile">
          <span>Главное правило</span>
          <strong>{topic.mainRule}</strong>
        </div>
        <div className="grammar-ref-card__tile">
          <span>Запомнить быстро</span>
          <strong>{topic.memoryHint}</strong>
        </div>
        <div className="grammar-ref-card__tile">
          <span>Частая ошибка</span>
          <strong>{topic.typicalMistake}</strong>
        </div>
        <div className="grammar-ref-card__tile grammar-ref-card__tile--wide">
          <span>Правильно по-польски</span>
          <div className="grammar-ref-card__examples">
            {topic.correctExamples.map((example) => (
              <div className="grammar-ref-card__example" key={example.pl}>
                <strong>{example.pl}</strong>
                <span>{example.ru}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grammar-ref-card__tile grammar-ref-card__tile--wide">
          <span>На экзамене пригодится</span>
          <div className="grammar-ref-card__exam">
            {topic.examUsefulPhrases.map((phrase) => (
              <div className="grammar-ref-card__exam-item" key={phrase.pl}>
                <strong>{phrase.pl}</strong>
                {phrase.ru ? <span>{phrase.ru}</span> : null}
                {phrase.note ? <span>{phrase.note}</span> : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      <GrammarMiniTest blockId={topic.id} questions={topic.miniTest} />
    </article>
  )
}

function SoonTopicCard({
  title,
  whyItMatters,
  helpsWith,
  examplePhrase,
}: {
  title: string
  whyItMatters: string
  helpsWith: string
  examplePhrase: { pl: string; ru: string }
}) {
  return (
    <article className="card-stage grammar-ref-card grammar-ref-card--soon">
      <div className="card-stage__header">
        <span className="card-stage__category">Скоро</span>
        <h2>{title}</h2>
      </div>
      <div className="grammar-ref-soon">
        <div className="grammar-ref-soon__item">
          <span>Почему это важно</span>
          <strong>{whyItMatters}</strong>
        </div>
        <div className="grammar-ref-soon__item">
          <span>Что поможет</span>
          <strong>{helpsWith}</strong>
        </div>
        <div className="grammar-ref-soon__item">
          <span>Пример</span>
          <strong>{examplePhrase.pl}</strong>
          <span>{examplePhrase.ru}</span>
        </div>
      </div>
    </article>
  )
}

export function GrammarB1Screen() {
  const { hero, quickRepeatCards, readySection, soonSection, readyTopics, soonTopics } = grammarB1Handbook
  const readyCount = readyTopics.length
  const soonCount = soonTopics.length

  return (
    <main className="app-shell">
      <div className="app-shell__grid">
        <section className="hero-card" aria-labelledby="grammar-ref-title">
          <div className="hero-card__eyebrow">{hero.eyebrow}</div>
          <h1 id="grammar-ref-title">{hero.title}</h1>
          <p>{hero.description}</p>
          <div className="hero-card__meta">
            {hero.stats.map((stat) => (
              <div className="pill" key={stat.label}>
                <strong>{stat.label}:</strong>
                <span>{stat.value}</span>
              </div>
            ))}
          </div>
        </section>

        <aside className="side-card">
          <h2>{readySection.label}</h2>
          <p>{readySection.description}</p>
          <div className="grammar-ref-quick-grid">
            {quickRepeatCards.map((card) => (
              <button
                className="grammar-ref-quick"
                type="button"
                key={card.targetTopicId}
                onClick={() =>
                  document.getElementById(card.targetTopicId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              >
                <span>{card.description}</span>
                <strong>{card.title}</strong>
              </button>
            ))}
          </div>
          <div className="side-card__stats">
            <div className="stat">
              <strong>Как пользоваться</strong>
              <div className="muted">Откройте тему, прочитайте 2–3 коротких блока и проверьте себя.</div>
            </div>
          </div>
        </aside>

        <section className="trainer-card trainer-card--compact grammar-ref-main" aria-label={hero.title}>
          <div className="grammar-ref-section-title">
            <div>
              <span className="card-stage__category">{readySection.label}</span>
              <h2>{readySection.title}</h2>
            </div>
            <p className="muted">
              Если вы путаетесь в окончаниях, согласовании или глаголах, начните отсюда. {readyCount} темы
            </p>
          </div>

          <div className="grammar-ref-topics">
            {readyTopics.map((topic) => (
              <ReadyTopicCard key={topic.id} topic={topic} />
            ))}
          </div>

          <div className="grammar-ref-section-title">
            <div>
              <span className="card-stage__category">{soonSection.label}</span>
              <h2>{soonSection.title}</h2>
            </div>
            <p className="muted">
              {soonSection.description} {soonCount} тем
            </p>
          </div>

          <div className="grammar-ref-topics grammar-ref-topics--soon">
            {soonTopics.map((topic) => (
              <SoonTopicCard
                key={topic.id}
                title={topic.title}
                whyItMatters={topic.whyItMatters}
                helpsWith={topic.helpsWith}
                examplePhrase={topic.examplePhrase}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
