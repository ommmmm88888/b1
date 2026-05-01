import type { WritingTask, WritingTaskType } from '../types/writing'

export const writingTypeLabels: Record<WritingTaskType, string> = {
  email: 'E-mail',
  invitation: 'Приглашение',
  announcement: 'Объявление',
  complaint: 'Жалоба',
  request: 'Просьба',
  opinion: 'Мнение',
}

const defaultSelfCheck = [
  'Все пункты задания раскрыты.',
  'Есть понятное начало и завершение.',
  'Причина или цель текста выражена ясно.',
  'Времена, падежи и предлоги проверены отдельно.',
  'Стиль соответствует ситуации.',
  'Текст держится в пределах 100-150 слов, если это длинное задание.',
]

export const writingTasks: WritingTask[] = [
  {
    id: 'email-change-meeting',
    type: 'email',
    titleRu: 'Перенос встречи',
    promptRu:
      'Напишите e-mail преподавателю. Сообщите, что не можете прийти на встречу, объясните причину, предложите новый срок и вежливо попросите подтверждение.',
    requiredElements: ['обращение', 'причина переноса', 'новый срок', 'просьба подтвердить', 'вежливое завершение'],
    usefulPhrasesPl: ['Szanowna Pani', 'Niestety nie mogę przyjść', 'Czy byłaby możliwość', 'Proszę o potwierdzenie'],
    sampleStructureRu: ['Обращение', 'Короткое объяснение ситуации', 'Конкретное предложение', 'Вежливая просьба', 'Завершение'],
    sampleAnswerPl:
      'Szanowna Pani, niestety nie mogę przyjść na spotkanie w czwartek, ponieważ mam ważną wizytę u lekarza. Czy byłaby możliwość przełożenia spotkania na piątek po południu? Proszę o informację, czy ten termin Pani odpowiada. Z poważaniem, Anna Kowalska',
    selfCheckCriteria: defaultSelfCheck,
    typicalMistakesRu: ['слишком разговорное начало', 'нет конкретного нового срока', 'пропущена просьба о подтверждении'],
  },
  {
    id: 'email-course-question',
    type: 'email',
    titleRu: 'Вопрос о курсе',
    promptRu:
      'Напишите e-mail в языковую школу. Спросите о расписании курса B1, цене, возможности пробного занятия и сроке записи.',
    requiredElements: ['кто пишет', 'вопрос о расписании', 'вопрос о цене', 'пробное занятие', 'срок записи'],
    usefulPhrasesPl: ['Chciałbym zapytać o', 'Ile kosztuje kurs?', 'Czy można wziąć udział', 'Do kiedy można się zapisać?'],
    sampleStructureRu: ['Кто вы и зачем пишете', '3-4 конкретных вопроса', 'Благодарность', 'Подпись'],
    sampleAnswerPl:
      'Dzień dobry, chciałbym zapytać o kurs języka polskiego na poziomie B1. Interesuje mnie harmonogram zajęć oraz cena kursu. Czy można wziąć udział w lekcji próbnej przed zapisaniem się? Proszę też o informację, do kiedy można się zapisać. Z góry dziękuję za odpowiedź.',
    selfCheckCriteria: defaultSelfCheck,
    typicalMistakesRu: ['слишком общий вопрос', 'нет вежливой формулы', 'вопросы написаны хаотично'],
  },
  {
    id: 'invitation-integration',
    type: 'invitation',
    titleRu: 'Встреча для новых сотрудников',
    promptRu:
      'Напишите приглашение для новых сотрудников на интеграционную встречу. Укажите место, время, цель встречи и попросите подтвердить участие.',
    requiredElements: ['кого приглашаете', 'дата и место', 'цель встречи', 'что будет на встрече', 'подтверждение участия'],
    usefulPhrasesPl: ['Serdecznie zapraszamy', 'Spotkanie odbędzie się', 'Celem spotkania jest', 'Prosimy o potwierdzenie udziału'],
    sampleStructureRu: ['Заголовок/обращение', 'Детали встречи', 'Цель', 'Программа', 'Просьба подтвердить'],
    sampleAnswerPl:
      'Serdecznie zapraszamy nowych pracowników na spotkanie integracyjne, które odbędzie się w piątek o godzinie 17.00 w sali konferencyjnej. Celem spotkania jest lepsze poznanie zespołu i omówienie zasad pracy. W programie przewidziano krótką prezentację oraz rozmowę przy kawie. Prosimy o potwierdzenie udziału do środy.',
    selfCheckCriteria: defaultSelfCheck,
    typicalMistakesRu: ['нет точной даты', 'нет цели приглашения', 'слишком неформальный стиль'],
  },
  {
    id: 'invitation-birthday',
    type: 'invitation',
    titleRu: 'Приглашение на день рождения',
    promptRu:
      'Пригласите знакомого на день рождения. Укажите дату, место, что планируется, и попросите сообщить, сможет ли он прийти.',
    requiredElements: ['приглашение', 'дата и место', 'план вечера', 'просьба ответить', 'дружелюбное завершение'],
    usefulPhrasesPl: ['Chciałbym Cię zaprosić', 'Impreza odbędzie się', 'Będzie mi bardzo miło', 'Daj znać'],
    sampleStructureRu: ['Дружеское начало', 'Главная информация', 'Почему стоит прийти', 'Просьба ответить'],
    sampleAnswerPl:
      'Cześć, chciałbym Cię zaprosić na moje urodziny w sobotę o 18.00. Spotykamy się u mnie w domu, a potem planujemy krótki spacer do centrum. Będzie kilka osób z pracy i trochę muzyki. Będzie mi bardzo miło, jeśli przyjdziesz. Daj znać, czy możesz być.',
    selfCheckCriteria: defaultSelfCheck,
    typicalMistakesRu: ['нет просьбы ответить', 'перемешан формальный и дружеский стиль', 'слишком мало деталей'],
  },
  {
    id: 'announcement-work-change',
    type: 'announcement',
    titleRu: 'Изменение организации работы',
    promptRu:
      'Напишите объявление для сотрудников: в офисе меняется график работы. Укажите с какого дня, что меняется, почему и куда обращаться с вопросами.',
    requiredElements: ['дата изменения', 'что меняется', 'причина', 'контакт для вопросов'],
    usefulPhrasesPl: ['Informujemy, że', 'Zmiana obowiązuje od', 'Powodem zmiany jest', 'W razie pytań prosimy o kontakt'],
    sampleStructureRu: ['Краткое сообщение', 'Новые правила', 'Причина', 'Контакт'],
    sampleAnswerPl:
      'Informujemy, że od 1 czerwca zmienia się organizacja pracy biura. Pracownicy będą zaczynać pracę o godzinie 8.00, a kończyć o 16.00. Powodem zmiany jest nowy harmonogram obsługi klientów. W razie pytań prosimy o kontakt z działem administracji.',
    selfCheckCriteria: defaultSelfCheck,
    typicalMistakesRu: ['нет даты вступления', 'нет адресата', 'слишком длинные предложения'],
  },
  {
    id: 'announcement-lost-phone',
    type: 'announcement',
    titleRu: 'Потерян телефон',
    promptRu:
      'Напишите объявление о потерянном телефоне. Опишите предмет, место потери, способ связи и предложите благодарность за помощь.',
    requiredElements: ['что потеряно', 'описание', 'где потеряно', 'контакт', 'благодарность'],
    usefulPhrasesPl: ['Zgubiono', 'Telefon ma czarne etui', 'Uczciwego znalazcę proszę o kontakt', 'Przewidziana nagroda'],
    sampleStructureRu: ['Что случилось', 'Описание предмета', 'Где искать', 'Контакт и благодарность'],
    sampleAnswerPl:
      'Zgubiono telefon marki Samsung w czarnym etui. Telefon prawdopodobnie został zostawiony w autobusie numer 12 albo na przystanku przy dworcu. Uczciwego znalazcę proszę o kontakt pod numerem 500 000 000. Za pomoc przewidziana jest nagroda.',
    selfCheckCriteria: defaultSelfCheck,
    typicalMistakesRu: ['нет точного описания', 'нет контакта', 'слишком разговорное объявление'],
  },
  {
    id: 'complaint-delayed-service',
    type: 'complaint',
    titleRu: 'Услуга выполнена с опозданием',
    promptRu:
      'Напишите жалобу в сервисную фирму. Опишите заказанную услугу, проблему с задержкой, последствия и попросите решение.',
    requiredElements: ['что заказали', 'в чем проблема', 'последствия', 'ожидаемое решение', 'вежливый официальный стиль'],
    usefulPhrasesPl: ['Składam reklamację', 'Usługa została wykonana z opóźnieniem', 'W związku z tym proszę o', 'Oczekuję odpowiedzi'],
    sampleStructureRu: ['Данные услуги', 'Описание проблемы', 'Последствия', 'Требование/просьба', 'Завершение'],
    sampleAnswerPl:
      'Szanowni Państwo, składam reklamację dotyczącą usługi remontowej wykonanej w moim mieszkaniu. Usługa została zakończona trzy dni po ustalonym terminie, przez co musiałem przełożyć inne prace. W związku z tym proszę o częściowy zwrot kosztów albo inną formę rekompensaty. Oczekuję odpowiedzi w ciągu 14 dni.',
    selfCheckCriteria: defaultSelfCheck,
    typicalMistakesRu: ['слишком эмоциональный тон', 'нет конкретного требования', 'нет связи между проблемой и последствиями'],
  },
  {
    id: 'complaint-product',
    type: 'complaint',
    titleRu: 'Неисправный товар',
    promptRu:
      'Напишите жалобу в магазин. Укажите, что купили, когда, какая проблема появилась и что вы хотите получить: ремонт, замену или возврат денег.',
    requiredElements: ['товар и дата покупки', 'описание дефекта', 'ожидаемое решение', 'контакт', 'официальное завершение'],
    usefulPhrasesPl: ['Produkt okazał się wadliwy', 'Kupiłem go dnia', 'Proszę o wymianę', 'Proszę o rozpatrzenie reklamacji'],
    sampleStructureRu: ['Покупка', 'Проблема', 'Ваше ожидание', 'Просьба рассмотреть', 'Подпись'],
    sampleAnswerPl:
      'Dzień dobry, dnia 10 maja kupiłem w Państwa sklepie czajnik elektryczny. Po dwóch dniach produkt przestał działać, mimo że był używany zgodnie z instrukcją. Proszę o wymianę towaru na nowy albo zwrot pieniędzy. Proszę o rozpatrzenie reklamacji i kontakt telefoniczny.',
    selfCheckCriteria: defaultSelfCheck,
    typicalMistakesRu: ['не указана дата покупки', 'нет выбранного решения', 'слишком мало фактов'],
  },
  {
    id: 'request-neighbor',
    type: 'request',
    titleRu: 'Просьба к соседу',
    promptRu:
      'Напишите короткое сообщение соседу. Попросите не шуметь вечером, объясните причину и предложите удобное время для ремонта.',
    requiredElements: ['вежливая просьба', 'причина', 'предложение другого времени', 'дружелюбный тон'],
    usefulPhrasesPl: ['Czy mógłby Pan', 'Bardzo proszę', 'Ponieważ', 'Może lepiej'],
    sampleStructureRu: ['Вежливое начало', 'Просьба', 'Причина', 'Компромисс', 'Спасибо'],
    sampleAnswerPl:
      'Dzień dobry, czy mógłby Pan nie wykonywać głośnych prac po godzinie 20.00? Mam małe dziecko, które wtedy śpi, dlatego hałas jest dla nas dużym problemem. Może lepiej robić remont w sobotę przed południem? Bardzo dziękuję za zrozumienie.',
    selfCheckCriteria: defaultSelfCheck,
    typicalMistakesRu: ['слишком резкий тон', 'нет объяснения причины', 'нет компромиссного предложения'],
  },
  {
    id: 'request-deadline',
    type: 'request',
    titleRu: 'Просьба продлить срок',
    promptRu:
      'Напишите преподавателю просьбу продлить срок сдачи работы. Объясните причину, предложите новый срок и пообещайте отправить работу.',
    requiredElements: ['просьба', 'причина', 'новый срок', 'обещание отправить', 'вежливость'],
    usefulPhrasesPl: ['Zwracam się z prośbą', 'Czy mogę oddać pracę', 'Powodem jest', 'Obiecuję przesłać'],
    sampleStructureRu: ['Обращение', 'Просьба', 'Причина', 'Новый срок', 'Благодарность'],
    sampleAnswerPl:
      'Szanowny Panie, zwracam się z prośbą o przedłużenie terminu oddania pracy. W tym tygodniu miałem problemy zdrowotne i nie mogłem dokończyć tekstu. Czy mogę oddać pracę w poniedziałek rano? Obiecuję przesłać ją najpóźniej do godziny 10.00. Dziękuję za zrozumienie.',
    selfCheckCriteria: defaultSelfCheck,
    typicalMistakesRu: ['нет конкретного нового срока', 'причина звучит неясно', 'не хватает вежливой формулы'],
  },
  {
    id: 'opinion-teamwork',
    type: 'opinion',
    titleRu: 'Командная работа',
    promptRu:
      'Напишите короткое мнение: командная работа лучше индивидуальной или нет? Дайте два аргумента и короткий вывод.',
    requiredElements: ['позиция', 'первый аргумент', 'второй аргумент', 'пример или пояснение', 'вывод'],
    usefulPhrasesPl: ['Moim zdaniem', 'Po pierwsze', 'Po drugie', 'Podsumowując'],
    sampleStructureRu: ['Позиция', 'Аргумент 1', 'Аргумент 2', 'Пример', 'Вывод'],
    sampleAnswerPl:
      'Moim zdaniem praca zespołowa często jest lepsza niż indywidualna. Po pierwsze, kilka osób może szybciej znaleźć rozwiązanie problemu. Po drugie, każdy członek zespołu ma inne doświadczenie. Na przykład w pracy często proszę kolegów o radę i dzięki temu unikam błędów. Podsumowując, zespół daje większe możliwości, jeśli ludzie dobrze się komunikują.',
    selfCheckCriteria: defaultSelfCheck,
    typicalMistakesRu: ['нет четкой позиции', 'аргументы повторяют друг друга', 'нет вывода'],
  },
  {
    id: 'opinion-city-village',
    type: 'opinion',
    titleRu: 'Город или деревня',
    promptRu:
      'Напишите короткий аргументированный текст: где лучше жить, в большом городе или маленьком городе/деревне? Укажите плюсы и минусы.',
    requiredElements: ['позиция', 'плюс выбранного варианта', 'минус', 'пример', 'вывод'],
    usefulPhrasesPl: ['Uważam, że', 'Z jednej strony', 'Z drugiej strony', 'Dlatego wolę'],
    sampleStructureRu: ['Ваш выбор', 'Плюс', 'Минус', 'Личный пример', 'Итог'],
    sampleAnswerPl:
      'Uważam, że lepiej mieszkać w dużym mieście. Z jednej strony jest tam więcej pracy, szkół i lekarzy. Z drugiej strony życie w mieście bywa droższe i bardziej stresujące. Dla mnie ważne jest jednak to, że mogę szybko załatwić sprawy urzędowe i dojechać do pracy. Dlatego wolę mieszkać w mieście, ale odpoczywać poza nim.',
    selfCheckCriteria: defaultSelfCheck,
    typicalMistakesRu: ['нет баланса плюсов и минусов', 'слишком длинные предложения', 'нет связок аргументации'],
  },
]
