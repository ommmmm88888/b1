import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { SpeakingPracticeScreen } from './SpeakingPracticeScreen'

describe('SpeakingPracticeScreen', () => {
  beforeEach(() => {
    cleanup()
    window.localStorage.clear()
  })

  it('keeps prompt, timer, plan and self-check controls visible in one compact flow', async () => {
    const user = userEvent.setup()

    render(<SpeakingPracticeScreen />)

    expect(screen.getByRole('heading', { name: 'Задание' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Подготовка · 0:30' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Ответ из трёх частей' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'После ответа' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '90 сек ответ' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Отметить как выполнено' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '90 сек ответ' }))

    expect(screen.getByRole('heading', { name: 'Ответ · 1:30' })).toBeInTheDocument()
  })
})
