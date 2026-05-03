import type {
  GrammarB1HandbookData,
  GrammarB1ReadyTopic,
  GrammarB1SoonTopic,
} from '../types/grammarB1'

const readyTopics: GrammarB1ReadyTopic[] = [
  {
    id: 'cases',
    title: 'Падежи без паники',
    shortTitle: 'Падежи и сигналы',
    status: 'ready',
    quickUseCase: [
      'Когда после глагола или предлога надо быстро выбрать форму слова.',
      'Когда в письме, просьбе или коротком ответе важна естественная форма.',
    ],
    mainRule:
      'Сначала ищите сигнал: kogo? co? = biernik, kogo? czego? = dopełniacz, z kim? z czym? = narzędnik.',
    memoryHint:
      'Biernik = вижу и беру. Dopełniacz = нет или ищу. Narzędnik = с кем, с чем, кем являюсь.',
    typicalMistake: 'Оставлять словарь-форму: nie mam czas, szukam praca, interesuję się sport.',
    correctExamples: [
      { pl: 'Mam problem z mieszkaniem.', ru: 'У меня проблема с жильём.' },
      { pl: 'Szukam pracy.', ru: 'Я ищу работу.' },
      { pl: 'Interesuję się historią.', ru: 'Я интересуюсь историей.' },
      { pl: 'Idę do urzędu.', ru: 'Я иду в учреждение.' },
      { pl: 'Proszę o pomoc.', ru: 'Прошу о помощи.' },
    ],
    examUsefulPhrases: [
      { pl: 'Mam problem z...', ru: 'У меня проблема с...' },
      { pl: 'Szukam pracy / mieszkania', ru: 'Я ищу работу / жильё.' },
      { pl: 'Interesuję się...', ru: 'Я интересуюсь...' },
      { pl: 'Proszę o pomoc', ru: 'Прошу о помощи.' },
    ],
    miniTest: [
      { prompt: 'Nie mam ___ . (czas)', answer: 'czasu', explanation: 'После nie mam нужен dopełniacz.' },
      { prompt: 'Pomagam ___ . (mama)', answer: 'mamie', explanation: 'Pomagam komu? czemu? = celownik.' },
      { prompt: 'Widzę ___ w parku. (pies)', answer: 'psa', explanation: 'Widzę kogo? co? = biernik.' },
      { prompt: 'Jestem ___ . (student)', answer: 'studentem', explanation: 'Jestem kim? czym? = narzędnik.' },
      { prompt: 'Myślę o ___ . (egzamin)', answer: 'egzaminie', explanation: 'Po o нужен miejscownik.' },
    ],
  },
  {
    id: 'declension',
    title: 'Существительные и прилагательные',
    shortTitle: 'Согласование слов',
    status: 'ready',
    quickUseCase: [
      'Когда существительное и прилагательное стоят рядом и должны совпасть по форме.',
      'Когда надо быстро проверить род, число и падеж в готовой фразе.',
    ],
    mainRule:
      'Прилагательное повторяет род, число и падеж существительного: dobry człowiek, dobra praca, dobre pytanie.',
    memoryHint: 'Сначала смотри на существительное, потом подгоняй прилагательное. Один предмет - одна форма.',
    typicalMistake: 'Переносить русскую модель: ważny sprawa, dobry pytanie, w ładny mieście.',
    correctExamples: [
      { pl: 'dobry człowiek', ru: 'добрый человек' },
      { pl: 'dobra praca', ru: 'хорошая работа' },
      { pl: 'dobre pytanie', ru: 'хороший вопрос' },
      { pl: 'dobrzy ludzie', ru: 'хорошие люди' },
      { pl: 'dobre warunki', ru: 'хорошие условия' },
    ],
    examUsefulPhrases: [
      { pl: 'ważna sprawa', ru: 'важное дело / вопрос.' },
      { pl: 'trudna sytuacja', ru: 'трудная ситуация.' },
      { pl: 'dobre rozwiązanie', ru: 'хорошее решение.' },
      { pl: 'ciekawy temat', ru: 'интересная тема.' },
    ],
    miniTest: [
      {
        prompt: 'Widzę ___ . (dobry student)',
        answer: 'dobrego studenta',
        explanation: 'Męskoosobowy Biernik często совпадает с Dopełniacz.',
      },
      { prompt: 'Nie mam ___ . (nowa książka)', answer: 'nowej książki', explanation: 'Po nie mam нужен dopełniacz.' },
      { prompt: 'Pomagam ___ . (małe dziecko)', answer: 'małemu dziecku', explanation: 'Po pomagam нужен celownik.' },
      {
        prompt: 'Rozmawiam z ___ . (polski lekarz)',
        answer: 'polskim lekarzem',
        explanation: 'Po z ким? czym? нужен narzędnik.',
      },
      { prompt: 'Mieszkam w ___ . (ładne miasto)', answer: 'ładnym mieście', explanation: 'Po w нужна форма miejscownika.' },
    ],
  },
  {
    id: 'verbs',
    title: 'Глаголы: время, вид, управление',
    shortTitle: 'Время, вид, управление',
    status: 'ready',
    quickUseCase: [
      'Когда надо рассказать о прошлом, привычке или результате действия.',
      'Когда надо выбрать между процессом и результатом.',
      'Когда глагол требует свой предлог или управление.',
    ],
    mainRule:
      'Смотри на смысл: процесс = imperfective, результат = perfective. В прошлом ещё проверяй род и число говорящего.',
    memoryHint: 'Byłem / byłam, robiłem / robiłam, byliśmy / byłyśmy. Действие готово - часто совершенный вид.',
    typicalMistake: 'Смешивать вид и прошедшую форму: będę przeczytać, albo забывать род: я был / я была.',
    correctExamples: [
      { pl: 'Byłem w urzędzie.', ru: 'Я был в учреждении.' },
      { pl: 'Byłam w urzędzie.', ru: 'Я была в учреждении.' },
      { pl: 'Robiłem zadanie.', ru: 'Я делал задание.' },
      { pl: 'Robiłam zadanie.', ru: 'Я делала задание.' },
      { pl: 'Byliśmy na kursie / Byłyśmy na kursie.', ru: 'Мы были на курсе.' },
      { pl: 'Czekam na autobus.', ru: 'Я жду автобус.' },
      { pl: 'Korzystam z internetu.', ru: 'Я пользуюсь интернетом.' },
      { pl: 'Pomagam koledze.', ru: 'Я помогаю коллеге.' },
    ],
    examUsefulPhrases: [
      { pl: 'Chciałbym opowiedzieć o...', ru: 'Я хотел бы рассказать о...' },
      { pl: 'Uważam, że...', ru: 'Я считаю, что...' },
      { pl: 'Wczoraj musiałem...', ru: 'Вчера мне пришлось...' },
      { pl: 'W przyszłości chciałbym...', ru: 'В будущем я хотел бы...' },
    ],
    miniTest: [
      { prompt: 'Ja, мужчина, ___ w urzędzie. (być)', answer: 'byłem', explanation: 'W прошлом форма показывает мужской род.' },
      { prompt: 'Ja, женщина, ___ w urzędzie. (być)', answer: 'byłam', explanation: 'Женский род в прошлом имеет окончание -am.' },
      { prompt: 'Ja, мужчина, ___ zadanie. (robić)', answer: 'robiłem', explanation: 'Несовершенный вид в прошлом по роду.' },
      { prompt: 'Ja, женщина, ___ zadanie. (robić)', answer: 'robiłam', explanation: 'Женская форма to samo znaczenie, inna końcówka.' },
      { prompt: 'My, мужчины, ___ na kursie. (być)', answer: 'byliśmy', explanation: 'Мы-мужчины = byliśmy.' },
      { prompt: 'My, женщины, ___ na kursie. (być)', answer: 'byłyśmy', explanation: 'Мы-женщины = byłyśmy.' },
    ],
  },
]

