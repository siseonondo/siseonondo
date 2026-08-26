import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import { AuthProvider, useAuth } from './auth/AuthContext.jsx'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import LandingPage from './pages/LandingPage.jsx'
import TodayPage from './pages/TodayPage.jsx'
import EmotionPage from './pages/EmotionPage.jsx'
import CalendarPage from './pages/CalendarPage.jsx'
import TasksPage from './pages/TasksPage.jsx'
import RecordsPage from './pages/RecordsPage.jsx'
import QuotesPage from './pages/QuotesPage.jsx'
import PauseChoosePage from './pages/PauseChoosePage.jsx'
import { useTasks } from './firestore/tasks.js'
import { useEmotions } from './firestore/emotions.js'
import { useCondition } from './firestore/condition.js'
import { useQuotes } from './firestore/quotes.js'
import { PATH_BY_KEY } from './routes.js'

function Workspace() {
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const { condition, setCondition } = useCondition(user)
  const { tasks, toggleTask, setTaskDate, updateTaskNote } = useTasks(user)
  const { emotions, addEmotion, canSave } = useEmotions(user)
  const { saved, toggleSave, updateNote } = useQuotes(user)
  const navigate = useNavigate()
  const location = useLocation()

  if (location.pathname === '/') {
    return <LandingPage />
  }

  return (
    <div className="workspace">
      <Sidebar condition={condition} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="workspace-main">
        <Header onMenuToggle={() => setMenuOpen((v) => !v)} />
        <main className="workspace-content">
          <Routes>
            <Route
              path="/today"
              element={
                <TodayPage
                  condition={condition}
                  onSelectCondition={setCondition}
                  tasks={tasks}
                  onToggleTask={toggleTask}
                  emotions={emotions}
                  onGoEmotion={() => navigate('/emotion')}
                  onGoQuotes={() => navigate('/quotes')}
                  onGoPauseChoose={() => navigate('/pause-and-choose')}
                />
              }
            />
            <Route
              path="/emotion"
              element={<EmotionPage emotions={emotions} onSave={addEmotion} canSave={canSave} />}
            />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route
              path="/tasks"
              element={
                <TasksPage
                  tasks={tasks}
                  onToggleTask={toggleTask}
                  onSetDate={setTaskDate}
                  onNoteChange={updateTaskNote}
                />
              }
            />
            <Route path="/flow" element={<RecordsPage emotions={emotions} tasks={tasks} />} />
            <Route
              path="/quotes"
              element={<QuotesPage saved={saved} onToggleSave={toggleSave} onUpdateNote={updateNote} />}
            />
            <Route
              path="/pause-and-choose"
              element={<PauseChoosePage onNavigate={(key) => navigate(PATH_BY_KEY[key] || '/today')} />}
            />
            <Route path="*" element={<Navigate to="/today" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Workspace />
      </BrowserRouter>
    </AuthProvider>
  )
}
