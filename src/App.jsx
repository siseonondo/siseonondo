import { useState } from 'react'
import './App.css'
import { AuthProvider, useAuth } from './auth/AuthContext.jsx'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import TodayPage from './pages/TodayPage.jsx'
import EmotionPage from './pages/EmotionPage.jsx'
import CalendarPage from './pages/CalendarPage.jsx'
import TasksPage from './pages/TasksPage.jsx'
import RecordsPage from './pages/RecordsPage.jsx'
import QuotesPage from './pages/QuotesPage.jsx'
import { useTasks } from './firestore/tasks.js'
import { useEmotions } from './firestore/emotions.js'
import { useCondition } from './firestore/condition.js'
import { useQuotes } from './firestore/quotes.js'

function Workspace() {
  const { user } = useAuth()
  const [tab, setTab] = useState('today')
  const { condition, setCondition } = useCondition(user)
  const { tasks, toggleTask, setTaskDate, updateTaskNote } = useTasks(user)
  const { emotions, addEmotion, canSave } = useEmotions(user)
  const { saved, toggleSave, updateNote } = useQuotes(user)

  return (
    <div className="workspace">
      <Sidebar activeTab={tab} onSelectTab={setTab} condition={condition} />
      <div className="workspace-main">
        <Header activeTab={tab} />
        <main className="workspace-content">
          {tab === 'today' && (
            <TodayPage
              condition={condition}
              onSelectCondition={setCondition}
              tasks={tasks}
              onToggleTask={toggleTask}
              emotions={emotions}
              onGoEmotion={() => setTab('emotion')}
              onGoQuotes={() => setTab('quotes')}
            />
          )}
          {tab === 'emotion' && (
            <EmotionPage emotions={emotions} onSave={addEmotion} canSave={canSave} />
          )}
          {tab === 'calendar' && <CalendarPage />}
          {tab === 'tasks' && (
            <TasksPage
              tasks={tasks}
              onToggleTask={toggleTask}
              onSetDate={setTaskDate}
              onNoteChange={updateTaskNote}
            />
          )}
          {tab === 'records' && <RecordsPage emotions={emotions} tasks={tasks} />}
          {tab === 'quotes' && (
            <QuotesPage saved={saved} onToggleSave={toggleSave} onUpdateNote={updateNote} />
          )}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Workspace />
    </AuthProvider>
  )
}
