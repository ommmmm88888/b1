import type { ListeningTask } from '../types/listening'

export const listeningTasks: ListeningTask[] = [
  {
    id: 'listen-doctor',
    titleRu: 'Запись к врачу',
    textPl:
      'Dzień dobry, chciałbym umówić się na wizytę do lekarza rodzinnego. Najlepiej w tym tygodniu po godzinie szesnastej. Mam gorączkę i kaszel od trzech dni.',
    speedSuggestion: 'Сначала медленно, затем обычная скорость.',
    focus: 'дата, причина, симптомы',
    comprehensionQuestions: [
      { id: 'doctor-q1', promptRu: 'К кому хочет записаться человек?', options: ['do lekarza rodzinnego', 'do dentysty', 'do okulisty'], correctAnswer: 'do lekarza rodzinnego' },
      { id: 'doctor-q2', promptRu: 'Когда ему удобно?', options: ['rano', 'po godzinie szesnastej', 'w niedzielę'], correctAnswer: 'po godzinie szesnastej' },
      { id: 'doctor-q3', promptRu: 'Какие симптомы названы?', options: ['ból brzucha', 'gorączka i kaszel', 'ból głowy'], correctAnswer: 'gorączka i kaszel' },
    ],
    shadowingInstruction: 'Повторите текст за озвучкой по одному предложению, сохраняя вежливую интонацию.',
    usefulVocabulary: ['umówić się na wizytę', 'lekarz rodzinny', 'gorączka', 'kaszel'],
    explanationRu: 'Задание тренирует типовую бытовую ситуацию и распознавание времени/симптомов.',
  },
  {
    id: 'listen-work-delay',
    titleRu: 'Опоздание на работу',
    textPl:
      'Przepraszam, spóźnię się dziś około dwudziestu minut, ponieważ autobus nie przyjechał na czas. Będę w biurze najpóźniej o dziewiątej trzydzieści.',
    speedSuggestion: 'Обычная скорость после одного медленного прослушивания.',
    focus: 'время и причина',
    comprehensionQuestions: [
      { id: 'delay-q1', promptRu: 'На сколько человек опоздает?', options: ['10 minut', '20 minut', '30 minut'], correctAnswer: '20 minut' },
      { id: 'delay-q2', promptRu: 'Почему он опоздает?', options: ['autobus nie przyjechał', 'zapomniał dokumentów', 'jest chory'], correctAnswer: 'autobus nie przyjechał' },
      { id: 'delay-q3', promptRu: 'Когда он будет в офисе?', options: ['o 9:30', 'o 10:30', 'o 8:00'], correctAnswer: 'o 9:30' },
    ],
    shadowingInstruction: 'Повторяйте с акцентом на liczebniki: dwadzieścia, dziewiąta trzydzieści.',
    usefulVocabulary: ['spóźnię się', 'około dwudziestu minut', 'na czas', 'najpóźniej'],
    explanationRu: 'На B1 часто проверяется причина и конкретное время.',
  },
  {
    id: 'listen-library',
    titleRu: 'Библиотека',
    textPl:
      'Biblioteka będzie zamknięta w piątek z powodu szkolenia pracowników. Książki można oddać w poniedziałek bez dodatkowej opłaty.',
    speedSuggestion: 'Медленно для деталей, затем повтор за диктором.',
    focus: 'учреждение, причина, срок',
    comprehensionQuestions: [
      { id: 'library-listen-q1', promptRu: 'Когда библиотека закрыта?', options: ['w piątek', 'w poniedziałek', 'w środę'], correctAnswer: 'w piątek' },
      { id: 'library-listen-q2', promptRu: 'Почему?', options: ['remont', 'szkolenie pracowników', 'święto'], correctAnswer: 'szkolenie pracowników' },
      { id: 'library-listen-q3', promptRu: 'Когда можно вернуть книги без оплаты?', options: ['w poniedziałek', 'w sobotę', 'w niedzielę'], correctAnswer: 'w poniedziałek' },
    ],
    shadowingInstruction: 'Сначала повторите целиком, затем отдельно фразу "bez dodatkowej opłaty".',
    usefulVocabulary: ['zamknięta', 'szkolenie', 'oddać książki', 'opłata'],
    explanationRu: 'Короткие объявления требуют ловить причину и исключение.',
  },
  {
    id: 'listen-shopping',
    titleRu: 'Покупка и возврат',
    textPl:
      'Kupiłam wczoraj kurtkę, ale jest za mała. Chciałabym ją wymienić na większy rozmiar albo zwrócić, jeśli nie ma takiej możliwości.',
    speedSuggestion: 'Обычная скорость, затем shadowing фраз просьбы.',
    focus: 'жалоба, размер, решение',
    comprehensionQuestions: [
      { id: 'shopping-q1', promptRu: 'Что купили?', options: ['kurtkę', 'buty', 'torbę'], correctAnswer: 'kurtkę' },
      { id: 'shopping-q2', promptRu: 'Какая проблема?', options: ['jest za droga', 'jest za mała', 'jest brudna'], correctAnswer: 'jest za mała' },
      { id: 'shopping-q3', promptRu: 'Что хочет клиент?', options: ['wymienić albo zwrócić', 'naprawić', 'zamówić online'], correctAnswer: 'wymienić albo zwrócić' },
    ],
    shadowingInstruction: 'Повторите просьбу вежливо, без резкого тона.',
    usefulVocabulary: ['wymienić', 'większy rozmiar', 'zwrócić', 'możliwość'],
    explanationRu: 'Задание соединяет аудирование и готовую формулу для жалобы.',
  },
  {
    id: 'listen-course',
    titleRu: 'Курс польского',
    textPl:
      'Kurs B1 zaczyna się piątego czerwca. Zajęcia będą we wtorki i czwartki o osiemnastej. Cena obejmuje materiały oraz test próbny.',
    speedSuggestion: 'Сначала прослушать с открытым текстом, потом без текста.',
    focus: 'даты, дни недели, цена',
    comprehensionQuestions: [
      { id: 'course-listen-q1', promptRu: 'Когда начинается курс?', options: ['5 czerwca', '15 czerwca', '5 lipca'], correctAnswer: '5 czerwca' },
      { id: 'course-listen-q2', promptRu: 'В какие дни занятия?', options: ['wtorki i czwartki', 'poniedziałki i środy', 'soboty'], correctAnswer: 'wtorki i czwartki' },
      { id: 'course-listen-q3', promptRu: 'Что входит в цену?', options: ['materiały i test próbny', 'egzamin państwowy', 'podręcznik i obiad'], correctAnswer: 'materiały i test próbny' },
    ],
    shadowingInstruction: 'Повторите даты и дни недели отдельно.',
    usefulVocabulary: ['zaczyna się', 'zajęcia', 'obejmuje', 'test próbny'],
    explanationRu: 'Даты и дни недели часто теряются на слух, поэтому здесь они вынесены в фокус.',
  },
  {
    id: 'listen-neighbor',
    titleRu: 'Просьба к соседу',
    textPl:
      'Czy mógłby Pan trochę ciszej słuchać muzyki po dwudziestej drugiej? Jutro rano mam ważny egzamin i muszę odpocząć.',
    speedSuggestion: 'Медленно, затем обычная скорость.',
    focus: 'вежливая просьба и причина',
    comprehensionQuestions: [
      { id: 'neighbor-listen-q1', promptRu: 'О чем просят соседа?', options: ['ciszej słuchać muzyki', 'pożyczyć książkę', 'otworzyć drzwi'], correctAnswer: 'ciszej słuchać muzyki' },
      { id: 'neighbor-listen-q2', promptRu: 'После какого времени?', options: ['po 20:00', 'po 22:00', 'po 18:00'], correctAnswer: 'po 22:00' },
      { id: 'neighbor-listen-q3', promptRu: 'Почему это важно?', options: ['egzamin rano', 'goście w domu', 'praca nocna'], correctAnswer: 'egzamin rano' },
    ],
    shadowingInstruction: 'Повторите форму "Czy mógłby Pan..." как готовый вежливый шаблон.',
    usefulVocabulary: ['trochę ciszej', 'po dwudziestej drugiej', 'egzamin', 'odpocząć'],
    explanationRu: 'Тренируется вежливая просьба без агрессивного тона.',
  },
  {
    id: 'listen-weather-plan',
    titleRu: 'Планы и погода',
    textPl:
      'Jeśli jutro będzie padać, zostaniemy w domu i obejrzymy film. Jeśli pogoda będzie dobra, pojedziemy nad jezioro.',
    speedSuggestion: 'Обычная скорость, затем повтор условных фраз.',
    focus: 'условие и планы',
    comprehensionQuestions: [
      { id: 'weather-q1', promptRu: 'Что будет, если пойдет дождь?', options: ['zostaną w domu', 'pójdą do pracy', 'pojadą nad morze'], correctAnswer: 'zostaną w domu' },
      { id: 'weather-q2', promptRu: 'Что они сделают дома?', options: ['obejrzą film', 'napiszą list', 'ugotują obiad'], correctAnswer: 'obejrzą film' },
      { id: 'weather-q3', promptRu: 'Куда поедут при хорошей погоде?', options: ['nad jezioro', 'do biblioteki', 'na kurs'], correctAnswer: 'nad jezioro' },
    ],
    shadowingInstruction: 'Повторяйте пары "Jeśli..., ..." с естественной паузой.',
    usefulVocabulary: ['jeśli', 'będzie padać', 'zostaniemy', 'pojedziemy'],
    explanationRu: 'Условные фразы помогают и в говорении, и в письме.',
  },
  {
    id: 'listen-office-message',
    titleRu: 'Сообщение в офисе',
    textPl:
      'Spotkanie zespołu zostało przeniesione z godziny trzynastej na piętnastą. Proszę przygotować krótką informację o postępie pracy.',
    speedSuggestion: 'Два прослушивания: первое на смысл, второе на время.',
    focus: 'перенос времени и задача',
    comprehensionQuestions: [
      { id: 'office-q1', promptRu: 'Что перенесли?', options: ['spotkanie zespołu', 'urlop', 'szkolenie online'], correctAnswer: 'spotkanie zespołu' },
      { id: 'office-q2', promptRu: 'На какое время?', options: ['na 15:00', 'na 13:00', 'na 17:00'], correctAnswer: 'na 15:00' },
      { id: 'office-q3', promptRu: 'Что нужно подготовить?', options: ['krótką informację', 'fakturę', 'prezent'], correctAnswer: 'krótką informację' },
    ],
    shadowingInstruction: 'Повторите формулу "zostało przeniesione z... na...".',
    usefulVocabulary: ['zostało przeniesione', 'z godziny', 'na piętnastą', 'postęp pracy'],
    explanationRu: 'Перенос времени - частая деталь в заданиях на слух.',
  },
  {
    id: 'listen-invitation',
    titleRu: 'Приглашение',
    textPl:
      'Zapraszam Cię w sobotę na kolację. Spotykamy się o dziewiętnastej u mnie w domu. Możesz przyjść z osobą towarzyszącą.',
    speedSuggestion: 'Медленно для деталей, затем обычная скорость.',
    focus: 'дата, время, место, приглашение',
    comprehensionQuestions: [
      { id: 'invitation-q1', promptRu: 'Когда приглашение?', options: ['w sobotę', 'w piątek', 'w niedzielę'], correctAnswer: 'w sobotę' },
      { id: 'invitation-q2', promptRu: 'Во сколько встреча?', options: ['o 19:00', 'o 17:00', 'o 20:00'], correctAnswer: 'o 19:00' },
      { id: 'invitation-q3', promptRu: 'Куда приглашают?', options: ['do domu', 'do restauracji', 'do kina'], correctAnswer: 'do domu' },
    ],
    shadowingInstruction: 'Повторите приглашение дружелюбно, затем формально замените начало на "Serdecznie zapraszam".',
    usefulVocabulary: ['zapraszam', 'kolacja', 'spotykamy się', 'osoba towarzysząca'],
    explanationRu: 'Это мост между аудированием и письмом-приглашением.',
  },
  {
    id: 'listen-opinion',
    titleRu: 'Короткое мнение',
    textPl:
      'Moim zdaniem warto uczyć się języków obcych, ponieważ pomagają w pracy i w podróży. Poza tym dzięki językom łatwiej poznawać nowych ludzi.',
    speedSuggestion: 'Обычная скорость, затем shadowing связок.',
    focus: 'мнение и аргументы',
    comprehensionQuestions: [
      { id: 'opinion-listen-q1', promptRu: 'О чем мнение?', options: ['o nauce języków', 'o sporcie', 'o mieszkaniu'], correctAnswer: 'o nauce języków' },
      { id: 'opinion-listen-q2', promptRu: 'Почему стоит учить языки?', options: ['pomagają w pracy i podróży', 'są łatwe', 'są tanie'], correctAnswer: 'pomagają w pracy i podróży' },
      { id: 'opinion-listen-q3', promptRu: 'Что легче благодаря языкам?', options: ['poznawać ludzi', 'kupować bilety', 'gotować'], correctAnswer: 'poznawać ludzi' },
    ],
    shadowingInstruction: 'Повторите связки "Moim zdaniem", "ponieważ", "Poza tym", "dzięki".',
    usefulVocabulary: ['warto', 'języki obce', 'poza tym', 'dzięki językom'],
    explanationRu: 'Такие связки можно переносить в устный ответ и письмо-мнение.',
  },
]
