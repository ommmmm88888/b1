import { useMemo, useState } from 'react'
import { grammarB1Handbook } from '../../data/grammarB1'
import {
  checkPolishPhrase,
  detectInputLanguage,
  findPolishSuggestion,
  getHowToSayPopularTemplates,
  howToSayHelperCategories,
} from '../../lib/howToSayMatcher'
import { filterHandbookTopics, type GrammarB1Filter } from '../../lib/grammarB1Search'
import { copyPhraseToClipboard } from '../../lib/clipboard'
import type { GrammarB1MiniTestItem, GrammarB1ReadyTopic, GrammarB1SoonTopic } from '../../types/grammarB1'
import type {
  HowToSayDisplayPhrase,
  HowToSayGenderPreference,
  HowToSayHelperCategory,
  HowToSayResult,
} from '../../types/howToSay'

const helperCategoryButtonLabels: Array<{ key: HowToSayHelperCategory; label: string }> = howToSayHelperCategories
const helperGenderButtons: Array<{ key: HowToSayGenderPreference; label: string }> = [
  { key: 'male', label: 'мужской' },
  { key: 'female', label: 'женский' },
  { key: 'both', label: 'оба' },
]

function getHelperCategoryLabel(category: HowToSayHelperCategory): string {
  return helperCategoryButtonLabels.find((item) => item.key === category)?.label ?? 'Шаблон'
}

const handbookFilters: Array<{ key: GrammarB1Filter; label: string }> = [
  { key: 'all', label: 'Все' },
  { key: 'ready', label: 'Готово' },
  { key: 'soon', label: 'Скоро' },
  { key: 'cases', label: 'Падежи' },
  { key: 'verbs', label: 'Глаголы' },
  { key: 'writing', label: 'Письмо' },
  { key: 'speaking', label: 'Говорение' },
]

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
        (question) => question.answer.trim().toLowerCase() === (answers[question.prompt] ?? '').trim().toLowerCase(),
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
          const isCorrect = question.answer.trim().toLowerCase() === value.trim().toLowerCase()

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

function SoonTopicCard({ topic }: { topic: GrammarB1SoonTopic }) {
  return (
    <article className="card-stage grammar-ref-card grammar-ref-card--soon">
      <div className="card-stage__header">
        <span className="card-stage__category">Скоро</span>
        <h2>{topic.title}</h2>
      </div>
      <div className="grammar-ref-soon">
        <div className="grammar-ref-soon__item">
          <span>Почему это важно</span>
          <strong>{topic.whyItMatters}</strong>
        </div>
        <div className="grammar-ref-soon__item">
          <span>Что поможет</span>
          <strong>{topic.helpsWith}</strong>
        </div>
        <div className="grammar-ref-soon__item">
          <span>Пример</span>
          <strong>{topic.examplePhrase.pl}</strong>
          <span>{topic.examplePhrase.ru}</span>
        </div>
      </div>
    </article>
  )
}

function SearchAndFilterPanel({
  query,
  filter,
  onQueryChange,
  onFilterChange,
}: {
  query: string
  filter: GrammarB1Filter
  onQueryChange: (value: string) => void
  onFilterChange: (value: GrammarB1Filter) => void
}) {
  return (
    <section className="card-stage grammar-ref-search">
      <div className="card-stage__header">
        <span className="card-stage__category">Поиск</span>
        <h2>Найти тему, ошибку или пример</h2>
        <p className="muted">Ищет по названию, правилу, ошибке, примерам и экзаменационным фразам.</p>
      </div>

      <label className="note-field grammar-ref-search__field">
        <span className="sr-only">Поиск по справочнику</span>
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.currentTarget.value)}
          placeholder="Найти тему, ошибку или пример"
          aria-label="Поиск по справочнику"
        />
      </label>

      <div className="grammar-ref-filter-row" role="group" aria-label="Фильтр тем">
        {handbookFilters.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`grammar-ref-filter ${filter === item.key ? 'grammar-ref-filter--active' : ''}`}
            aria-pressed={filter === item.key}
            onClick={() => onFilterChange(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </section>
  )
}

function ResultDisplayPhrases({
  phrases,
  onCopy,
  copyFeedback,
}: {
  phrases: HowToSayDisplayPhrase[]
  onCopy: (phrase: string) => void
  copyFeedback: string
}) {
  if (phrases.length === 0) {
    return null
  }

  return (
    <div className="grammar-how-to-say__variant-list">
      {phrases.map((item) => (
        <div className="grammar-how-to-say__variant" key={`${item.label}:${item.phrase}`}>
          <span className="grammar-how-to-say__variant-label">{item.label}</span>
          <strong>{item.phrase}</strong>
          <button className="button" type="button" onClick={() => onCopy(item.phrase)}>
            Скопировать
          </button>
        </div>
      ))}
      {copyFeedback ? <div className="grammar-how-to-say__copy-feedback">{copyFeedback}</div> : null}
    </div>
  )
}

