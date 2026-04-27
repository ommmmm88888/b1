import type { VocabularyItem } from '../types/training'

export const b1Vocabulary: VocabularyItem[] = [
  {
    id: 'appointment-doctor',
    ruPrompt: 'Мне нужно записаться на прием к врачу.',
    acceptedAnswers: ['Muszę umówić się na wizytę u lekarza', 'Muszę umówić się do lekarza'],
    hintRu: 'Слова для B1: "umówić się", "wizyta", "lekarz".',
    explanationRu:
      'Для официальной и бытовой речи естественно звучит "umówić się na wizytę" или "do lekarza".',
    category: 'бытовые ситуации',
  },
  {
    id: 'repeat-slower',
    ruPrompt: 'Не могли бы вы повторить медленнее?',
    acceptedAnswers: [
      'Czy mógłby pan/pani powtórzyć wolniej',
      'Czy mogłaby pani powtórzyć wolniej',
      'Czy mógłby pan powtórzyć wolniej',
    ],
    hintRu: 'Вежливая форма: "Czy mógłby pan/pani...?".',
    explanationRu:
      'Для экзамена полезна конструкция с "czy mógłby pan/pani" и наречием "wolniej".',
    category: 'экзаменационные фразы',
  },
  {
    id: 'bill-request',
    ruPrompt: 'Мне нужен счет, пожалуйста.',
    acceptedAnswers: ['Poproszę rachunek', 'Czy mogę prosić o rachunek'],
    hintRu: 'В ресторане часто говорят "Poproszę rachunek".',
    explanationRu:
      'В польском разговоре "rachunek" — это счет, а вежливая форма звучит очень естественно.',
    category: 'бытовые ситуации',
  },
  {
    id: 'disagree-opinion',
    ruPrompt: 'Я не согласен с этим мнением.',
    acceptedAnswers: ['Nie zgadzam się z tą opinią'],
    hintRu: 'Глагол: "zgadzać się" = соглашаться.',
    explanationRu:
      'Нужна конструкция с "nie zgadzam się z..." — это базовая B1 модель для дискуссии.',
    category: 'экзаменационные фразы',
  },
  {
    id: 'busy-now',
    ruPrompt: 'В данный момент я занят.',
    acceptedAnswers: ['W tej chwili jestem zajęty', 'W tym momencie jestem zajęty'],
    hintRu: 'Полезные варианты: "w tej chwili" и "w tym momencie".',
    explanationRu:
      'Фраза звучит естественно и пригодится в диалогах, когда нужно вежливо отказать.',
    category: 'бытовые ситуации',
  },
  {
    id: 'filled-form',
    ruPrompt: 'Я заполнил форму.',
    acceptedAnswers: ['Wypełniłem formularz', 'Wypełniłam formularz'],
    hintRu: 'Глагол "wypełnić" = заполнить.',
    explanationRu:
      'Для документов и анкет это один из самых частых глаголов в экзаменационных задачах.',
    category: 'глаголы и аспект',
  },
  {
    id: 'important-to-arrive',
    ruPrompt: 'Мне важно успеть вовремя.',
    acceptedAnswers: ['Zależy mi na tym, żeby zdążyć na czas'],
    hintRu: 'Конструкция "zależy mi na tym, żeby..." очень полезна на B1.',
    explanationRu:
      'Это готовая модель для выражения личной важности и цели. В польском она звучит естественно.',
    category: 'грамматические модели',
  },
  {
    id: 'take-part-course',
    ruPrompt: 'Я хотел бы принять участие в курсе.',
    acceptedAnswers: ['Chciałbym wziąć udział w kursie', 'Chciałabym wziąć udział w kursie'],
    hintRu: 'Сочетание: "wziąć udział".',
    explanationRu:
      'Фраза "wziąć udział w..." часто встречается в формальных и полузнакомых ситуациях.',
    category: 'экзаменационные фразы',
  },
  {
    id: 'depends-on-situation',
    ruPrompt: 'Это зависит от ситуации.',
    acceptedAnswers: ['To zależy od sytuacji'],
    hintRu: 'Стабильная модель: "zależy od".',
    explanationRu:
      'Для ответа в диалоге это одна из самых частых B1 конструкций.',
    category: 'грамматические модели',
  },
  {
    id: 'cancel-meeting',
    ruPrompt: 'Я должен отменить встречу.',
    acceptedAnswers: ['Muszę odwołać spotkanie', 'Muszę odwołać wizytę'],
    hintRu: 'Глагол "odwołać" = отменить.',
    explanationRu:
      'Подходит для работы, учёбы и бытовых дел. Можно говорить о встрече или визите.',
    category: 'бытовые ситуации',
  },
  {
    id: 'wait-minute',
    ruPrompt: 'Пожалуйста, подождите минуту.',
    acceptedAnswers: ['Proszę poczekać minutę'],
    hintRu: 'Побудительная форма: "proszę poczekać".',
    explanationRu:
      'Короткая и вежливая форма, которая помогает на экзамене в разговорном блоке.',
    category: 'экзаменационные фразы',
  },
  {
    id: 'write-if-questions',
    ruPrompt: 'Если есть вопросы, пишите мне.',
    acceptedAnswers: ['Jeśli masz pytania, napisz do mnie', 'Jeśli mają państwo pytania, proszę pisać do mnie'],
    hintRu: 'Начало: "Jeśli..."',
    explanationRu:
      'Это удобная модель для переписки, email и учебных ситуаций.',
    category: 'экзаменационные фразы',
  },
  {
    id: 'search-job',
    ruPrompt: 'Я ищу работу.',
    acceptedAnswers: ['Szukam pracy'],
    hintRu: 'Очень частая и простая B1 фраза.',
    explanationRu:
      'Используется в объявлениях, интервью и разговорах о планах.',
    category: 'бытовые ситуации',
  },
  {
    id: 'go-home-pedestrian',
    ruPrompt: 'Я возвращаюсь домой пешком.',
    acceptedAnswers: ['Wracam do domu pieszo'],
    hintRu: 'Наречие: "pieszo" = пешком.',
    explanationRu:
      'Полезно для описания повседневного маршрута и транспорта.',
    category: 'бытовые ситуации',
  },
  {
    id: 'draw-attention',
    ruPrompt: 'Я обратил внимание на ошибку.',
    acceptedAnswers: ['Zwróciłem uwagę na błąd', 'Zwróciłam uwagę na błąd'],
    hintRu: 'Глагол "zwrócić uwagę" = обратить внимание.',
    explanationRu:
      'Одна из самых полезных коллокаций для чтения, письма и устных замечаний.',
    category: 'грамматические модели',
  },
  {
    id: 'mean-other-date',
    ruPrompt: 'Я имею в виду другой срок.',
    acceptedAnswers: ['Mam na myśli inny termin'],
    hintRu: 'Фраза "mam na myśli" = я имею в виду.',
    explanationRu:
      'Хорошая модель для уточнения мысли и исправления недопонимания.',
    category: 'экзаменационные фразы',
  },
  {
    id: 'false-friend-actual',
    ruPrompt: 'Это важная информация.',
    acceptedAnswers: ['To ważna informacja', 'To istotna informacja'],
    hintRu: 'Ложный друг: польское "aktualny" значит "текущий", а не "важный".',
    explanationRu:
      'Не переводите русское "актуальный" как "aktualny" в значении "важный". Лучше: "ważny" или "istotny".',
    category: 'ложные друзья',
  },
  {
    id: 'submit-application',
    ruPrompt: 'Мне нужно подать заявление в офисе.',
    acceptedAnswers: ['Muszę złożyć wniosek w urzędzie', 'Muszę złożyć podanie w urzędzie'],
    hintRu: 'В официальном стиле: "złożyć wniosek".',
    explanationRu:
      'Слово "urząd" и модель "złożyć wniosek" очень часто встречаются в реальной жизни.',
    category: 'экзаменационные фразы',
  },
  {
    id: 'late-bus',
    ruPrompt: 'Я опаздываю на автобус.',
    acceptedAnswers: ['Spóźniam się na autobus'],
    hintRu: 'Глагол "spóźniać się" = опаздывать.',
    explanationRu:
      'Базовая ситуация из повседневной жизни и транспорта.',
    category: 'бытовые ситуации',
  },
  {
    id: 'ticket-return',
    ruPrompt: 'Мне нужно купить билет туда и обратно.',
    acceptedAnswers: ['Muszę kupić bilet tam i z powrotem', 'Muszę kupić bilet w obie strony'],
    hintRu: 'Второй вариант: "w obie strony".',
    explanationRu:
      'Полезно для вокзала, кассы и телефонных разговоров.',
    category: 'бытовые ситуации',
  },
  {
    id: 'pay-by-card',
    ruPrompt: 'Можно ли оплатить картой?',
    acceptedAnswers: ['Czy można zapłacić kartą'],
    hintRu: 'Глагол "zapłacić" = заплатить.',
    explanationRu:
      'Очень практичная фраза для магазинов и сервисов.',
    category: 'бытовые ситуации',
  },
  {
    id: 'no-sense',
    ruPrompt: 'Я не вижу смысла в этом.',
    acceptedAnswers: ['Nie widzę sensu w tym'],
    hintRu: 'Конструкция "nie widzę sensu w...".',
    explanationRu:
      'Помогает выразить несогласие в спокойной форме.',
    category: 'экзаменационные фразы',
  },
  {
    id: 'take-into-account',
    ruPrompt: 'Я должен учитывать цену.',
    acceptedAnswers: ['Muszę wziąć pod uwagę cenę'],
    hintRu: 'Устойчивая фраза: "wziąć pod uwagę".',
    explanationRu:
      'Это хороший B1 шаблон для объяснения решения или выбора.',
    category: 'грамматические модели',
  },
  {
    id: 'when-ready',
    ruPrompt: 'Когда это будет готово?',
    acceptedAnswers: ['Kiedy to będzie gotowe'],
    hintRu: 'Простой вопрос, но очень полезный в экзамене и в жизни.',
    explanationRu:
      'Подходит для сервисов, документов, ремонта и учебных задач.',
    category: 'бытовые ситуации',
  },
]
