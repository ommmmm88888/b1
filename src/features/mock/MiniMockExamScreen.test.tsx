import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { MiniMockExamScreen } from './MiniMockExamScreen'

describe('MiniMockExamScreen', () => {
  beforeEach(() => {
    cleanup()
    window.localStorage.clear()
  })

  it('keeps compact progress and finish controls available while the exam is active', async () => {
    const user = userEvent.setup()

    render(<MiniMockExamScreen />)

    await user.click(screen.getByRole('button', { name: 'Начать мини-мок' }))

    const stickyProgress = screen.getByRole('region', { name: 'Прогресс мини-мока' })

    expect(stickyProgress).toBeInTheDocument()
    expect(stickyProgress).toHaveTextContent('Объективные:')
    expect(stickyProgress).toHaveTextContent('0/24')
    expect(stickyProgress).toHaveTextContent('Всего отмечено:')
    expect(stickyProgress).toHaveTextContent('0/35')
    expect(stickyProgress).toHaveTextContent('Осталось:')
    expect(stickyProgress).toHaveTextContent('35')
    expect(screen.getByRole('button', { name: 'Завершить' })).toBeInTheDocument()
  })
})
