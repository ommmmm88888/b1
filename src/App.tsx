import { useState } from 'react'
import { GrammarDrillScreen } from './features/grammar/GrammarDrillScreen'
import { IntensivePlanScreen } from './features/plan/IntensivePlanScreen'
import { TrainerScreen } from './features/trainer/TrainerScreen'
import './App.css'

type AppMode = 'trainer' | 'intensive' | 'grammar'

function App() {
  const [mode, setMode] = useState<AppMode>('trainer')

  return (
    <>
      <header className="mode-switch">
        <div className="mode-switch__inner">
          <button
            className={`mode-switch__button ${mode === 'trainer' ? 'mode-switch__button--active' : ''}`}
            type="button"
            onClick={() => setMode('trainer')}
            aria-pressed={mode === 'trainer'}
          >
            Тренировка
          </button>
          <button
            className={`mode-switch__button ${mode === 'intensive' ? 'mode-switch__button--active' : ''}`}
            type="button"
            onClick={() => setMode('intensive')}
            aria-pressed={mode === 'intensive'}
          >
            Интенсив
          </button>
          <button
            className={`mode-switch__button ${mode === 'grammar' ? 'mode-switch__button--active' : ''}`}
            type="button"
            onClick={() => setMode('grammar')}
            aria-pressed={mode === 'grammar'}
          >
            Грамматика
          </button>
        </div>
      </header>
      {mode === 'trainer' ? <TrainerScreen /> : null}
      {mode === 'intensive' ? <IntensivePlanScreen /> : null}
      {mode === 'grammar' ? <GrammarDrillScreen /> : null}
    </>
  )
}

export default App
