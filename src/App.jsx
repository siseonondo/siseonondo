import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import { AuthProvider, useAuth } from './auth/AuthContext.jsx'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import LandingPage from './pages/LandingPage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import BooksPage from './pages/BooksPage.jsx'
import BookDetailPage from './pages/BookDetailPage.jsx'
import WritingsPage from './pages/WritingsPage.jsx'
import WritingDetailPage from './pages/WritingDetailPage.jsx'
import ProgramsPage from './pages/ProgramsPage.jsx'
import ProgramDetailPage from './pages/ProgramDetailPage.jsx'
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
import { PATH_BY_KEY, ROUTES } from './routes.js'

const TOOL_PATHS = ROUTES.map((r) => r.path)

function Workspace() {
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const { condition, setCondition } = useCondition(user)
  const { tasks, toggleTask, setTaskDate, updateTaskNote } = useTasks(user)
  const { emotions, addEmotion, canSave } = useEmotions(user)
  const { saved, toggleSave, updateNote } = useQuotes(user)
  const navigate = useNavigate()
  const location = useLocation()

  const isToolPath = TOOL_PATHS.some(
    (p) => location.pathname === p || location.pathname.startsWith(p + '/')
  )

  if (!isToolPath) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/books" element={<BooksPage />} />
        <Route path="/books/:slug" element={<BookDetailPage />} />
        <Route path="/writings" element={<WritingsPage />} />
        <Route path="/writings/:slug" element={<WritingDetailPage />} />
        <Route path="/programs" element={<ProgramsPage />} />
        <Route path="/programs/:slug" element={<ProgramDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
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
