import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('App navigation', () => {
  beforeEach(() => {
    cleanup()
    vi.resetModules()
    vi.unstubAllEnvs()
    window.localStorage.clear()
  })

  it('renders accessible navigation with an obvious active section', async () => {
    const user = userEvent.setup()
    vi.stubEnv('VITE_FIREBASE_API_KEY', '')
    vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', '')
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', '')
    vi.stubEnv('VITE_FIREBASE_APP_ID', '')
    const { default: App } = await import('./App')

    render(<App />)

    const primaryNav = screen.getByRole('navigation', { name: 'Основные разделы' })
    const header = screen.getByRole('banner')
    expect(within(header).getByLabelText('B1')).toBeInTheDocument()
    expect(within(header).getByRole('button', { name: 'Google вход' })).toBeInTheDocument()
    expect(within(header).getByText('не настроено')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Тренировка' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(primaryNav).getAllByRole('button').at(-1)).toHaveTextContent('Справочник')
    expect(screen.queryByRole('button', { name: 'Грамматика B1' })).not.toBeInTheDocument()

    await user.click(within(header).getByRole('button', { name: 'Google вход' }))

    expect(
      within(header).getByText(/Синхронизация между устройствами появится после настройки Firebase\./),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Справочник' }))

    expect(screen.getByRole('button', { name: 'Справочник' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('heading', { name: 'Справочник польского B1' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Что повторить быстро' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Падежи без паники' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Пробный экзамен' }))

    expect(screen.getByRole('button', { name: 'Пробный экзамен' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('heading', { name: 'Пробный мини-экзамен' })).toBeInTheDocument()
  })
})
