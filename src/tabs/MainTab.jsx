import React, { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useAdmin } from '../AdminContext'
import DOMPurify from 'dompurify'

// ─── Constants & Utilities ──────────────────────────────────────
const DAY_KO = ['주일', '월', '화', '수', '목', '금', '토']

const NEWS_CATEGORIES = {
  birthday: { label: '생일', style: 'bg-pink-100 text-pink-700 border-pink-200', priority: 0 },
  notice: { label: '안내', style: 'bg-yellow-100 text-yellow-700 border-yellow-200', priority: 1 },
  event: { label: '행사', style: 'bg-sky-100 text-sky-700 border-sky-200', priority: 2 },
  pastor: { label: '목사 동정', style: 'bg-orange-100 text-orange-700 border-orange-200', priority: 3 },
  prayer: { label: '기도', style: 'bg-stone-100 text-stone-600 border-stone-200', priority: 4 },
}

function formatDateTime(date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const dayName = DAY_KO[date.getDay()]
  const h24 = date.getHours()
  const ampm = h24 < 12 ? '오전' : '오후'
  const h12 = String(h24 % 12 || 12).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  const sec = String(date.getSeconds()).padStart(2, '0')
  return {
    dateStr: `${year}년 ${month}월 ${day}일 (${dayName})`,
    timeStr: `${ampm} ${h12}:${min}:${sec}`,
  }
}

// ─── Real-time Clock Component ──────────────────────────────────
function LiveClock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const { dateStr, timeStr } = formatDateTime(now)

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-sky-100 px-6 py-8 md:px-8 md:py-10 text-center select-none relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-sky-500 to-sky-400" />
      
      <p className="text-xs font-semibold text-sky-600 tracking-[0.25em] uppercase mb-4">현재 시각</p>
      <p className="text-4xl md:text-5xl lg:text-6xl font-light text-slate-700 tracking-widest tabular-nums font-mono">
        {timeStr}
      </p>
      <p className="text-stone-500 mt-3 text-sm md:text-base tracking-wide">{dateStr}</p>
    </div>
  )
}

// ─── Weekly Birthday Summary Bar ───────────────────────────────
function WeeklyBirthdays({ birthdays }) {
  if (!birthdays || birthdays.length === 0) {
    return (
      <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-100 rounded-xl px-5 py-4 flex items-center justify-center gap-2">
        <span className="text-lg">🎂</span>
        <span className="text-sm font-medium text-pink-400">이번 주 생일자가 없습니다.</span>
      </div>
    )
  }

  const birthdayText = birthdays.map(b => {
    const d = new Date(b.start)
    return `${b.title}(${d.getDate()}일)`
  }).join(', ')

  return (
    <div className="bg-gradient-to-r from-pink-100 via-rose-100 to-pink-100 border border-pink-200 rounded-xl px-5 py-4 flex items-center gap-3 shadow-sm overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
      <span className="text-2xl animate-bounce relative z-10">🎉</span>
      <p className="text-sm font-bold text-pink-700 relative z-10">
        금주의 생일자: <span className="font-medium">{birthdayText}</span>
      </p>
    </div>
  )
}

