import { useMemo, useState } from 'react'
import { grammarB1Blocks } from '../../data/grammarB1'
import { normalizePolishAnswer } from '../../lib/answerCheck'
import type { GrammarB1QuizItem } from '../../types/grammarB1'

type AnswersState = Record<string, string>

type ReferenceSectionId = 'cases' | 'declension' | 'verbs'

interface ReferenceSection {
  id: ReferenceSectionId
  title: string
  quickTitle: string
  when: string
  rule: string
  memory: string
  mistake: string
  example: string
  translation: string
  cta: string
  status: 'ready' | 'soon'
  note?: string
  preview?: string[]
  quiz: GrammarB1QuizItem[]
}

const readySections: ReferenceSection[] = [
  {
    id: 'cases',
    title: 'Падежи без паники',
    quickTitle: 'Если путаетесь в окончаниях',
    when: 'Когда не понимаете, какой падеж нужен после предлога, глагола или отрицания.',
    rule: 'Сначала ищите сигнал: nie mam / komu? / kogo? / z kim? / w / na / o.',
    memory: 'Nie ma? Genitiv. Komu даю? Celownik. Widzę kogo/co? Biernik.',
    mistake: 'После отрицания оставлять словарь-форму: mam czas → nie mam czasu.',
    example: 'Nie mam czasu.',
    translation: 'У меня нет времени.',
    cta: 'Именно падеж чаще всего выручает в письме и в устной части.',
    status: 'ready',
    quiz: grammarB1Blocks.find((block) => block.id === 'cases')?.quiz ?? [],
  },
  {
    id: 'declension',
    title: 'Существительные и прилагательные',
    quickTitle: 'Если сложно согласовать слова',
    when: 'Когда нужно быстро согласовать род, число и падеж в фразе.',
    rule: 'Прилагательное меняется вместе с существительным: добрый / dobra / dobre.',
    memory: 'Męski, żeński, nijaki. W liczbie mnogiej: męskoosobowy / niemęskoosobowy.',
    mistake: 'Писать по-русски логично, но по-польски неверно: w ładny mieście → w ładnym mieście.',
    example: 'Mieszkam w ładnym mieście.',
    translation: 'Я живу в красивом городе.',
    cta: 'Если слово “звучит не так”, проверь окончание у прилагательного и у существительного вместе.',
    status: 'ready',
    quiz: grammarB1Blocks.find((block) => block.id === 'declension')?.quiz ?? [],
  },
  {
    id: 'verbs',
    title: 'Глаголы: время, вид, управление',
    quickTitle: 'Если не хватает точности в речи',
    when: 'Когда нужно сказать, идёт ли действие сейчас, повторяется ли оно или уже завершено.',
    rule: 'Сначала выбери: процесс (co robić?) или результат (co zrobić?). Потом — нужную форму.',
    memory: 'Jutro przeczytam = результат. Jutro będę czytać = процесс.',
    mistake: 'Смешивать завершённое будущее и процесс: będę przeczytać — неправильно.',
    example: 'Jutro napiszę e-mail.',
    translation: 'Завтра я напишу e-mail.',
    cta: 'Для B1 особенно важны być, mieć, iść, móc и пара видовых форм.',
    status: 'ready',
    quiz: grammarB1Blocks.find((block) => block.id === 'verbs')?.quiz ?? [],
  },
]

const upcomingSections: Array<{
  id: string
  title: string
  subtitle: string
  note: string
}> = [
  {
    id: 'pronouns-sie',
    title: 'Местоимения и частица się',
    subtitle: 'Краткие формы, порядок слов и типичные глаголы.',
    note: 'mnie / mi, tobie / ci, jego / go, bać się, uczyć się, podobać się.',
  },
  {
    id: 'prepositions-cases',
    title: 'Предлоги и типичные связки',
    subtitle: 'do, z, na, w, o, przy, po, dla, bez, od.',
    note: 'Особенно полезно для письма и говорения.',
  },
  {
    id: 'contrast',
    title: 'Чем польский отличается от русского и украинского',
    subtitle: 'Ложные друзья и привычки, которые мешают.',
    note: 'aktualny, dywan, uroda, sklep, ударение и формы прошедшего времени.',
  },
  {
    id: 'exam-tasks',
    title: 'Типичные задания B1',
    subtitle: 'Что повторить перед экзаменом.',
    note: 'Клише для письма, фразы для ответа и короткие стратегии.',
  },
]

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
    () =>
      questions.filter(
        (question) =>
          questions.length > 0 &&
          question.acceptedAnswers.some(
            (answer) => normalizePolishAnswer(answer) === normalizePolishAnswer(answers[question.prompt] ?? ''),
          ),
      ).length,
    [answers, questions],
  )

  return (
    <section className="card-stage grammar-ref-mini" aria-labelledby={`${blockId}-quiz-title`}>
      <div className="card-stage__header">
        <span className="card-stage__category">Мини-проверка</span>
        <h3 id={`${blockId}-quiz-title`}>Проверь себя</h3>
        <p className="muted">Ответы скрыты до действия пользователя.</p>
      </div>

      <div className="grammar-ref-mini__list">
        {questions.map((question, index) => {
          const value = answers[question.prompt] ?? ''
          const isCorrect = question.acceptedAnswers.some(
            (answer) => normalizePolishAnswer(answer) === normalizePolishAnswer(value),
          )

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
                  <strong>{isCorrect ? 'Верно.' : 'Нужно:'}</strong> {question.acceptedAnswers.join(' / ')}
                  {question.note ? ` — ${question.note}` : ''}
                </div>
              ) : null}
            </label>
          )
        })}
      </div>

      <div className="button-row">
        <button className="button button--primary" type="button" onClick={() => setRevealed(true)}>
          Проверить себя
        </button>
        <button
          className="button"
          type="button"
          onClick={() => {
            setAnswers({})
            setRevealed(false)
          }}
        >
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

