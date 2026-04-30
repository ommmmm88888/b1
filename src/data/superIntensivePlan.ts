import type { SuperIntensiveTask } from '../types/intensive'

export interface SuperIntensiveDayPlan {
  dayNumber: number
  title: string
  mainGoal: string
  estimatedHours: string
  focusArea: string
  tasks: SuperIntensiveTask[]
  examSkillTargets: string[]
  commonMistakesForUkrainianLearner: string[]
  speakingPrompt: string
  writingPrompt: string | null
  successCriteria: string
}

const DAILY_HOURS = '3-5'

export const superIntensivePlan: SuperIntensiveDayPlan[] = [
  {
    dayNumber: 1,
    title: 'Диагностика и карта слабых зон',
    mainGoal: 'Понять, где вы теряете баллы в формате B1 прямо сейчас.',
    estimatedHours: DAILY_HOURS,
    focusArea: 'Мини-мок B1 и приоритизация ошибок.',
    tasks: [
      {
        id: 'd1-mini-mock',
        title: 'Сделать короткий B1 мини-мок по 5 зонам.',
        durationMinutes: 90,
        type: 'пробный экзамен',
      },
      {
        id: 'd1-weakness-map',
        title: 'Собрать карту слабых зон: точность, время, стресс.',
        durationMinutes: 40,
        type: 'исправление ошибок',
      },
      {
        id: 'd1-error-list',
        title: 'Сформировать список 15-20 ошибок для ежедневного повтора.',
        durationMinutes: 30,
        type: 'повторение',
      },
    ],
    examSkillTargets: ['Тайминг задания', 'Понимание формата', 'Самодиагностика'],
    commonMistakesForUkrainianLearner: [
      'Смешение польских и украинских форм в окончаниях существительных.',
      'Слишком свободный порядок слов в формальном письменном ответе.',
      'Недостаточно явные связки argumentacyjne: po pierwsze, jednak, dlatego.',
    ],
    speakingPrompt: 'Opowiedz, jak wygląda twój typowy dzień pracy i co robisz po pracy.',
    writingPrompt: 'Napisz krótki e-mail formalny z prośbą o zmianę terminu spotkania.',
    successCriteria: 'Есть честный стартовый срез по 5 зонам и список конкретных ошибок на коррекцию.',
  },
  {
    dayNumber: 2,
    title: 'Экзаменационные шаблоны выживания',
    mainGoal: 'Закрыть базовые формулы для говорения и письма, чтобы не терять легкие баллы.',
    estimatedHours: DAILY_HOURS,
    focusArea: 'Фразы-скелеты для B1 ответов.',
    tasks: [
      {
        id: 'd2-speaking-templates',
        title: 'Проговорить шаблоны: opinia, zgoda, propozycja, uzasadnienie.',
        durationMinutes: 55,
        type: 'говорение',
      },
      {
        id: 'd2-writing-templates',
        title: 'Собрать 12 формальных конструкций для письма.',
        durationMinutes: 45,
        type: 'письмо',
      },
      {
        id: 'd2-dialogues',
        title: 'Отработать 2 коротких устных диалога по экзаменационной логике.',
        durationMinutes: 50,
        type: 'говорение',
      },
    ],
    examSkillTargets: ['Беглость речи', 'Структура ответа', 'Формальный регистр'],
    commonMistakesForUkrainianLearner: [
      'Слишком разговорная лексика в формальных заданиях.',
      'Калька с русского/украинского в вежливых формулах.',
      'Пропуск связок между аргументами.',
    ],
    speakingPrompt: 'Czy warto zmienić pracę, jeśli obecna daje stabilność, ale mało rozwoju?',
    writingPrompt: 'Napisz zaproszenie na spotkanie integracyjne dla nowych pracowników.',
    successCriteria: 'Можете дать связный ответ по шаблону без долгих пауз.',
  },
  {
    dayNumber: 3,
    title: 'Падежи в контексте B1',
    mainGoal: 'Снизить критичные ошибки в biernik, dopełniacz, narzędnik.',
    estimatedHours: DAILY_HOURS,
    focusArea: 'Падежи в бытовых и экзаменационных фразах.',
    tasks: [
      {
        id: 'd3-case-drills',
        title: 'Сделать 3 набора коротких упражнений на biernik, dopełniacz, narzędnik.',
        durationMinutes: 75,
        type: 'грамматика',
      },
      {
        id: 'd3-work-to-exam',
        title: 'Переписать 15 рабочих фраз в нейтральный экзаменационный стиль.',
        durationMinutes: 45,
        type: 'исправление ошибок',
      },
      {
        id: 'd3-prepositions',
        title: 'Отработать связки с предлогами: do, z, na, o, dla, bez.',
        durationMinutes: 35,
        type: 'грамматика',
      },
    ],
    examSkillTargets: ['Грамматическая точность', 'Лексико-грамматический контроль'],
    commonMistakesForUkrainianLearner: [
      'Неверные окончания после предлогов do/z.',
      'Смешение рода и падежа в прилагательных.',
      'Пропуск narzędnik после być/interesować się.',
    ],
    speakingPrompt: 'Opisz problem w pracy i wyjaśnij, jak go rozwiązaliście w zespole.',
    writingPrompt: null,
    successCriteria: 'Количество падежных ошибок заметно снижается в контролируемых ответах.',
  },
  {
    dayNumber: 4,
    title: 'Прошедшее время и согласование',
    mainGoal: 'Автоматизировать формы był/była/było/byli/były и robiłem/robiłam.',
    estimatedHours: DAILY_HOURS,
    focusArea: 'Czas przeszły в устной и письменной части.',
    tasks: [
      {
        id: 'd4-past-stories',
        title: 'Сделать короткие устные истории в прошедшем времени с самопроверкой.',
        durationMinutes: 55,
        type: 'говорение',
      },
      {
        id: 'd4-agreement',
        title: 'Отработать согласование рода и числа в 20 целевых фразах.',
        durationMinutes: 50,
        type: 'грамматика',
      },
      {
        id: 'd4-work-retell',
        title: 'Пересказать рабочую ситуацию в прошлом с экзаменационными связками.',
        durationMinutes: 45,
        type: 'говорение',
      },
    ],
    examSkillTargets: ['Говорение в прошедшем', 'Грамматика согласования'],
    commonMistakesForUkrainianLearner: [
      'Смешение мужских/женских форм в первом лице.',
      'Ошибки в plural: byli/były.',
      'Непоследовательный выбор времени в одном ответе.',
    ],
    speakingPrompt: 'Opowiedz o sytuacji, kiedy musiałeś szybko rozwiązać problem w pracy.',
    writingPrompt: 'Napisz krótką notatkę o wydarzeniu, które odbyło się w twojej firmie.',
    successCriteria: 'Прошедшее время используется стабильно без критичных сбоев.',
  },
  {
    dayNumber: 5,
    title: 'Вид глагола: robić/zrobić',
    mainGoal: 'Закрепить аспект для точного описания процесса и результата.',
    estimatedHours: DAILY_HOURS,
    focusArea: 'Aspekt czasownika в типичных B1 задачах.',
    tasks: [
      {
        id: 'd5-aspect-pairs',
        title: 'Разобрать пары: robić/zrobić, pisać/napisać, kupować/kupić.',
        durationMinutes: 55,
        type: 'грамматика',
      },
      {
        id: 'd5-result-choice',
        title: 'Сделать упражнения на выбор вида по смыслу результата.',
        durationMinutes: 45,
        type: 'грамматика',
      },
      {
        id: 'd5-plan-result-dialogues',
        title: 'Проговорить короткие диалоги: план, выполнение, итог.',
        durationMinutes: 40,
        type: 'говорение',
      },
    ],
    examSkillTargets: ['Точность значения', 'Логика высказывания'],
    commonMistakesForUkrainianLearner: [
      'Использование niedokonany там, где нужен завершенный результат.',
      'Смешение аспектов в одной фразе.',
      'Слабый контроль над временной логикой задания.',
    ],
    speakingPrompt: 'Powiedz, co zwykle robisz przed ważnym egzaminem i co zrobisz dzień wcześniej.',
    writingPrompt: null,
    successCriteria: 'Вид глагола в ключевых шаблонах выбирается осознанно и стабильно.',
  },
  {
    dayNumber: 6,
    title: 'Письмо: цикл 1',
    mainGoal: 'Собрать рабочий шаблон B1-письма и снизить хаос в структуре.',
    estimatedHours: DAILY_HOURS,
    focusArea: 'E-mail, zaproszenie, ogłoszenie, reklamacja.',
    tasks: [
      {
        id: 'd6-timed-writing',
        title: 'Написать 2 текста в формате B1 с таймером.',
        durationMinutes: 75,
        type: 'письмо',
      },
      {
        id: 'd6-editing',
        title: 'Сделать редактуру: структура, связки, грамматика, регистр.',
        durationMinutes: 45,
        type: 'исправление ошибок',
      },
      {
        id: 'd6-final-version',
        title: 'Переписать финальную версию после заметок по исправлениям.',
        durationMinutes: 40,
        type: 'письмо',
      },
    ],
    examSkillTargets: ['Письмо по формату', 'Структура абзацев', 'Формальный стиль'],
    commonMistakesForUkrainianLearner: [
      'Слабое деление на абзацы.',
      'Недостаток формул вежливости в письме.',
      'Кальки в лексике и пунктуации.',
    ],
    speakingPrompt: 'Krótko uzasadnij, dlaczego warto pisać plan przed egzaminem.',
    writingPrompt: 'Napisz reklamację dotyczącą usługi wykonanej z opóźnieniem.',
    successCriteria: 'Готов как минимум один чистый B1-текст, который не стыдно сдавать.',
  },
  {
    dayNumber: 7,
    title: 'День аудирования и повторения за диктором',
    mainGoal: 'Ускорить понимание на слух и реакцию в экзаменационном темпе.',
    estimatedHours: DAILY_HOURS,
    focusArea: 'Слушание B1 и повтор за диктором.',
    tasks: [
      {
        id: 'd7-listening-blocks',
        title: 'Сделать 2 блока аудирования: первый проход и повтор с разбором.',
        durationMinutes: 80,
        type: 'аудирование',
      },
      {
        id: 'd7-shadowing',
        title: 'Повторять за диктором 15-20 минут на четкие короткие фразы.',
        durationMinutes: 25,
        type: 'аудирование',
      },
      {
        id: 'd7-retell',
        title: 'Пересказать услышанное в 6-8 предложениях.',
        durationMinutes: 30,
        type: 'говорение',
      },
    ],
    examSkillTargets: ['Аудирование', 'Скорость обработки речи', 'Произносительная уверенность'],
    commonMistakesForUkrainianLearner: [
      'Потеря смысла после незнакомого слова.',
      'Слабый контроль ключевых деталей (дата, причина, условие).',
      'Слишком длинные паузы перед ответом.',
    ],
    speakingPrompt: 'Streść krótką informację, którą usłyszałeś, i podaj jej główną myśl.',
    writingPrompt: null,
    successCriteria: 'Можете извлечь ключевую информацию и пересказать ее без паники.',
  },
  {
    dayNumber: 8,
    title: 'Устная лаборатория: от работы к экзамену',
    mainGoal: 'Перенести бытовое и рабочее общение в экзаменационный формат ответа.',
    estimatedHours: DAILY_HOURS,
    focusArea: 'Opis obrazka, dialog, opinia, аргументация.',
    tasks: [
      {
        id: 'd8-picture-description',
        title: 'Отработать описание картинки по четкой структуре.',
        durationMinutes: 45,
        type: 'говорение',
      },
      {
        id: 'd8-dialogues',
        title: 'Сделать 2 диалога: просьба, переговоры, решение конфликта.',
        durationMinutes: 55,
        type: 'говорение',
      },
      {
        id: 'd8-opinions',
        title: 'Дать 3 коротких аргументированных мнения на экзаменационные темы.',
        durationMinutes: 45,
        type: 'говорение',
      },
    ],
    examSkillTargets: ['Говорение по структуре', 'Аргументация', 'Контроль темпа'],
    commonMistakesForUkrainianLearner: [
      'Сильная опора на разговорные рабочие шаблоны вместо экзаменационных.',
      'Недостаточно четкий вывод в конце ответа.',
      'Прыжки между темами без логической связки.',
    ],
    speakingPrompt: 'Opisz zdjęcie z miejsca pracy, a potem porównaj je z sytuacją z życia codziennego.',
    writingPrompt: 'Napisz krótkie ogłoszenie o zmianie organizacji pracy w firmie.',
    successCriteria: 'Ответы звучат структурно и экзаменационно, а не только бытово.',
  },
  {
    dayNumber: 9,
    title: 'Грамматическая коррекция',
    mainGoal: 'Точечно закрыть 30-50 частых ошибок UA/RU -> PL.',
    estimatedHours: DAILY_HOURS,
    focusArea: 'Персональная грамматическая коррекция.',
    tasks: [
      {
        id: 'd9-error-groups',
        title: 'Сгруппировать 30-50 ошибок по типам.',
        durationMinutes: 45,
        type: 'исправление ошибок',
      },
      {
        id: 'd9-targeted-drills',
        title: 'Сделать короткие упражнения на каждый тип ошибки.',
        durationMinutes: 70,
        type: 'грамматика',
      },
      {
        id: 'd9-rewrite-errors',
        title: 'Переписать 10 ошибочных фраз в правильный экзаменационный вариант.',
        durationMinutes: 40,
        type: 'исправление ошибок',
      },
    ],
    examSkillTargets: ['Грамматическая устойчивость', 'Снижение повторяемых ошибок'],
    commonMistakesForUkrainianLearner: [
      'Ложные друзья и неточная лексика в формальных заданиях.',
      'Ошибки в управлении глаголов.',
      'Нестабильные окончания в прилагательных и местоимениях.',
    ],
    speakingPrompt: 'Wyjaśnij, jakie błędy językowe robisz najczęściej i jak je poprawiasz.',
    writingPrompt: null,
    successCriteria: 'Часть повторяющихся ошибок исчезает в новых ответах.',
  },
  {
    dayNumber: 10,
    title: 'Полный B1 мини-мок',
    mainGoal: 'Проверить прогресс после блока коррекции в условиях, близких к экзамену.',
    estimatedHours: DAILY_HOURS,
    focusArea: 'Комплексная проверка по 5 зонам.',
    tasks: [
      {
        id: 'd10-full-mini-mock',
        title: 'Пройти полный мини-мок с таймером и без подсказок.',
        durationMinutes: 110,
        type: 'пробный экзамен',
      },
      {
        id: 'd10-zone-score',
        title: 'Зафиксировать итог по каждой зоне и сравнить с днем 1.',
        durationMinutes: 35,
        type: 'исправление ошибок',
      },
      {
        id: 'd10-critical-errors',
        title: 'Отметить 5 критичных ошибок для последних дней.',
        durationMinutes: 25,
        type: 'исправление ошибок',
      },
    ],
    examSkillTargets: ['Стабильность под таймером', 'Интеграция навыков'],
    commonMistakesForUkrainianLearner: [
      'Возврат старых ошибок под стрессом времени.',
      'Потеря структуры в говорении после сложного вопроса.',
      'Неполные ответы в письменной части.',
    ],
    speakingPrompt: 'Wypowiedz się, czy praca zespołowa jest skuteczniejsza niż praca indywidualna.',
    writingPrompt: 'Napisz e-mail z propozycją rozwiązania problemu organizacyjnego.',
    successCriteria: 'Виден измеримый прогресс относительно диагностики дня 1.',
  },
  {
    dayNumber: 11,
    title: 'Цикл коррекции',
    mainGoal: 'Дожать слабые зоны: переписать, повторить, перезаписать устные ответы.',
    estimatedHours: DAILY_HOURS,
    focusArea: 'Цикл доработки после мока.',
    tasks: [
      {
        id: 'd11-writing-rewrite',
        title: 'Переписать письменные задания с учетом замечаний.',
        durationMinutes: 60,
        type: 'письмо',
      },
      {
        id: 'd11-grammar-repeat',
        title: 'Повторить проблемные грамматические паттерны в коротких блоках.',
        durationMinutes: 50,
        type: 'грамматика',
      },
      {
        id: 'd11-speaking-retry',
        title: 'Повторить устный ответ на темах, где был провал.',
        durationMinutes: 45,
        type: 'говорение',
      },
    ],
    examSkillTargets: ['Исправление ошибок', 'Повышение предсказуемости результата'],
    commonMistakesForUkrainianLearner: [
      'Игнорирование одной и той же ошибки в новой попытке.',
      'Слабый перенос правок из письма в говорение.',
      'Неритмичная работа без приоритизации.',
    ],
    speakingPrompt: 'Powiedz, co poprawiłeś od początku przygotowań i co jeszcze wymaga pracy.',
    writingPrompt: 'Napisz poprawioną wersję tekstu po otrzymaniu uwag egzaminatora.',
    successCriteria: 'Ключевые ошибки дня 10 переработаны и частично стабилизированы.',
  },
  {
    dayNumber: 12,
    title: 'Финальный мок и стратегия экзамена',
    mainGoal: 'Выйти на рабочую готовность и зафиксировать план поведения на экзамене.',
    estimatedHours: DAILY_HOURS,
    focusArea: 'Финальная проверка и стабилизация.',
    tasks: [
      {
        id: 'd12-final-mock',
        title: 'Сделать финальный мини-мок в спокойном темпе, но с таймером.',
        durationMinutes: 95,
        type: 'пробный экзамен',
      },
      {
        id: 'd12-exam-strategy',
        title: 'Сформировать личную стратегию на ступор, ошибку и нехватку времени.',
        durationMinutes: 35,
        type: 'повторение',
      },
      {
        id: 'd12-weak-zone',
        title: 'Стабилизировать одну слабую зону без перегруза.',
        durationMinutes: 35,
        type: 'исправление ошибок',
      },
    ],
    examSkillTargets: ['Экзаменационная готовность', 'Стратегия управления стрессом'],
    commonMistakesForUkrainianLearner: [
      'Переусложнение ответов вместо простых точных конструкций.',
      'Потеря времени на одну задачу.',
      'Слишком резкое увеличение нагрузки в последний день.',
    ],
    speakingPrompt: 'Przedstaw swoją strategię na dzień egzaminu i uzasadnij najważniejsze decyzje.',
    writingPrompt: null,
    successCriteria: 'Есть готовность к экзамену и понятный протокол действий на реальном тесте.',
  },
]