// ─── Verse Form Modal ─────────────────────────────────────────
function VerseFormModal({ isOpen, onClose, onSaved, initialData }) {
  const [content, setContent] = useState('')
  const [reference, setReference] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setContent(initialData?.content || '')
      setReference(initialData?.reference || '')
    }
  }, [isOpen, initialData])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const cleanContent = DOMPurify.sanitize(content)
      const cleanRef = DOMPurify.sanitize(reference)
      const { error } = await supabase.from('weekly_verses').insert([{ content: cleanContent, reference: cleanRef }])
      if (error) throw error
      onSaved()
      onClose()
    } catch (err) {
      alert('저장 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-sky-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">✦</span>
          금주의 암송 말씀 등록
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">말씀 본문</label>
            <textarea required rows={4} value={content} onChange={(e) => setContent(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:outline-none resize-none" placeholder="여호와는 나의 목자시니..." style={{ fontFamily: '"Noto Serif KR", Georgia, serif' }}></textarea>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">출처 (성경구절)</label>
            <input required type="text" value={reference} onChange={(e) => setReference(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:outline-none" placeholder="예: 시편 23:1" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50">취소</button>
            <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 disabled:opacity-50">저장</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── News Form Modal ─────────────────────────────────────────
function NewsFormModal({ isOpen, onClose, onSaved, editData }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('notice')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (isOpen) {
      setTitle(editData?.title || '')
      setCategory(editData?.category || 'notice')
      setErrorMsg('')
    }
  }, [isOpen, editData])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const cleanTitle = DOMPurify.sanitize(title)
      const payload = { title: cleanTitle, category }
      if (editData) {
        await supabase.from('church_news').update(payload).eq('id', editData.id)
      } else {
        await supabase.from('church_news').insert([payload])
      }
      onSaved()
      onClose()
    } catch (err) {
      alert('저장 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setErrorMsg('')
    try {
      const { data, error } = await supabase.from('church_news').delete().eq('id', editData.id).select()
      if (error) throw error
      if (!data || data.length === 0) {
        throw new Error('Supabase RLS 설정을 꺼주세요! (권한 없음)')
      }
      onSaved()
      onClose()
    } catch (err) {
      console.error('소식 삭제 오류:', err)
      setErrorMsg(`삭제 오류: ${err.message}`)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-sky-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">{editData ? '소식 수정' : '소식 등록'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">카테고리</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:outline-none">
              {Object.entries(NEWS_CATEGORIES).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">제목</label>
            <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:outline-none" placeholder="소식 내용을 입력하세요" />
          </div>
          {errorMsg && (
            <div className="p-3 bg-rose-100 text-rose-700 rounded-lg text-sm font-medium">
              {errorMsg}
            </div>
          )}
          <div className="flex justify-between items-center pt-2">
            {editData ? (
              <button type="button" onClick={handleDelete} className="px-4 py-2.5 rounded-lg border border-rose-200 text-rose-500 text-sm font-medium hover:bg-rose-50">삭제</button>
            ) : <div />}
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50">취소</button>
              <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 disabled:opacity-50">저장</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main Tab Component ─────────────────────────────────────────
function MainTab() {
  const { isAdmin } = useAdmin()
  const [verse, setVerse] = useState({ content: '여호와는 나의 목자시니 내게 부족함이 없으리로다', reference: '시편 23:1' })
  const [birthdays, setBirthdays] = useState([])
  const [news, setNews] = useState([])

  const [verseModal, setVerseModal] = useState({ isOpen: false, initialData: null })
  const [newsModal, setNewsModal] = useState({ isOpen: false, editData: null })

  const fetchVerse = async () => {
    const { data } = await supabase.from('weekly_verses').select('*').order('created_at', { ascending: false }).limit(1).single()
    if (data) setVerse(data)
  }

  const fetchBirthdays = async () => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - dayOfWeek)
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    const { data } = await supabase
      .from('church_events')
      .select('*')
      .eq('category', 'birthday')
      .gte('start', startOfWeek.toISOString())
      .lte('start', endOfWeek.toISOString())
      .order('start', { ascending: true })

    if (data) setBirthdays(data)
  }

  const fetchNews = async () => {
    const { data } = await supabase.from('church_news').select('*').order('created_at', { ascending: false })
    if (data) {
      const sorted = [...data].sort((a, b) => {
        const priorityA = NEWS_CATEGORIES[a.category]?.priority ?? 99
        const priorityB = NEWS_CATEGORIES[b.category]?.priority ?? 99
        return priorityA - priorityB
      })
      setNews(sorted)
    }
  }

  const loadAllData = () => {
    fetchVerse()
    fetchBirthdays()
    fetchNews()
  }

  useEffect(() => {
    loadAllData()
  }, [])

  return (
    <div className="space-y-6">
      {/* 1. Weekly Birthday Summary */}
      <WeeklyBirthdays birthdays={birthdays} />

      {/* 2. Real-time Clock */}
      <LiveClock />

      {/* 3. Weekly Memory Verse - Hero Section */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg group"
        style={{ 
          background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 30%, #fde68a 70%, #fcd34d 100%)'
        }}
      >
        {/* Left accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-sky-500 via-sky-600 to-sky-500" />
        
        {/* Decorative elements */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-20 bg-gradient-to-br from-amber-400 to-orange-300" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-15 bg-gradient-to-tr from-amber-500 to-yellow-400" />

        <div className="px-8 py-10 md:px-12 md:py-14 relative">
          <div className="flex items-center justify-between mb-6">
            <span className="inline-flex items-center gap-2 bg-amber-700/10 text-amber-800 text-xs font-bold px-4 py-2 rounded-full tracking-wider border border-amber-400/30 shadow-sm">
              <span className="text-amber-600">✦</span>
              금주의 암송 말씀
            </span>
            {isAdmin && (
              <button 
                onClick={() => setVerseModal({ isOpen: true, initialData: verse })}
                className="p-2 rounded-full text-amber-700 hover:bg-amber-200/50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="말씀 수정"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
            )}
          </div>

          <div className="text-5xl text-amber-500/50 leading-none mb-2 select-none" style={{ fontFamily: 'Georgia, serif' }}>"</div>
          <blockquote 
            className="text-xl md:text-2xl lg:text-3xl text-slate-800 leading-[1.9] tracking-wide max-w-3xl whitespace-pre-wrap"
            style={{ fontFamily: '"Noto Serif KR", Georgia, serif' }}
          >
            {DOMPurify.sanitize(verse.content)}
          </blockquote>
          <div className="flex items-end justify-between mt-6">
            <div className="text-5xl text-amber-500/50 leading-none select-none self-end" style={{ fontFamily: 'Georgia, serif' }}>"</div>
            <div className="text-right">
              <p className="text-amber-800 font-semibold text-sm tracking-widest">— {DOMPurify.sanitize(verse.reference)} —</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Church News */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-700 flex items-center gap-2.5">
            <span className="w-1 h-5 bg-sky-500 rounded-full inline-block" />
            교회 소식
          </h2>
          {isAdmin && (
            <button 
              onClick={() => setNewsModal({ isOpen: true, editData: null })}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-sky-200 text-sky-600 hover:bg-sky-50 transition-colors flex items-center gap-1"
            >
              <span>+</span> 소식 추가
            </button>
          )}
        </div>
        
        {news.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-sky-100 p-8 text-center text-stone-400 text-sm">
            등록된 교회 소식이 없습니다.
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-sky-100 shadow-sm overflow-hidden flex flex-col max-h-[400px]">
            <div className="overflow-y-auto p-2 space-y-1 scrollbar-thin">
              {news.map((item) => {
                const cat = NEWS_CATEGORIES[item.category] || NEWS_CATEGORIES.notice
                const d = new Date(item.created_at)
                const dateStr = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`
                
                return (
                  <div
                    key={item.id}
                    onClick={() => { if (isAdmin) setNewsModal({ isOpen: true, editData: item }) }}
                    className={`px-4 py-3 rounded-lg flex flex-col sm:flex-row sm:items-center gap-3 transition-colors group ${isAdmin ? 'hover:bg-sky-50 cursor-pointer' : ''}`}
                  >
                    <div className="flex items-center gap-3 flex-1 overflow-hidden">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${cat.style}`}>
                        {cat.label}
                      </span>
                      <span className="text-slate-700 font-medium group-hover:text-sky-600 transition-colors truncate">
                        {item.category === 'birthday' ? `🎉 ${DOMPurify.sanitize(item.title)}` : DOMPurify.sanitize(item.title)}
                      </span>
                    </div>
                    <span className="text-xs text-stone-400 shrink-0 font-medium tracking-wide sm:text-right">
                      {dateStr}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <VerseFormModal
        isOpen={verseModal.isOpen}
        initialData={verseModal.initialData}
        onClose={() => setVerseModal({ isOpen: false, initialData: null })}
        onSaved={fetchVerse}
      />
      <NewsFormModal
        isOpen={newsModal.isOpen}
        editData={newsModal.editData}
        onClose={() => setNewsModal({ isOpen: false, editData: null })}
        onSaved={fetchNews}
      />
    </div>
  )
}

export default MainTab