function HowToSayResultCard({
  result,
  onCopy,
  copyFeedback,
  onUseSuggestion,
}: {
  result: HowToSayResult
  onCopy: (phrase: string) => void
  copyFeedback: string
  onUseSuggestion: (phrase: string) => void
}) {
  if (result.status === 'suggestion') {
    return (
      <div className="card-stage__answer grammar-how-to-say__result">
        <strong>Можно сказать так</strong>
        <div className="muted">{result.contextRu}</div>
        <div>{result.explanationRu}</div>
        {result.commonMistakeRu ? <div className="grammar-how-to-say__mistake">Частая ошибка: {result.commonMistakeRu}</div> : null}
        <ResultDisplayPhrases phrases={result.displayPhrases} onCopy={onCopy} copyFeedback={copyFeedback} />
        {result.examples.length > 0 ? (
          <div className="grammar-how-to-say__examples">
            {result.examples.map((example) => (
              <div key={example.pl} className="grammar-how-to-say__example">
                <strong>{example.pl}</strong>
                <span>{example.ru}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    )
  }

  if (result.status === 'correction') {
    return (
      <div className="card-stage__answer grammar-how-to-say__result">
        <strong>Лучше исправить</strong>
        <div className="grammar-how-to-say__example">
          <span>Было</span>
          <strong>{result.input}</strong>
        </div>
        <div>{result.explanationRu}</div>
        {result.ruleRef ? <div className="grammar-how-to-say__mistake">Правило: {result.ruleRef}</div> : null}
        <ResultDisplayPhrases phrases={result.displayPhrases} onCopy={onCopy} copyFeedback={copyFeedback} />
      </div>
    )
  }

  if (result.status === 'likely-correct') {
    return (
      <div className="card-stage__answer grammar-how-to-say__result">
        <strong>Похоже, так можно</strong>
        <div>{result.explanationRu}</div>
        <ResultDisplayPhrases phrases={result.displayPhrases} onCopy={onCopy} copyFeedback={copyFeedback} />
      </div>
    )
  }

  return (
    <div className="card-stage__answer grammar-how-to-say__result">
      <strong>Пока нет точного ответа</strong>
      <div>{result.message}</div>
      {result.suggestions.length > 0 ? <div className="muted">Вот похожие шаблоны:</div> : null}
      {result.suggestions.length > 0 ? (
        <div className="grammar-how-to-say__related-grid">
          {result.suggestions.map((suggestion) => (
          <button
            className="grammar-how-to-say__related-card"
            key={suggestion.id}
            type="button"
            onClick={() => onUseSuggestion(suggestion.inputText)}
          >
            <span className="card-stage__category">{getHelperCategoryLabel(suggestion.category)}</span>
            <strong>{suggestion.displayPhrases[0]?.phrase ?? suggestion.phrase}</strong>
            {suggestion.displayPhrases.length > 1 ? (
              <span>{suggestion.displayPhrases.map((item) => item.phrase).join(' / ')}</span>
            ) : null}
            <span>{suggestion.contextRu || suggestion.explanationRu}</span>
            <span className="grammar-how-to-say__related-note">{suggestion.explanationRu}</span>
          </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function HowToSayPanel() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<HowToSayResult | null>(null)
  const [helperCategory, setHelperCategory] = useState<HowToSayHelperCategory>('all')
  const [genderPreference, setGenderPreference] = useState<HowToSayGenderPreference>('both')
  const [copyFeedback, setCopyFeedback] = useState('')

  const popularTemplates = useMemo(
    () => getHowToSayPopularTemplates(helperCategory, 35, genderPreference),
    [genderPreference, helperCategory],
  )

  const handleCopy = (phrase: string) => {
    void copyPhraseToClipboard(phrase, typeof navigator === 'undefined' ? undefined : navigator.clipboard).then(
      setCopyFeedback,
    )
  }

  const evaluateHelper = (
    value: string,
    category: HowToSayHelperCategory = helperCategory,
    preferredGender: HowToSayGenderPreference = genderPreference,
  ): HowToSayResult => {
    const trimmed = value.trim()
    const language = detectInputLanguage(trimmed)

    if (language === 'ru') {
      return findPolishSuggestion(trimmed, { category, genderPreference: preferredGender })
    }

    if (language === 'pl') {
      return checkPolishPhrase(trimmed, { category, genderPreference: preferredGender })
    }

    return {
      status: 'unknown',
      input: trimmed,
      language: 'unknown',
      message: 'Введите русскую или польскую фразу.',
      suggestions: getHowToSayPopularTemplates(category, 23, preferredGender),
    }
  }

  const runHelper = (
    value: string,
    category: HowToSayHelperCategory = helperCategory,
    preferredGender: HowToSayGenderPreference = genderPreference,
  ) => {
    setInput(value)
    setCopyFeedback('')
    setResult(evaluateHelper(value, category, preferredGender))
  }

  const rerunWithCurrentInput = (
    category: HowToSayHelperCategory = helperCategory,
    preferredGender: HowToSayGenderPreference = genderPreference,
  ) => {
    if (input.trim()) {
      setResult(evaluateHelper(input, category, preferredGender))
      return
    }

    setResult(null)
  }

  return (
    <section className="card-stage grammar-how-to-say">
      <div className="card-stage__header">
        <span className="card-stage__category">Как сказать?</span>
        <h2>Как сказать?</h2>
        <p className="muted">Введите фразу по-русски - получите польский вариант. Введите по-польски - проверим частые ошибки.</p>
      </div>

      <div className="grammar-how-to-say__category-row" role="group" aria-label="Категории помощника">
        {helperCategoryButtonLabels.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`grammar-how-to-say__category ${helperCategory === item.key ? 'grammar-how-to-say__category--active' : ''}`}
            aria-pressed={helperCategory === item.key}
            onClick={() => {
              setHelperCategory(item.key)
              rerunWithCurrentInput(item.key, genderPreference)
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grammar-how-to-say__gender-row" role="group" aria-label="Предпочтительная форма">
        {helperGenderButtons.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`grammar-how-to-say__category ${genderPreference === item.key ? 'grammar-how-to-say__category--active' : ''}`}
            aria-pressed={genderPreference === item.key}
            onClick={() => {
              setGenderPreference(item.key)
              rerunWithCurrentInput(helperCategory, item.key)
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grammar-how-to-say__templates-wrap">
        <div className="grammar-how-to-say__section-label">
          <strong>Популярные шаблоны</strong>
          <span className="muted">Нажмите шаблон, чтобы подставить его в проверку.</span>
        </div>
        <div className="grammar-how-to-say__templates-grid">
          {popularTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              className="grammar-how-to-say__template-card"
              onClick={() => runHelper(template.inputText)}
            >
              <span className="grammar-how-to-say__template-tag">{getHelperCategoryLabel(template.category)}</span>
              <strong>{template.inputText}</strong>
              <span>{template.displayPhrases.map((item) => item.phrase).join(' / ')}</span>
            </button>
          ))}
        </div>
      </div>

      <label className="note-field note-field--compact grammar-how-to-say__field">
        <span className="sr-only">Фраза для проверки</span>
        <textarea
          value={input}
          onChange={(event) => setInput(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && event.ctrlKey) {
              event.preventDefault()
              runHelper(event.currentTarget.value)
            }
          }}
          placeholder="Например: Я ищу работу / Szukam pracę"
          aria-label="Фраза для проверки"
          spellCheck={false}
        />
      </label>

      <div className="button-row">
        <button className="button button--primary" type="button" onClick={() => runHelper(input)}>
          Проверить фразу
        </button>
        <div className="grammar-how-to-say__hint">Ctrl+Enter - проверить.</div>
      </div>

      {result ? (
        <HowToSayResultCard
          result={result}
          onCopy={handleCopy}
          copyFeedback={copyFeedback}
          onUseSuggestion={(phrase) => runHelper(phrase)}
        />
      ) : null}
    </section>
  )
}

export function GrammarB1Screen() {
  const { hero, quickRepeatCards, readySection, soonSection, readyTopics, soonTopics } = grammarB1Handbook
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<GrammarB1Filter>('all')

  const filteredReadyTopics = useMemo(
    () => filterHandbookTopics(readyTopics, searchQuery, selectedFilter),
    [readyTopics, searchQuery, selectedFilter],
  )
  const filteredSoonTopics = useMemo(
    () => filterHandbookTopics(soonTopics, searchQuery, selectedFilter),
    [soonTopics, searchQuery, selectedFilter],
  )
  const hasResults = filteredReadyTopics.length > 0 || filteredSoonTopics.length > 0

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
          <div className="grammar-ref-tools">
            <SearchAndFilterPanel
              query={searchQuery}
              filter={selectedFilter}
              onQueryChange={setSearchQuery}
              onFilterChange={setSelectedFilter}
            />
            <HowToSayPanel />
          </div>

          {hasResults ? (
            <>
              {filteredReadyTopics.length > 0 ? (
                <>
                  <div className="grammar-ref-section-title">
                    <div>
                      <span className="card-stage__category">{readySection.label}</span>
                      <h2>{readySection.title}</h2>
                    </div>
                    <p className="muted">
                      Если вы путаетесь в окончаниях, согласовании или глаголах, начните отсюда.
                    </p>
                  </div>

                  <div className="grammar-ref-topics">
                    {filteredReadyTopics.map((topic) => (
                      <ReadyTopicCard key={topic.id} topic={topic} />
                    ))}
                  </div>
                </>
              ) : null}

              {filteredSoonTopics.length > 0 ? (
                <>
                  <div className="grammar-ref-section-title">
                    <div>
                      <span className="card-stage__category">{soonSection.label}</span>
                      <h2>{soonSection.title}</h2>
                    </div>
                    <p className="muted">{soonSection.description}</p>
                  </div>

                  <div className="grammar-ref-topics grammar-ref-topics--soon">
                    {filteredSoonTopics.map((topic) => (
                      <SoonTopicCard key={topic.id} topic={topic} />
                    ))}
                  </div>
                </>
              ) : null}
            </>
          ) : (
            <div className="empty-state grammar-ref-empty">
              Ничего не найдено. Попробуйте: падежи, глаголы, письмо.
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
