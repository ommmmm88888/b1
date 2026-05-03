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
  when: string[]
  rule: string
  memory: string
  mistake: string
  examples: Array<{ pl: string; ru: string }>
  examPhrases: string[]
  status: 'ready' | 'soon'
  quiz: GrammarB1QuizItem[]
}

interface UpcomingSection {
  id: string
  title: string
  subtitle: string
  why: string
  helps: string
  example: string
}

const readySections: ReferenceSection[] = [
  {
    id: 'cases',
    title: 'Падежи без паники',
    quickTitle: 'Когда падеж нужен сразу',
    when: [
      'Это нужно, когда после глагола или предлога нужно быстро выбрать форму слова.',
      'На B1 это чаще всего встречается в письме, в просьбах и в коротких ответах.',
    ],
    rule: 'Сначала ищите сигнал: kogo? co? = biernik, kogo? czego? = dopełniacz, z kim? z czym? = narzędnik.',
    memory: 'Biernik = вижу и беру. Dopełniacz = нет или ищу. Narzędnik = с кем, с чем, кем являюсь.',
    mistake: 'По привычке оставлять словарь-форму: nie mam czas, szukam praca, interesuję się sport.',
    examples: [
      { pl: 'Mam problem z mieszkaniem.', ru: 'У меня проблема с жильём.' },
      { pl: 'Szukam pracy.', ru: 'Я ищу работу.' },
      { pl: 'Interesuję się historią.', ru: 'Я интересуюсь историей.' },
      { pl: 'Idę do urzędu.', ru: 'Я иду в учреждение.' },
      { pl: 'Proszę o pomoc.', ru: 'Прошу о помощи.' },
    ],
    examPhrases: ['Mam problem z...', 'Szukam pracy / mieszkania', 'Interesuję się...', 'Proszę o pomoc'],
    status: 'ready',
    quiz: grammarB1Blocks.find((block) => block.id === 'cases')?.quiz ?? [],
  },
  {
    id: 'declension',
    title: 'Существительные и прилагательные',
    quickTitle: 'Когда слова должны совпасть',
    when: [
      'Это нужно, когда существительное и прилагательное идут рядом и должны совпасть по форме.',
      'На экзамене ошибка здесь сразу заметна, потому что фраза звучит неестественно.',
    ],
    rule: 'Прилагательное повторяет род, число и падеж существительного: dobry człowiek, dobra praca, dobre pytanie.',
    memory: 'Сначала смотри на существительное, потом подгоняй прилагательное. Один предмет - одна форма.',
    mistake: 'Переносить русскую модель: ważny sprawa, dobry pytanie, w ładny mieście.',
    examples: [
      { pl: 'dobry człowiek', ru: 'добрый человек' },
      { pl: 'dobra praca', ru: 'хорошая работа' },
      { pl: 'dobre pytanie', ru: 'хороший вопрос' },
      { pl: 'dobrzy ludzie', ru: 'хорошие люди' },
      { pl: 'dobre warunki', ru: 'хорошие условия' },
    ],
    examPhrases: ['ważna sprawa', 'trudna sytuacja', 'dobre rozwiązanie', 'ciekawy temat'],
    status: 'ready',
    quiz: grammarB1Blocks.find((block) => block.id === 'declension')?.quiz ?? [],
  },
  {
    id: 'verbs',
    title: 'Глаголы: время, вид, управление',
    quickTitle: 'Когда важны время и вид',
    when: [
      'Это нужно, когда надо рассказать о прошлом, привычке или результате действия.',
      'Также это важно для управления глаголов: czekam na..., proszę o..., korzystam z..., pomagam komuś.',
    ],
    rule: 'Смотри на смысл: процесс = imperfective, результат = perfective. В прошлом ещё проверяй род и число говорящего.',
    memory: 'Byłem / byłam, robiłem / robiłam, byliśmy / byłyśmy. Действие готово - часто совершенный вид.',
    mistake: 'Смешивать вид и прошедшую форму: będę przeczytać, albo забывать род: я был / я была.',
    examples: [
      { pl: 'Byłem w urzędzie.', ru: 'Я был в учреждении.' },
      { pl: 'Byłam w urzędzie.', ru: 'Я была в учреждении.' },
      { pl: 'Robiłem zadanie.', ru: 'Я делал задание.' },
      { pl: 'Robiłam zadanie.', ru: 'Я делала задание.' },
      { pl: 'Byliśmy na kursie / Byłyśmy na kursie.', ru: 'Мы были на курсе.' },
      { pl: 'Czekam na autobus.', ru: 'Я жду автобус.' },
      { pl: 'Korzystam z internetu.', ru: 'Я пользуюсь интернетом.' },
      { pl: 'Pomagam koledze.', ru: 'Я помогаю коллеге.' },
    ],
    examPhrases: ['Chciałbym opowiedzieć o...', 'Uważam, że...', 'Wczoraj musiałem...', 'W przyszłości chciałbym...'],
    status: 'ready',
    quiz: grammarB1Blocks.find((block) => block.id === 'verbs')?.quiz ?? [],
  },
]

