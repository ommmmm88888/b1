import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { WritingPracticeScreen } from './WritingPracticeScreen'

describe('WritingPracticeScreen', () => {
  beforeEach(() => {
    cleanup()
    window.localStorage.clear()
  })

  it('shows the writing editor as the main actionable area', async () => {
    const user = userEvent.setup()

    render(<WritingPracticeScreen />)

    const editor = screen.getByLabelText('Ваш текст на польском')

    expect(screen.getByRole('heading', { name: 'Пишите ответ сразу здесь' })).toBeInTheDocument()
    expect(editor).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Сохранить черновик' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Проверьте перед финальным вариантом' })).toBeInTheDocument()

    await user.type(editor, 'Dzien dobry, pisze w sprawie kursu B1.')

    expect(editor).toHaveValue('Dzien dobry, pisze w sprawie kursu B1.')
  })
})
