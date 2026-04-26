import { useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import MainTab from './tabs/MainTab'
import BibleTab from './tabs/BibleTab'
import QnATab from './tabs/QnATab'
import ScheduleTab from './tabs/ScheduleTab'

export const TABS = [
  { id: 'main',     label: '메인',       icon: '🏠' },
  { id: 'bible',    label: '성경읽기',   icon: '📖' },
  { id: 'qna',      label: '질문과 답변', icon: '💬' },
  { id: 'schedule', label: '교회일정',   icon: '📅' },
]

function App() {
  const [activeTab, setActiveTab] = useState('main')

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
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: '#faf9f7' }}>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} tabs={TABS} />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {renderContent()}
      </main>
      <Footer />
    </div>
  )
}

export default App
