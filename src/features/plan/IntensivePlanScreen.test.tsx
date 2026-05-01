import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { IntensivePlanScreen } from './IntensivePlanScreen'

describe('IntensivePlanScreen', () => {
  beforeEach(() => {
    cleanup()
    window.localStorage.clear()
  })

  it('shows the current 12-day action block first and keeps full details accessible', async () => {
    const user = userEvent.setup()

    render(<IntensivePlanScreen />)

    expect(screen.getByRole('heading', { name: '0% выполнено' })).toBeInTheDocument()
    expect(screen.getByText('Полный план, теория и заметки')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '8 недель' })).not.toBeInTheDocument()

    await user.click(screen.getByText('Полный план, теория и заметки'))

    expect(screen.getAllByText('День 1: Диагностика и карта слабых зон').length).toBeGreaterThan(1)
  })

  it('lets the user toggle a checklist task in the current day', async () => {
    const user = userEvent.setup()

    render(<IntensivePlanScreen />)

    const firstTask = screen.getByRole('checkbox', {
      name: /Сделать короткий B1 мини-мок по 5 зонам./,
    })

    expect(firstTask).not.toBeChecked()

    await user.click(firstTask)

    expect(firstTask).toBeChecked()
    expect(screen.getByRole('heading', { name: '33% выполнено' })).toBeInTheDocument()
  })
})