const soonTopics: GrammarB1SoonTopic[] = [
  {
    id: 'pronouns-sie',
    title: 'Местоимения и частица się',
    status: 'soon',
    whyItMatters: 'Помогает не терять короткие слова и не ломать порядок в фразе.',
    helpsWith: 'Фразы typu: daj mi, powiedz mu, uczę się, boję się, podoba mi się.',
    examplePhrase: { pl: 'Boję się egzaminu, ale uczę się codziennie.', ru: 'Я боюсь экзамена, но учусь каждый день.' },
  },
  {
    id: 'prepositions-cases',
    title: 'Предлоги и типичные связки',
    status: 'soon',
    whyItMatters: 'Предлог сразу подсказывает падеж и делает фразу естественной.',
    helpsWith: 'Письмо, просьбы, маршруты и связки типа: do domu, z pracy, na kursie, w urzędzie.',
    examplePhrase: { pl: 'Jadę do lekarza i czekam na wizytę.', ru: 'Я еду к врачу и жду визита.' },
  },
  {
    id: 'order-words',
    title: 'Порядок слов',
    status: 'soon',
    whyItMatters: 'Польская фраза звучит естественнее, когда короткие слова стоят в привычном месте.',
    helpsWith: 'Ответы, письма и устная речь, где важны простые фразы и место для nie / mi / się.',
    examplePhrase: { pl: 'Dzisiaj po pracy idę do domu.', ru: 'Сегодня после работы я иду домой.' },
  },
  {
    id: 'writing-formulas',
    title: 'Письмо: готовые формулы',
    status: 'soon',
    whyItMatters: 'Даёт готовые стартовые фразы и экономит время на экзамене.',
    helpsWith: 'Письмо, вступление, просьбы, уточнения и завершение текста.',
    examplePhrase: { pl: 'Dzień dobry, piszę w sprawie pracy.', ru: 'Добрый день, пишу по поводу работы.' },
  },
  {
    id: 'speaking-answers',
    title: 'Говорение: фразы для ответа',
    status: 'soon',
    whyItMatters: 'Помогает начать ответ без паузы и звучать спокойно.',
    helpsWith: 'Короткие ответы, мнение и простое объяснение своей позиции.',
    examplePhrase: { pl: 'Uważam, że to dobre rozwiązanie.', ru: 'Я считаю, что это хорошее решение.' },
  },
]