function ReferenceSectionCard({ section }: { section: ReferenceSection }) {
  return (
    <article className="card-stage grammar-ref-card" id={section.id}>
      <div className="card-stage__header">
        <span className="card-stage__category">
          {section.status === 'ready' ? 'Готово' : 'Скоро'}
        </span>
        <h2>{section.title}</h2>
        <p className="muted">{section.quickTitle}</p>
      </div>

      <div className="grammar-ref-card__grid">
        <div className="grammar-ref-card__tile">
          <span>Когда это нужно</span>
          <strong>{section.when}</strong>
        </div>
        <div className="grammar-ref-card__tile">
          <span>Главное правило</span>
          <strong>{section.rule}</strong>
        </div>
        <div className="grammar-ref-card__tile">
          <span>Как запомнить</span>
          <strong>{section.memory}</strong>
        </div>
        <div className="grammar-ref-card__tile">
          <span>Частая ошибка</span>
          <strong>{section.mistake}</strong>
        </div>
      </div>

      <div className="card-stage__answer">
        <strong>Правильно по-польски:</strong> {section.example} — {section.translation}
      </div>

      <div className="card-stage__hint">
        <strong>Зачем это знать:</strong> {section.cta}
      </div>

      <GrammarMiniTest blockId={section.id} questions={section.quiz} />
    </article>
  )
}

function UpcomingSectionCard({ id, title, subtitle, note }: { id: string; title: string; subtitle: string; note: string }) {
  return (
    <article className="card-stage grammar-ref-card grammar-ref-card--soon" id={id}>
      <div className="card-stage__header">
        <span className="card-stage__category">Скоро</span>
        <h2>{title}</h2>
        <p className="muted">{subtitle}</p>
      </div>
      <div className="card-stage__hint">
        <strong>Что будет внутри:</strong> {note}
      </div>
    </article>
  )
}

export function GrammarB1Screen() {
  const readyCount = readySections.length
  const soonCount = upcomingSections.length

  return (
    <main className="app-shell">
      <div className="app-shell__grid">
        <section className="hero-card" aria-labelledby="grammar-ref-title">
          <div className="hero-card__eyebrow">B1 · справочник · коротко и по делу</div>
          <h1 id="grammar-ref-title">Справочник польского B1</h1>
          <p>
            Короткие объяснения, примеры и мини-проверки без лишней теории. Здесь удобно быстро
            повторить то, что чаще всего путается в реальном B1.
          </p>
          <div className="hero-card__meta">
            <div className="pill">
              <strong>Быстрый повтор:</strong>
              <span>{readyCount} темы</span>
            </div>
            <div className="pill">
              <strong>В очереди:</strong>
              <span>{soonCount} тем</span>
            </div>
            <div className="pill">
              <strong>Фокус:</strong>
              <span>ошибки украинцев и русскоязычных</span>
            </div>
            <div className="pill">
              <strong>Формат:</strong>
              <span>примеры с переводом</span>
            </div>
          </div>
        </section>

        <aside className="side-card">
          <h2>Что повторить быстро</h2>
          <p>Три самых полезных точки входа для повторения без перегруза.</p>
          <div className="grammar-ref-quick-grid">
            {readySections.map((section) => (
              <button
                className="grammar-ref-quick"
                type="button"
                key={section.id}
                onClick={() =>
                  document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              >
                <span>{section.quickTitle}</span>
                <strong>{section.title}</strong>
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

        <section className="trainer-card trainer-card--compact grammar-ref-main" aria-label="Справочник польского B1">
          <div className="grammar-ref-section-title">
            <div>
              <span className="card-stage__category">Быстрый повтор</span>
              <h2>Что повторить прямо сейчас</h2>
            </div>
            <p className="muted">Если вы путаетесь в окончаниях, согласовании или глаголах, начните отсюда.</p>
          </div>

          <div className="grammar-ref-topics">
            {readySections.map((section) => (
              <ReferenceSectionCard section={section} key={section.id} />
            ))}
          </div>

          <div className="grammar-ref-section-title">
            <div>
              <span className="card-stage__category">В разработке</span>
              <h2>Следующие темы</h2>
            </div>
            <p className="muted">Структура уже готова, материал будет добавляться без перестройки экрана.</p>
          </div>

          <div className="grammar-ref-topics grammar-ref-topics--soon">
            {upcomingSections.map((section) => (
              <UpcomingSectionCard key={section.id} {...section} />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
