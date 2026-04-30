export interface SuperIntensiveDayPlan {
  dayNumber: number
  title: string
  mainGoal: string
  estimatedHours: string
  focusArea: string
  tasks: string[]
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
      'Сделать короткий B1 mini-mock по 5 зонам: чтение, слушание, грамматика, письмо, говорение.',
      'Собрать карту слабых зон: что проседает по точности и по времени.',
      'Сформировать список 15-20 персональных ошибок для ежедневного повтора.',
    ],
    examSkillTargets: ['Тайминг задания', 'Понимание формата', 'Самодиагностика'],
    commonMistakesForUkrainianLearner: [
      'Смешение польских и украинских форм в окончаниях существительных.',
      'Слишком свободный порядок слов в формальном письменном ответе.',
      'Недостаточно явные связки argumentacyjne: po pierwsze, jednak, dlatego.',
    ],
    speakingPrompt: 'Opowiedz, jak wygląda twój typowy dzień pracy i co robisz po pracy.',
    writingPrompt: 'Napisz krótki e-mail formalny z prośbą o zmianę terminu spotkania.',
    successCriteria: 'Есть честный baseline по 5 зонам и список конкретных ошибок на коррекцию.',
  },
  {
    dayNumber: 2,
    title: 'Экзаменационные шаблоны выживания',
    mainGoal: 'Закрыть базовые формулы для говорения и письма, чтобы не терять легкие баллы.',
    estimatedHours: DAILY_HOURS,
    focusArea: 'Фразы-скелеты для B1 ответов.',
    tasks: [
      'Выучить и проговорить шаблоны: opinia, zgoda/niezgoda, propozycja, uzasadnienie.',
      'Собрать минимум 12 готовых формальных конструкций для письма.',
      'Отработать 2 коротких speaking-диалога по экзаменационной логике.',
    ],
    examSkillTargets: ['Spoken fluency', 'Структура ответа', 'Формальный регистр'],
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
      'Сделать 3 набора коротких дриллов на accusative/genitive/instrumental.',
      'Переписать 15 фраз из worksite-контекста в нейтральный экзаменационный стиль.',
      'Отработать связки с предлогами: do, z, na, o, dla, bez.',
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
      'Сделать короткие устные истории в прошедшем времени с самопроверкой.',
      'Отработать согласование рода и числа в 20 целевых фразах.',
      'Пересказать рабочую ситуацию в прошлом с экзаменационными связками.',
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
      'Пары aspekty: robić/zrobić, pisać/napisać, kupować/kupić в контексте.',
      'Сделать упражнения на выбор вида по смыслу результата.',
      'Короткие диалоги: план, выполнение, итог.',
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
      'Написать 2 текста в формате B1 с таймером.',
      'Сделать редактуру: структура, связки, грамматика, регистр.',
      'Переписать финальную версию после correction notes.',
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
    title: 'Listening-heavy + shadowing',
    mainGoal: 'Ускорить понимание на слух и реакцию в экзаменационном темпе.',
    estimatedHours: DAILY_HOURS,
    focusArea: 'Слушание B1 и повтор за диктором.',
    tasks: [
      'Два listening-блока: первичное прослушивание и повтор с разбором.',
      'Shadowing 15-20 минут на четкие короткие фразы.',
      'Краткий пересказ услышанного в 6-8 предложениях.',
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
    title: 'Speaking lab: от работы к экзамену',
    mainGoal: 'Перенести бытовое и рабочее общение в экзаменационный формат ответа.',
    estimatedHours: DAILY_HOURS,
    focusArea: 'Opis obrazka, dialog, opinia, аргументация.',
    tasks: [
      'Отработать описания картинки по четкой структуре.',
      'Сделать 2 диалога: просьба/переговоры и решение конфликта.',
      'Дать 3 коротких аргументированных мнения на экзаменационные темы.',
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
    title: 'Grammar rescue',
    mainGoal: 'Точечно закрыть 30-50 частых ошибок UA/RU -> PL.',
    estimatedHours: DAILY_HOURS,
    focusArea: 'Персональная грамматическая коррекция.',
    tasks: [
      'Собрать свой список 30-50 ошибок и сгруппировать по типам.',
      'Сделать короткие drills на каждый тип ошибки.',
      'Переписать 10 ошибочных фраз в правильный экзаменационный вариант.',
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
    title: 'Полный B1 mini-mock',
    mainGoal: 'Проверить прогресс после блока коррекции в условиях, близких к экзамену.',
    estimatedHours: DAILY_HOURS,
    focusArea: 'Комплексная проверка по 5 зонам.',
    tasks: [
      'Пройти полный mini-mock с таймером и без подсказок.',
      'Зафиксировать итог по каждой зоне и сравнить с днем 1.',
      'Отметить 5 критичных ошибок для последних дней.',
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
    title: 'Correction loop',
    mainGoal: 'Дожать слабые зоны: переписать, повторить, перезаписать устные ответы.',
    estimatedHours: DAILY_HOURS,
    focusArea: 'Цикл доработки после мока.',
    tasks: [
      'Переписать письменные задания с учетом замечаний.',
      'Повторить проблемные grammar-паттерны в коротких блоках.',
      'Сделать speaking-retry на темах, где был провал.',
    ],
    examSkillTargets: ['Исправление ошибок', 'Повышение предсказуемости результата'],
    commonMistakesForUkrainianLearner: [
      'Игнорирование одной и той же ошибки в новой попытке.',
      'Слабый перенос правок из письма в говорение.',
      'Неритмичная работа без приоритизации.',
    ],
    speakingPrompt: 'Powiedz, co poprawiłeś od początku sprintu i co jeszcze wymaga pracy.',
    writingPrompt: 'Napisz poprawioną wersję tekstu po otrzymaniu uwag egzaminatora.',
    successCriteria: 'Ключевые ошибки дня 10 переработаны и частично стабилизированы.',
  },
  {
    dayNumber: 12,
    title: 'Финальный mock и стратегия экзамена',
    mainGoal: 'Выйти на рабочую готовность и зафиксировать план поведения на экзамене.',
    estimatedHours: DAILY_HOURS,
    focusArea: 'Финальная проверка и стабилизация.',
    tasks: [
      'Сделать финальный мини-мок в спокойном темпе, но с таймером.',
      'Сформировать личную стратегию: что делать при ступоре, ошибке, нехватке времени.',
      'Короткая стабилизация слабой зоны без перегруза.',
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
