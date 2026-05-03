import type { GrammarB1ReadyTopic, GrammarB1SoonTopic } from '../types/grammarB1'
import { normalizePhrase } from './howToSayMatcher'

export type GrammarB1Filter = 'all' | 'ready' | 'soon' | 'cases' | 'verbs' | 'writing' | 'speaking'

type HandbookTopic = GrammarB1ReadyTopic | GrammarB1SoonTopic

function joinSearchableParts(topic: HandbookTopic): string {
  if (topic.status === 'ready') {
    return [
      topic.title,
      topic.shortTitle ?? '',
      topic.quickUseCase.join(' '),
      topic.mainRule,
      topic.memoryHint,
      topic.typicalMistake,
      topic.correctExamples.map((example) => `${example.pl} ${example.ru}`).join(' '),
      topic.examUsefulPhrases.map((phrase) => `${phrase.pl} ${phrase.ru ?? ''} ${phrase.note ?? ''}`).join(' '),
      topic.miniTest.map((item) => `${item.prompt} ${item.answer} ${item.explanation ?? ''}`).join(' '),
      topic.tags.join(' '),
    ]
      .filter(Boolean)
      .join(' ')
  }

  return [
    topic.title,
    topic.whyItMatters,
    topic.helpsWith,
    topic.examplePhrase.pl,
    topic.examplePhrase.ru,
    topic.tags.join(' '),
  ]
    .filter(Boolean)
    .join(' ')
}

export function matchesHandbookTopicSearch(topic: HandbookTopic, query: string): boolean {
  const normalizedQuery = normalizePhrase(query)
  if (!normalizedQuery) {
    return true
  }

  const normalizedHaystack = normalizePhrase(joinSearchableParts(topic))
  return normalizedHaystack.includes(normalizedQuery) || normalizedQuery.includes(normalizedHaystack)
}

export function topicMatchesFilter(topic: HandbookTopic, filter: GrammarB1Filter): boolean {
  if (filter === 'all') {
    return true
  }

  if (filter === 'ready' || filter === 'soon') {
    return topic.status === filter
  }

  return topic.tags.includes(filter)
}

export function filterHandbookTopics<T extends HandbookTopic>(
  topics: T[],
  query: string,
  filter: GrammarB1Filter,
): T[] {
  return topics.filter((topic) => matchesHandbookTopicSearch(topic, query) && topicMatchesFilter(topic, filter))
}
