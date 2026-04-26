import { useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import MainTab from './tabs/MainTab'
import BibleTab from './tabs/BibleTab'
import QnATab from './tabs/QnATab'
import ScheduleTab from './tabs/ScheduleTab'
import { AdminProvider, useAdmin } from './AdminContext'

export const TABS = [
  { id: 'main',     label: '메인',       icon: '🏠' },
  { id: 'bible',    label: '성경읽기',   icon: '📖' },
  { id: 'qna',      label: '질문과 답변', icon: '💬' },
  { id: 'schedule', label: '교회일정',   icon: '📅' },
]

function GlobalPinModal({ isOpen, onClose }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const { setIsAdmin } = useAdmin()

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    // 환경 변수에서 PIN 번호를 가져와 검증 (기본값 설정 가능)
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
        <h3 className="text-lg font-bold text-slate-800 mb-2">관리자 모드</h3>
        <p className="text-sm text-stone-500 mb-5">관리자 PIN을 입력하세요.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            maxLength={4}
            value={pin}
            onChange={(e) => { setPin(e.target.value.replace(/[^0-9]/g, '')); setError('') }}
            placeholder="4자리 숫자"
            className="w-full text-center tracking-widest text-xl px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
            autoFocus
          />
          {error && <p className="text-xs text-rose-500 font-medium text-center">{error}</p>}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-medium hover:bg-stone-50 transition-colors">취소</button>
            <button type="submit" disabled={pin.length < 4} className="flex-1 py-2.5 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors">확인</button>
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
    <div className="min-h-screen flex flex-col font-sans bg-gradient-to-br from-[#eaf4f8] via-[#fbf7da] to-[#efe6d5]">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} tabs={TABS} />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {renderContent()}
      </main>
      <Footer onAdminLoginClick={() => setPinModalOpen(true)} />



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
