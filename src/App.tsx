import { useState } from 'react'
import { GrammarDrillScreen } from './features/grammar/GrammarDrillScreen'
import { IntensivePlanScreen } from './features/plan/IntensivePlanScreen'
import { SpeakingPracticeScreen } from './features/speaking/SpeakingPracticeScreen'
import { TrainerScreen } from './features/trainer/TrainerScreen'
import { WritingPracticeScreen } from './features/writing/WritingPracticeScreen'
import './App.css'

type AppMode = 'trainer' | 'intensive' | 'grammar' | 'writing' | 'speaking'

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
          <button
            className={`mode-switch__button ${mode === 'writing' ? 'mode-switch__button--active' : ''}`}
            type="button"
            onClick={() => setMode('writing')}
            aria-pressed={mode === 'writing'}
          >
            Письмо
          </button>
          <button
            className={`mode-switch__button ${mode === 'speaking' ? 'mode-switch__button--active' : ''}`}
            type="button"
            onClick={() => setMode('speaking')}
            aria-pressed={mode === 'speaking'}
          >
            Говорение
          </button>
        </div>
      </header>
      {mode === 'trainer' ? <TrainerScreen /> : null}
      {mode === 'intensive' ? <IntensivePlanScreen /> : null}
      {mode === 'grammar' ? <GrammarDrillScreen /> : null}
      {mode === 'writing' ? <WritingPracticeScreen /> : null}
      {mode === 'speaking' ? <SpeakingPracticeScreen /> : null}
    </>
  )
}

export default App