export const grammarB1Handbook: GrammarB1HandbookData = {
  hero: {
    eyebrow: 'B1 · справочник · коротко и по делу',
    title: 'Справочник польского B1',
    description:
      'Короткие объяснения, примеры и мини-проверки без лишней теории. Здесь удобно быстро повторить то, что чаще всего путается в реальном B1.',
    stats: [
      { label: 'Быстрый повтор', value: '3 темы' },
      { label: 'В очереди', value: '5 тем' },
      { label: 'Фокус', value: 'ошибки украинцев и русскоязычных' },
      { label: 'Формат', value: 'примеры с переводом' },
    ],
  },
  quickRepeatCards: [
    {
      title: 'Падежи без паники',
      description: 'Когда нужно быстро выбрать форму после предлога, глагола или отрицания.',
      targetTopicId: 'cases',
    },
    {
      title: 'Существительные и прилагательные',
      description: 'Когда слова должны совпасть по роду, числу и падежу.',
      targetTopicId: 'declension',
    },
    {
      title: 'Глаголы: время, вид, управление',
      description: 'Когда важны прошедшее время, вид и управление глагола.',
      targetTopicId: 'verbs',
    },
  ],
  readySection: {
    label: 'Быстрый повтор',
    title: 'Что повторить прямо сейчас',
    description: 'Если вы путаетесь в окончаниях, согласовании или глаголах, начните отсюда.',
  },
  soonSection: {
    label: 'В разработке',
    title: 'Следующие темы',
    description: 'Структура уже готова, материал будет добавляться без перестройки экрана.',
  },
  readyTopics,
  soonTopics,
}
