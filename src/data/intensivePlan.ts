export interface IntensiveWeekPlan {
  weekNumber: number
  title: string
  focus: string
  weeklyHoursTarget: string
  dailySrs: string
  speakingLabs: string
  writingCycles: string
  listeningBlocks: string
  mockExam: boolean
  successCriteria: string
  recommendedTasks: string[]
}

const BASE_WEEKLY_HOURS_TARGET = '20-26'
const BASE_DAILY_SRS = 'Ежедневно'
const BASE_SPEAKING_LABS = '3-4 раза'
const BASE_WRITING_CYCLES = '2 раза'
const BASE_LISTENING_BLOCKS = '2 раза'

export const intensivePlan: IntensiveWeekPlan[] = [
  {
    weekNumber: 1,
    title: 'Диагностика и настройка ритма',
    focus: 'Диагностика текущего A2, карта ошибок и привычка SRS каждый день.',
    weeklyHoursTarget: BASE_WEEKLY_HOURS_TARGET,
    dailySrs: BASE_DAILY_SRS,
    speakingLabs: BASE_SPEAKING_LABS,
    writingCycles: BASE_WRITING_CYCLES,
    listeningBlocks: BASE_LISTENING_BLOCKS,
    mockExam: false,
    successCriteria: 'Есть стартовый срез по 5 зонам экзамена и стабильные 5-6 учебных дней.',
    recommendedTasks: [
      'Сделать входной мини-мок по 5 зонам B1.',
      'Собрать топ-20 повторяющихся ошибок RU->PL.',
      'Запустить SRS-пул базовых фраз и грамматических коллокаций.',
    ],
  },
  {
    weekNumber: 2,
    title: 'Падежи, согласование, экзаменационные формулы',
    focus: 'Укрепление падежей, согласования и устойчивых B1-фраз для ответа.',
    weeklyHoursTarget: BASE_WEEKLY_HOURS_TARGET,
    dailySrs: BASE_DAILY_SRS,
    speakingLabs: BASE_SPEAKING_LABS,
    writingCycles: BASE_WRITING_CYCLES,
    listeningBlocks: BASE_LISTENING_BLOCKS,
    mockExam: true,
    successCriteria: 'Снижение базовых грамматических ошибок и более точные шаблоны ответа.',
    recommendedTasks: [
      'Дриллы на падежи в бытовых и формальных контекстах.',
      'Короткие speaking-lab диалоги с акцентом на согласование.',
      'Письменные микро-ответы с проверкой экзаменационных формул.',
    ],
  },
  {
    weekNumber: 3,
    title: 'Прошедшее время, аспект, бытовые сценарии',
    focus: 'Автоматизация czasu przeszłego и вида глагола в ежедневных ситуациях.',
    weeklyHoursTarget: BASE_WEEKLY_HOURS_TARGET,
    dailySrs: BASE_DAILY_SRS,
    speakingLabs: BASE_SPEAKING_LABS,
    writingCycles: BASE_WRITING_CYCLES,
    listeningBlocks: BASE_LISTENING_BLOCKS,
    mockExam: false,
    successCriteria: 'Меньше пауз в говорении и корректнее история событий в прошлом.',
    recommendedTasks: [
      'Серии RU->PL карточек по аспектам dokonany/niedokonany.',
      'Ролевые бытовые ситуации: визит, дорога, покупки, работа.',
      'Слушание коротких историй с пересказом в прошедшем времени.',
    ],
  },
  {
    weekNumber: 4,
    title: 'Первый полный B1 mock и цикл коррекции',
    focus: 'Полноформатный мок и целевой loop исправления по слабым зонам.',
    weeklyHoursTarget: BASE_WEEKLY_HOURS_TARGET,
    dailySrs: BASE_DAILY_SRS,
    speakingLabs: BASE_SPEAKING_LABS,
    writingCycles: BASE_WRITING_CYCLES,
    listeningBlocks: BASE_LISTENING_BLOCKS,
    mockExam: true,
    successCriteria: 'Прохождение полного мока с понятной картой приоритетов на 5-8 недели.',
    recommendedTasks: [
      'Сдать полный B1-style mock по всем пяти зонам.',
      'Разобрать ошибки и создать персональный correction backlog.',
      'Перепройти проблемные задания в формате timed practice.',
    ],
  },
  {
    weekNumber: 5,
    title: 'Listening-heavy и беглость речи',
    focus: 'Усиление аудирования и скорости устной реакции без потери точности.',
    weeklyHoursTarget: BASE_WEEKLY_HOURS_TARGET,
    dailySrs: BASE_DAILY_SRS,
    speakingLabs: BASE_SPEAKING_LABS,
    writingCycles: BASE_WRITING_CYCLES,
    listeningBlocks: BASE_LISTENING_BLOCKS,
    mockExam: false,
    successCriteria: 'Лучшее понимание на слух и более связная спонтанная речь.',
    recommendedTasks: [
      'Два listening-heavy блока с повторным прослушиванием.',
      'Speaking labs с таймером и ограничением на подготовку.',
      'SRS по связкам и аргументационным фразам.',
    ],
  },
  {
    weekNumber: 6,
    title: 'Письмо и грамматическая точность',
    focus: 'Циклы письма с акцентом на грамматику, структуру и связность.',
    weeklyHoursTarget: BASE_WEEKLY_HOURS_TARGET,
    dailySrs: BASE_DAILY_SRS,
    speakingLabs: BASE_SPEAKING_LABS,
    writingCycles: BASE_WRITING_CYCLES,
    listeningBlocks: BASE_LISTENING_BLOCKS,
    mockExam: true,
    successCriteria: 'Стабильный формат B1-текстов с меньшим количеством критичных ошибок.',
    recommendedTasks: [
      '2 writing cycles: черновик -> правка -> финальная версия.',
      'Точечные grammar-drills на ошибки из письменных работ.',
      'Сравнение своих ответов с эталонными B1-структурами.',
    ],
  },
  {
    weekNumber: 7,
    title: 'Интеграция экзаменационных задач',
    focus: 'Сборка навыков в связные экзаменационные блоки и добор слабых зон.',
    weeklyHoursTarget: BASE_WEEKLY_HOURS_TARGET,
    dailySrs: BASE_DAILY_SRS,
    speakingLabs: BASE_SPEAKING_LABS,
    writingCycles: BASE_WRITING_CYCLES,
    listeningBlocks: BASE_LISTENING_BLOCKS,
    mockExam: false,
    successCriteria: 'Уверенное выполнение смешанных заданий и сокращение уязвимых зон.',
    recommendedTasks: [
      'Комбинированные задания чтение + говорение + письмо.',
      'Тематические спринты по 2 самым слабым зонам.',
      'Репетиция устной части в экзаменационном темпе.',
    ],
  },
  {
    weekNumber: 8,
    title: 'Финальный mock и стабилизация',
    focus: 'Итоговый пробник, стабилизация ошибок и готовность к экзамену.',
    weeklyHoursTarget: BASE_WEEKLY_HOURS_TARGET,
    dailySrs: BASE_DAILY_SRS,
    speakingLabs: BASE_SPEAKING_LABS,
    writingCycles: BASE_WRITING_CYCLES,
    listeningBlocks: BASE_LISTENING_BLOCKS,
    mockExam: true,
    successCriteria: 'Проходной B1-style mock по всем 5 зонам и улучшение продуктивных навыков.',
    recommendedTasks: [
      'Сдать финальный полный mock с таймингом.',
      'Закрыть последние критичные ошибки из correction backlog.',
      'Сделать легкую стабилизацию без перегруза накануне экзамена.',
    ],
  },
]
