import type { AcceptedTranslationAnswer, Register, VocabularyItem } from '../types/training'

function answer(text: string, register: Register): AcceptedTranslationAnswer {
  return { text, register }
}

export const b1Vocabulary: VocabularyItem[] = [
  {
    id: 'appointment-doctor',
    ruPrompt: 'Мне нужно записаться на прием к врачу.',
    register: 'neutral',
    acceptedAnswers: [answer('Muszę umówić się na wizytę u lekarza', 'neutral'), answer('Muszę umówić się do lekarza', 'neutral')],
    hintRu: 'Слова для B1: "umówić się", "wizyta", "lekarz".',
    explanationRu:
      'Для официальной и бытовой речи естественно звучит "umówić się na wizytę" или "do lekarza".',
    category: 'бытовые ситуации',
  },
  {
    id: 'repeat-slower',
    ruPrompt: 'Не могли бы вы повторить медленнее?',
    register: 'formal',
    acceptedAnswers: [
      answer('Czy mógłby pan/pani powtórzyć wolniej', 'formal'),
      answer('Czy mogłaby pani powtórzyć wolniej', 'formal'),
      answer('Czy mógłby pan powtórzyć wolniej', 'formal'),
    ],
    hintRu: 'Вежливая форма: "Czy mógłby pan/pani...?".',
    explanationRu:
      'Для экзамена полезна конструкция с "czy mógłby pan/pani" и наречием "wolniej".',
    category: 'экзаменационные фразы',
  },
  {
    id: 'bill-request',
    ruPrompt: 'Мне нужен счет, пожалуйста.',
    register: 'neutral',
    acceptedAnswers: [answer('Poproszę rachunek', 'neutral'), answer('Czy mogę prosić o rachunek', 'neutral')],
    hintRu: 'В ресторане часто говорят "Poproszę rachunek".',
    explanationRu:
      'В польском разговоре "rachunek" — это счет, а вежливая форма звучит очень естественно.',
    category: 'бытовые ситуации',
  },
  {
    id: 'disagree-opinion',
    ruPrompt: 'Я не согласен с этим мнением.',
    register: 'neutral',
    acceptedAnswers: [answer('Nie zgadzam się z tą opinią', 'neutral')],
    hintRu: 'Глагол: "zgadzać się" = соглашаться.',
    explanationRu:
      'Нужна конструкция с "nie zgadzam się z..." — это базовая B1 модель для дискуссии.',
    category: 'экзаменационные фразы',
  },
  {
    id: 'busy-now',
    ruPrompt: 'В данный момент я занят.',
    register: 'neutral',
    acceptedAnswers: [answer('W tej chwili jestem zajęty', 'neutral'), answer('W tym momencie jestem zajęty', 'neutral')],
    hintRu: 'Полезные варианты: "w tej chwili" и "w tym momencie".',
    explanationRu:
      'Фраза звучит естественно и пригодится в диалогах, когда нужно вежливо отказать.',
    category: 'бытовые ситуации',
  },
  {
    id: 'filled-form',
    ruPrompt: 'Я заполнил форму.',
    register: 'neutral',
    acceptedAnswers: [answer('Wypełniłem formularz', 'neutral'), answer('Wypełniłam formularz', 'neutral')],
    hintRu: 'Глагол "wypełnić" = заполнить.',
    explanationRu:
      'Для документов и анкет это один из самых частых глаголов в экзаменационных задачах.',
    category: 'глаголы и аспект',
  },
  {
    id: 'important-to-arrive',
    ruPrompt: 'Мне важно успеть вовремя.',
    register: 'neutral',
    acceptedAnswers: [answer('Zależy mi na tym, żeby zdążyć na czas', 'neutral')],
    hintRu: 'Конструкция "zależy mi na tym, żeby..." очень полезна на B1.',
    explanationRu:
      'Это готовая модель для выражения личной важности и цели. В польском она звучит естественно.',
    category: 'грамматические модели',
  },
  {
    id: 'take-part-course',
    ruPrompt: 'Я хотел бы принять участие в курсе.',
    register: 'formal',
    acceptedAnswers: [answer('Chciałbym wziąć udział w kursie', 'formal'), answer('Chciałabym wziąć udział w kursie', 'formal')],
    hintRu: 'Сочетание: "wziąć udział".',
    explanationRu:
      'Фраза "wziąć udział w..." часто встречается в формальных и полузнакомых ситуациях.',
    category: 'экзаменационные фразы',
  },
  {
    id: 'depends-on-situation',
    ruPrompt: 'Это зависит от ситуации.',
    register: 'neutral',
    acceptedAnswers: [answer('To zależy od sytuacji', 'neutral')],
    hintRu: 'Стабильная модель: "zależy od".',
    explanationRu:
      'Для ответа в диалоге это одна из самых частых B1 конструкций.',
    category: 'грамматические модели',
  },
  {
    id: 'cancel-meeting',
    ruPrompt: 'Я должен отменить встречу.',
    register: 'neutral',
    acceptedAnswers: [answer('Muszę odwołać spotkanie', 'neutral'), answer('Muszę odwołać wizytę', 'neutral')],
    hintRu: 'Глагол "odwołać" = отменить.',
    explanationRu:
      'Подходит для работы, учёбы и бытовых дел. Можно говорить о встрече или визите.',
    category: 'бытовые ситуации',
  },
  {
    id: 'wait-minute',
    ruPrompt: 'Пожалуйста, подождите минуту.',
    register: 'formal',
    acceptedAnswers: [answer('Proszę poczekać minutę', 'formal')],
    hintRu: 'Побудительная форма: "proszę poczekać".',
    explanationRu:
      'Короткая и вежливая форма, которая помогает на экзамене в разговорном блоке.',
    category: 'экзаменационные фразы',
  },
  {
    id: 'write-if-questions',
    ruPrompt: 'Если есть вопросы, пишите мне.',
    register: 'formal',
    acceptedAnswers: [
      answer('Jeśli mają Państwo pytania, proszę pisać do mnie', 'formal'),
      answer('Jeśli masz pytania, napisz do mnie', 'informal'),
    ],
    hintRu: 'Начало: "Jeśli..."',
    explanationRu:
      'Это удобная модель для переписки, email и учебных ситуаций.',
    category: 'экзаменационные фразы',
  },
  {
    id: 'search-job',
    ruPrompt: 'Я ищу работу.',
    register: 'neutral',
    acceptedAnswers: [answer('Szukam pracy', 'neutral')],
    hintRu: 'Очень частая и простая B1 фраза.',
    explanationRu:
      'Используется в объявлениях, интервью и разговорах о планах.',
    category: 'бытовые ситуации',
  },
  {
    id: 'go-home-pedestrian',
    ruPrompt: 'Я возвращаюсь домой пешком.',
    register: 'neutral',
    acceptedAnswers: [answer('Wracam do domu pieszo', 'neutral')],
    hintRu: 'Наречие: "pieszo" = пешком.',
    explanationRu:
      'Полезно для описания повседневного маршрута и транспорта.',
    category: 'бытовые ситуации',
  },
  {
    id: 'draw-attention',
    ruPrompt: 'Я обратил внимание на ошибку.',
    register: 'neutral',
    acceptedAnswers: [answer('Zwróciłem uwagę na błąd', 'neutral'), answer('Zwróciłam uwagę na błąd', 'neutral')],
    hintRu: 'Глагол "zwrócić uwagę" = обратить внимание.',
    explanationRu:
      'Одна из самых полезных коллокаций для чтения, письма и устных замечаний.',
    category: 'грамматические модели',
  },
  {
    id: 'mean-other-date',
    ruPrompt: 'Я имею в виду другой срок.',
    register: 'neutral',
    acceptedAnswers: [answer('Mam na myśli inny termin', 'neutral')],
    hintRu: 'Фраза "mam na myśli" = я имею в виду.',
    explanationRu:
      'Хорошая модель для уточнения мысли и исправления недопонимания.',
    category: 'экзаменационные фразы',
  },
  {
    id: 'false-friend-actual',
    ruPrompt: 'Это важная информация.',
    register: 'neutral',
    acceptedAnswers: [answer('To ważna informacja', 'neutral'), answer('To istotna informacja', 'neutral')],
    hintRu: 'Ложный друг: польское "aktualny" значит "текущий", а не "важный".',
    explanationRu:
      'Не переводите русское "актуальный" как "aktualny" в значении "важный". Лучше: "ważny" или "istotny".',
    category: 'ложные друзья',
  },
  {
    id: 'submit-application',
    ruPrompt: 'Мне нужно подать заявление в офисе.',
    register: 'neutral',
    acceptedAnswers: [answer('Muszę złożyć wniosek w urzędzie', 'neutral'), answer('Muszę złożyć podanie w urzędzie', 'neutral')],
    hintRu: 'В официальном стиле: "złożyć wniosek".',
    explanationRu:
      'Слово "urząd" и модель "złożyć wniosek" очень часто встречаются в реальной жизни.',
    category: 'экзаменационные фразы',
  },
  {
    id: 'late-bus',
    ruPrompt: 'Я опаздываю на автобус.',
    register: 'neutral',
    acceptedAnswers: [answer('Spóźniam się na autobus', 'neutral')],
    hintRu: 'Глагол "spóźniać się" = опаздывать.',
    explanationRu:
      'Базовая ситуация из повседневной жизни и транспорта.',
    category: 'бытовые ситуации',
  },
  {
    id: 'ticket-return',
    ruPrompt: 'Мне нужно купить билет туда и обратно.',
    register: 'neutral',
    acceptedAnswers: [answer('Muszę kupić bilet tam i z powrotem', 'neutral'), answer('Muszę kupić bilet w obie strony', 'neutral')],
    hintRu: 'Второй вариант: "w obie strony".',
    explanationRu:
      'Полезно для вокзала, кассы и телефонных разговоров.',
    category: 'бытовые ситуации',
  },
  {
    id: 'pay-by-card',
    ruPrompt: 'Можно ли оплатить картой?',
    register: 'neutral',
    acceptedAnswers: [answer('Czy można zapłacić kartą', 'neutral')],
    hintRu: 'Глагол "zapłacić" = заплатить.',
    explanationRu:
      'Очень практичная фраза для магазинов и сервисов.',
    category: 'бытовые ситуации',
  },
  {
    id: 'no-sense',
    ruPrompt: 'Я не вижу смысла в этом.',
    register: 'neutral',
    acceptedAnswers: [answer('Nie widzę sensu w tym', 'neutral')],
    hintRu: 'Конструкция "nie widzę sensu w...".',
    explanationRu:
      'Помогает выразить несогласие в спокойной форме.',
    category: 'экзаменационные фразы',
  },
  {
    id: 'take-into-account',
    ruPrompt: 'Я должен учитывать цену.',
    register: 'neutral',
    acceptedAnswers: [answer('Muszę wziąć pod uwagę cenę', 'neutral')],
    hintRu: 'Устойчивая фраза: "wziąć pod uwagę".',
    explanationRu:
      'Это хороший B1 шаблон для объяснения решения или выбора.',
    category: 'грамматические модели',
  },
  {
    id: 'when-ready',
    ruPrompt: 'Когда это будет готово?',
    register: 'neutral',
    acceptedAnswers: [answer('Kiedy to będzie gotowe', 'neutral')],
    hintRu: 'Простой вопрос, но очень полезный в экзамене и в жизни.',
    explanationRu:
      'Подходит для сервисов, документов, ремонта и учебных задач.',
    category: 'бытовые ситуации',
  },
]
