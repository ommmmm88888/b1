import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { grammarB1Handbook } from '../../data/grammarB1'
import { GrammarB1Screen } from './GrammarB1Screen'

describe('GrammarB1Screen', () => {
  beforeEach(() => {
    cleanup()
    window.localStorage.clear()
  })

  it('renders the handbook from data and keeps answers hidden until reveal', async () => {
    const user = userEvent.setup()
    render(<GrammarB1Screen />)

    expect(screen.getByRole('heading', { name: 'Справочник польского B1' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Быстрый повтор' })).toBeInTheDocument()

    for (const topic of grammarB1Handbook.readyTopics) {
      expect(screen.getByRole('heading', { name: topic.title })).toBeInTheDocument()
      expect(screen.getByText(topic.mainRule)).toBeInTheDocument()
    }

    expect(screen.getByText('Mam problem z mieszkaniem.')).toBeInTheDocument()
    expect(screen.getByText('Szukam pracy.')).toBeInTheDocument()
    expect(screen.getByText('Byłem w urzędzie.')).toBeInTheDocument()
    expect(screen.getByText('Robiłem zadanie.')).toBeInTheDocument()
    expect(screen.getByText('Czekam na autobus.')).toBeInTheDocument()

    for (const topic of grammarB1Handbook.soonTopics) {
      expect(screen.getByText(topic.examplePhrase.pl)).toBeInTheDocument()
      expect(screen.getByText(topic.examplePhrase.ru)).toBeInTheDocument()
    }

    expect(screen.getAllByText('Когда это нужно').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Главное правило').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Запомнить быстро').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Частая ошибка').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Правильно по-польски').length).toBeGreaterThan(0)
    expect(screen.getAllByText('На экзамене пригодится').length).toBeGreaterThan(0)

    expect(screen.queryByText('Нужно:')).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Показать ответ' }).length).toBeGreaterThan(0)

    await user.click(screen.getAllByRole('button', { name: 'Показать ответ' })[0])

    expect(screen.getAllByText('Нужно:').length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: 'Скрыть ответ' }).length).toBeGreaterThan(0)
  })

  it('keeps handbook data internally complete', () => {
    expect(grammarB1Handbook.readyTopics.every((topic) => topic.correctExamples.length > 0)).toBe(true)
    expect(grammarB1Handbook.readyTopics.every((topic) => topic.miniTest.length > 0)).toBe(true)
    expect(grammarB1Handbook.soonTopics.every((topic) => Boolean(topic.examplePhrase.pl))).toBe(true)
  })
})
