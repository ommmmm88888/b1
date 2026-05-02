import { useState } from 'react'
import { GrammarB1Screen } from './features/grammar-b1/GrammarB1Screen'
import { GrammarDrillScreen } from './features/grammar/GrammarDrillScreen'
import { IntensivePlanScreen } from './features/plan/IntensivePlanScreen'
import { ListeningPracticeScreen } from './features/listening/ListeningPracticeScreen'
import { MiniMockExamScreen } from './features/mock/MiniMockExamScreen'
import { ReadingPracticeScreen } from './features/reading/ReadingPracticeScreen'
import { SpeakingPracticeScreen } from './features/speaking/SpeakingPracticeScreen'
import { AccountSyncControl } from './features/sync/AccountSyncControl'
import { TrainerScreen } from './features/trainer/TrainerScreen'
import { WritingPracticeScreen } from './features/writing/WritingPracticeScreen'
import './App.css'

type AppMode =
  | 'trainer'
  | 'intensive'
  | 'grammar'
  | 'grammar-b1'
  | 'writing'
  | 'speaking'
  | 'reading'
  | 'listening'
  | 'mock'

const modes: { id: AppMode; label: string }[] = [
  { id: 'trainer', label: 'Тренировка' },
  { id: 'intensive', label: 'Интенсив' },
  { id: 'grammar', label: 'Грамматика' },
  { id: 'writing', label: 'Письмо' },
  { id: 'speaking', label: 'Говорение' },
  { id: 'reading', label: 'Чтение' },
  { id: 'listening', label: 'Аудирование' },
  { id: 'mock', label: 'Пробный экзамен' },
  { id: 'grammar-b1', label: 'Справочник' },
]

function App() {
  const [mode, setMode] = useState<AppMode>('trainer')

  return (
    <>
      <header className="mode-switch">
        <div className="mode-switch__bar">
          <div className="mode-switch__brand" aria-label="B1">
            B1
          </div>
          <nav className="mode-switch__inner" aria-label="Основные разделы">
            {modes.map((item) => (
              <button
                className={`mode-switch__button ${mode === item.id ? 'mode-switch__button--active' : ''}`}
                type="button"
                key={item.id}
                onClick={() => setMode(item.id)}
                aria-pressed={mode === item.id}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <AccountSyncControl />
        </div>
      </header>
      <div>
        {mode === 'trainer' ? <TrainerScreen /> : null}
        {mode === 'intensive' ? <IntensivePlanScreen /> : null}
        {mode === 'grammar' ? <GrammarDrillScreen /> : null}
        {mode === 'grammar-b1' ? <GrammarB1Screen /> : null}
        {mode === 'writing' ? <WritingPracticeScreen /> : null}
        {mode === 'speaking' ? <SpeakingPracticeScreen /> : null}
        {mode === 'reading' ? <ReadingPracticeScreen /> : null}
        {mode === 'listening' ? <ListeningPracticeScreen /> : null}
        {mode === 'mock' ? <MiniMockExamScreen /> : null}
      </div>
    </>
  )
}

export default App