const upcomingSections: UpcomingSection[] = [
  {
    id: 'pronouns-sie',
    title: 'Местоимения и частица się',
    subtitle: 'Краткие формы и się',
    why: 'Помогает не терять короткие слова и естественный порядок в фразе.',
    helps: 'Чтение, письмо и разговор, где часто встречаются mnie, mi, go, ją, się.',
    example: 'Boję się egzaminu, ale uczę się codziennie.',
  },
  {
    id: 'prepositions-cases',
    title: 'Предлоги и типичные связки',
    subtitle: 'do, z, na, w, o, przy, po',
    why: 'Предлог сразу подсказывает падеж и делает фразу естественной.',
    helps: 'Письмо, просьбы, короткие ответы и описание маршрута или цели.',
    example: 'Jadę do lekarza i czekam na wizytę.',
  },
  {
    id: 'contrast',
    title: 'Отличия польского от русского и украинского',
    subtitle: 'Ложные друзья и привычки',
    why: 'Так проще не переносить русскую или украинскую модель прямо в польский.',
    helps: 'Слова-ловушки, ударение, прошедшее время по родам и устойчивые фразы.',
    example: 'Wczoraj byłem w domu, a dzisiaj odpoczywam.',
  },
  {
    id: 'exam-tasks',
    title: 'Типичные задания экзамена B1',
    subtitle: 'Формулы для письма и ответа',
    why: 'Даёт готовые стартовые фразы и экономит время на экзамене.',
    helps: 'Письмо, устная часть, короткий комментарий и объяснение мнения.',
    example: 'Dzień dobry, piszę w sprawie pracy.',
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
        <span className="card-stage__category">Проверить себя</span>
        <h3 id={`${blockId}-quiz-title`}>Мини-тест</h3>
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

function ReferenceSectionCard({ section }: { section: ReferenceSection }) {
  return (
    <article className="card-stage grammar-ref-card" id={section.id}>
      <div className="card-stage__header">
        <span className="card-stage__category">{section.status === 'ready' ? 'Готово' : 'Скоро'}</span>
        <h2>{section.title}</h2>
        <p className="muted">{section.quickTitle}</p>
      </div>

      <div className="grammar-ref-card__grid">
        <div className="grammar-ref-card__tile">
          <span>Когда это нужно</span>
          <div className="grammar-ref-card__lines">
            {section.when.map((line) => (
              <div className="grammar-ref-card__line" key={line}>
                {line}
              </div>
            ))}
          </div>
        </div>
        <div className="grammar-ref-card__tile">
          <span>Главное правило</span>
          <strong>{section.rule}</strong>
        </div>
        <div className="grammar-ref-card__tile">
          <span>Запомнить быстро</span>
          <strong>{section.memory}</strong>
        </div>
        <div className="grammar-ref-card__tile">
          <span>Частая ошибка</span>
          <strong>{section.mistake}</strong>
        </div>
        <div className="grammar-ref-card__tile grammar-ref-card__tile--wide">
          <span>Правильно по-польски</span>
          <div className="grammar-ref-card__examples">
            {section.examples.map((example) => (
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
            {section.examPhrases.map((phrase) => (
              <div className="grammar-ref-card__exam-item" key={phrase}>
                {phrase}
              </div>
            ))}
          </div>
        </div>
      </div>

      <GrammarMiniTest blockId={section.id} questions={section.quiz} />
    </article>
  )
}

function UpcomingSectionCard({ id, title, subtitle, why, helps, example }: UpcomingSection) {
  return (
    <article className="card-stage grammar-ref-card grammar-ref-card--soon" id={id}>
      <div className="card-stage__header">
        <span className="card-stage__category">Скоро</span>
        <h2>{title}</h2>
        <p className="muted">{subtitle}</p>
      </div>
      <div className="grammar-ref-soon">
        <div className="grammar-ref-soon__item">
          <span>Почему это важно</span>
          <strong>{why}</strong>
        </div>
        <div className="grammar-ref-soon__item">
          <span>Что поможет</span>
          <strong>{helps}</strong>
        </div>
        <div className="grammar-ref-soon__item">
          <span>Пример</span>
          <strong>{example}</strong>
        </div>
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
          <h2>Быстрый повтор</h2>
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
