import { useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import MainTab from './tabs/MainTab'
import BibleTab from './tabs/BibleTab'
import QnATab from './tabs/QnATab'
import ScheduleTab from './tabs/ScheduleTab'
import { AdminProvider, useAdmin } from './AdminContext'

export const TABS = [
  { id: 'main',     label: '메인',         icon: '🏠' },
  { id: 'bible',    label: '매일 성경',    icon: '📖' },
  { id: 'qna',      label: '목사님께 질문', icon: '💬' },
  { id: 'schedule', label: '교회 일정',    icon: '📅' },
]

function GlobalPinModal({ isOpen, onClose }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const { setIsAdmin } = useAdmin()

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    const adminPin = import.meta.env.VITE_ADMIN_PIN || '2656'
    if (pin === adminPin) {
      setIsAdmin(true)
      setPin('')
      setError('')
      onClose()
    } else {
      setError('비밀번호가 틀렸습니다.')
      setPin('')
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200 border border-sky-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">관리자 모드</h3>
            <p className="text-sm text-stone-500">관리자 PIN을 입력하세요.</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            maxLength={4}
            value={pin}
            onChange={(e) => { setPin(e.target.value.replace(/[^0-9]/g, '')); setError('') }}
            placeholder="4자리 숫자"
            className="w-full text-center tracking-widest text-xl px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:outline-none transition-all"
            autoFocus
          />
          {error && <p className="text-xs text-rose-500 font-medium text-center">{error}</p>}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-medium hover:bg-stone-50 transition-colors">취소</button>
            <button type="submit" disabled={pin.length < 4} className="flex-1 py-2.5 rounded-xl bg-sky-600 text-white font-medium hover:bg-sky-700 disabled:opacity-50 transition-colors">확인</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AppContent() {
  const [activeTab, setActiveTab] = useState('main')
  const { isAdmin, setIsAdmin } = useAdmin()
  const [pinModalOpen, setPinModalOpen] = useState(false)

  const renderContent = () => {
    switch (activeTab) {
      case 'main':     return <MainTab />
      case 'bible':    return <BibleTab />
      case 'qna':      return <QnATab />
      case 'schedule': return <ScheduleTab />
      default:         return <MainTab />
    }
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} tabs={TABS} />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {isAdmin && (
          <div className="mb-6 px-4 py-3 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-sky-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-sky-700">관리자 모드가 활성화되어 있습니다</span>
            </div>
            <button 
              onClick={() => setIsAdmin(false)}
              className="text-xs font-medium text-sky-600 hover:text-sky-800 px-3 py-1.5 rounded-lg hover:bg-sky-100 transition-colors"
            >
              종료하기
            </button>
          </div>
        )}
        {renderContent()}
      </main>
      <Footer onAdminClick={() => setPinModalOpen(true)} />
      <GlobalPinModal isOpen={pinModalOpen} onClose={() => setPinModalOpen(false)} />
    </div>
  )
}

function App() {
  return (
    <AdminProvider>
      <AppContent />
    </AdminProvider>
  )
}

export default App
