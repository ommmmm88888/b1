import type { MiniMockExam } from '../types/mockExam'

export const miniMockExam: MiniMockExam = {
  reading: {
    titleRu: 'Чтение: объявление о курсе',
    textPl:
      'Centrum Edukacyjne zaprasza na weekendowy kurs przygotowujący do egzaminu B1 z języka polskiego. Zajęcia odbywają się w soboty od 9.00 do 13.00 i obejmują czytanie, pisanie, słuchanie oraz rozmowę z lektorem. Kurs jest przeznaczony dla osób, które mieszkają w Polsce i potrafią już rozmawiać w codziennych sytuacjach. Każdy uczestnik otrzyma materiały oraz możliwość napisania krótkiego testu próbnego. Zapisy trwają do 20 maja.',
    questions: [
      {
        id: 'mock-reading-1',
        promptRu: 'К чему готовит курс?',
        options: ['do egzaminu B1', 'do prawa jazdy', 'do rozmowy o pracę'],
        correctAnswer: 'do egzaminu B1',
      },
      {
        id: 'mock-reading-2',
        promptRu: 'Когда проходят занятия?',
        options: ['w soboty od 9.00 do 13.00', 'w piątki wieczorem', 'codziennie rano'],
        correctAnswer: 'w soboty od 9.00 do 13.00',
      },
      {
        id: 'mock-reading-3',
        promptRu: 'Для кого предназначен курс?',
        options: ['dla osób, które już rozmawiają w codziennych sytuacjach', 'dla dzieci', 'dla osób od zera'],
        correctAnswer: 'dla osób, które już rozmawiają w codziennych sytuacjach',
      },
      {
        id: 'mock-reading-4',
        promptRu: 'Что получит каждый участник?',
        options: ['materiały i test próbny', 'certyfikat państwowy', 'podręcznik za darmo i obiad'],
        correctAnswer: 'materiały i test próbny',
      },
      {
        id: 'mock-reading-5',
        promptRu: 'До когда идет запись?',
        options: ['do 20 maja', 'do końca roku', 'do soboty'],
        correctAnswer: 'do 20 maja',
      },
    ],
  },
  grammar: [
    {
      id: 'mock-grammar-1',
      promptRu: 'Wczoraj ja (kobieta) ___ w pracy do późna.',
      acceptedAnswers: ['byłam'],
      choices: ['byłam', 'byłem', 'było'],
    },
    {
      id: 'mock-grammar-2',
      promptRu: 'Szukam ___ pracy.',
      acceptedAnswers: ['nowej'],
      choices: ['nowej', 'nową', 'nowa'],
    },
    {
      id: 'mock-grammar-3',
      promptRu: 'Interesuję się ___ kulturą.',
      acceptedAnswers: ['polską'],
      choices: ['polską', 'polskiej', 'polska'],
    },
    {
      id: 'mock-grammar-4',
      promptRu: 'Jutro ___ bilet.',
      acceptedAnswers: ['kupię'],
      choices: ['kupię', 'kupuję', 'kupowałem'],
    },
    {
      id: 'mock-grammar-5',
      promptRu: 'Czekam ___ odpowiedź.',
      acceptedAnswers: ['na'],
      choices: ['na', 'do', 'z'],
    },
    {
      id: 'mock-grammar-6',
      promptRu: 'Rozmawiam ___ kierownikiem.',
      acceptedAnswers: ['z'],
      choices: ['z', 'do', 'od'],
    },
    {
      id: 'mock-grammar-7',
      promptRu: 'To jest ___ pytanie.',
      acceptedAnswers: ['ważne'],
      choices: ['ważne', 'ważny', 'ważna'],
    },
    {
      id: 'mock-grammar-8',
      promptRu: 'Nie znam tego ___ adresu.',
      acceptedAnswers: ['nowego'],
      choices: ['nowego', 'nowy', 'nowym'],
    },
    {
      id: 'mock-grammar-9',
      promptRu: 'Po pracy ___ do sklepu. (mężczyzna)',
      acceptedAnswers: ['poszedłem'],
      choices: ['poszedłem', 'szedłem', 'pójdę'],
    },
    {
      id: 'mock-grammar-10',
      promptRu: 'Oni ___ na spotkaniu.',
      acceptedAnswers: ['byli'],
      choices: ['byli', 'były', 'było'],
    },
    {
      id: 'mock-grammar-11',
      promptRu: 'Potrzebuję ___.',
      acceptedAnswers: ['pomocy'],
      choices: ['pomocy', 'pomoc', 'pomocą'],
    },
    {
      id: 'mock-grammar-12',
      promptRu: 'Proszę ___ krótką odpowiedź.',
      acceptedAnswers: ['o'],
      choices: ['o', 'na', 'do'],
    },
    {
      id: 'mock-grammar-13',
      promptRu: 'Zależy mi ___ czasie.',
      acceptedAnswers: ['na'],
      choices: ['na', 'od', 'z'],
    },
    {
      id: 'mock-grammar-14',
      promptRu: 'To są ___ warunki pracy.',
      acceptedAnswers: ['dobre'],
      choices: ['dobre', 'dobrzy', 'dobry'],
    },
    {
      id: 'mock-grammar-15',
      promptRu: 'Już ___ e-mail do szkoły. (kobieta)',
      acceptedAnswers: ['napisałam'],
      choices: ['napisałam', 'pisałam', 'napiszę'],
    },
  ],
  writing: {
    promptRu:
      'Напишите e-mail в языковую школу. Попросите информацию о курсе B1, спросите о цене и расписании, уточните возможность пробного занятия и вежливо попросите ответ.',
    requiredElements: ['обращение', 'цель письма', 'вопрос о цене', 'вопрос о расписании', 'пробное занятие', 'вежливое завершение'],
    selfCheckCriteria: [
      'Все пункты задания раскрыты.',
      'Есть формальное или нейтральное обращение.',
      'Вопросы сформулированы понятно.',
      'Текст имеет логичный порядок.',
      'Проверены падежи и предлоги.',
      'Есть вежливое завершение.',
    ],
  },
  speaking: {
    prompts: [
      {
        id: 'mock-speaking-1',
        promptPl: 'Proszę opowiedzieć, jak przygotowuje się Pan/Pani do egzaminu B1.',
        planRu: ['цель', 'ежедневные действия', 'как проверяете прогресс'],
      },
      {
        id: 'mock-speaking-2',
        promptPl: 'Proszę porównać naukę online i naukę w szkole językowej.',
        planRu: ['плюс online', 'плюс школы', 'ваш выбор'],
      },
      {
        id: 'mock-speaking-3',
        promptPl: 'Proszę opisać sytuację, kiedy musiał(a) Pan/Pani rozwiązać problem w pracy.',
        planRu: ['что случилось', 'что сделали', 'результат'],
      },
    ],
    selfCheckCriteria: [
      'Каждый ответ длился не меньше 60 секунд.',
      'В каждом ответе была структура из 3 частей.',
      'Был хотя бы один пример.',
      'Использованы связки po pierwsze / dlatego / jednak или аналоги.',
      'Прошедшее время использовано корректно в третьем задании.',
    ],
  },
  listening: {
    titleRu: 'Аудирование: перенос встречи',
    textPl:
      'Dzień dobry, dzisiejsze spotkanie zostało przeniesione z godziny czternastej na szesnastą, ponieważ lektor ma dodatkowe konsultacje. Proszę przynieść ostatnie wypracowanie i listę pytań do egzaminu.',
    questions: [
      {
        id: 'mock-listening-1',
        promptRu: 'Что перенесли?',
        options: ['spotkanie', 'egzamin', 'kurs'],
        correctAnswer: 'spotkanie',
      },
      {
        id: 'mock-listening-2',
        promptRu: 'С какого времени на какое?',
        options: ['z 14:00 na 16:00', 'z 16:00 na 14:00', 'z 10:00 na 12:00'],
        correctAnswer: 'z 14:00 na 16:00',
      },
      {
        id: 'mock-listening-3',
        promptRu: 'Почему произошел перенос?',
        options: ['lektor ma konsultacje', 'sala jest zamknięta', 'nie ma materiałów'],
        correctAnswer: 'lektor ma konsultacje',
      },
      {
        id: 'mock-listening-4',
        promptRu: 'Что нужно принести?',
        options: ['wypracowanie i listę pytań', 'paszport', 'książkę z biblioteki'],
        correctAnswer: 'wypracowanie i listę pytań',
      },
    ],
  },
}
