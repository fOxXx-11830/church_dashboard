import React, { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useAdmin } from '../AdminContext'

// ─── 상수 및 유틸리티 ──────────────────────────────────────
const DAY_KO = ['주일', '월', '화', '수', '목', '금', '토']

const NEWS_CATEGORIES = {
  notice: { label: '안내', style: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  event: { label: '행사', style: 'bg-blue-100 text-blue-700 border-blue-200' },
  pastor: { label: '목사동정', style: 'bg-orange-100 text-orange-700 border-orange-200' },
  prayer: { label: '기도', style: 'bg-stone-100 text-stone-600 border-stone-200' },
  birthday: { label: '생일', style: 'bg-pink-100 text-pink-700 border-pink-200' },
}

function formatDateTime(date) {
  const year    = date.getFullYear()
  const month   = date.getMonth() + 1
  const day     = date.getDate()
  const dayName = DAY_KO[date.getDay()]
  const h24     = date.getHours()
  const ampm    = h24 < 12 ? '오전' : '오후'
  const h12     = String(h24 % 12 || 12).padStart(2, '0')
  const min     = String(date.getMinutes()).padStart(2, '0')
  const sec     = String(date.getSeconds()).padStart(2, '0')
  return {
    dateStr: `${year}년 ${month}월 ${day}일 (${dayName})`,
    timeStr: `${ampm} ${h12}:${min}:${sec}`,
  }
}

// (기존 PinModal 관련 코드 제거)

// ─── 실시간 시계 컴포넌트 ──────────────────────────────────
function LiveClock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const { dateStr, timeStr } = formatDateTime(now)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 px-8 py-10 text-center select-none relative overflow-hidden">
      <p className="text-xs font-semibold text-stone-400 tracking-[0.25em] uppercase mb-4">현재 시각</p>
      <p className="text-5xl md:text-6xl font-light text-slate-700 tracking-widest tabular-nums">{timeStr}</p>
      <p className="text-stone-400 mt-3 text-sm md:text-base tracking-wide">{dateStr}</p>
    </div>
  )
}

// ─── 주간 생일자 요약 바 ───────────────────────────────────
function WeeklyBirthdays({ birthdays }) {
  if (!birthdays || birthdays.length === 0) {
    return (
      <div className="bg-pink-50 border border-pink-100 rounded-xl px-5 py-4 flex items-center justify-center gap-2">
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
    <div className="bg-gradient-to-r from-pink-100 to-rose-100 border border-pink-200 rounded-xl px-5 py-4 flex items-center gap-3 shadow-sm">
      <span className="text-xl animate-bounce">🎉</span>
      <p className="text-sm font-bold text-pink-700">
        금주의 생일자: <span className="font-medium">{birthdayText}</span>
      </p>
    </div>
  )
}

// ─── 말씀 및 소식 폼 모달들 ─────────────────────────────────
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
      const { error } = await supabase.from('weekly_verses').insert([{ content, reference }])
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">금주의 암송 말씀 등록</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">말씀 본문</label>
            <textarea required rows={3} value={content} onChange={(e) => setContent(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none resize-none" placeholder="여호와는 나의 목자시니..."></textarea>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">출처 (성경구절)</label>
            <input required type="text" value={reference} onChange={(e) => setReference(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none" placeholder="예: 시편 23:1" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50">취소</button>
            <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 disabled:opacity-50">저장</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function NewsFormModal({ isOpen, onClose, onSaved, editData }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('notice')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setTitle(editData?.title || '')
      setCategory(editData?.category || 'notice')
    }
  }, [isOpen, editData])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = { title, category }
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
    if (!window.confirm('정말 삭제하시겠습니까?')) return
    try {
      const { error } = await supabase.from('church_news').delete().eq('id', editData.id)
      if (error) throw error
      onSaved()
      onClose()
    } catch (err) {
      console.error('소식 삭제 오류:', err)
      alert(`삭제 중 오류가 발생했습니다: ${err.message}`)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">{editData ? '소식 수정' : '소식 등록'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">카테고리</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none">
              {Object.entries(NEWS_CATEGORIES).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">제목</label>
            <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none" placeholder="소식 내용을 입력하세요" />
          </div>
          <div className="flex justify-between items-center pt-2">
            {editData ? (
              <button type="button" onClick={handleDelete} className="px-4 py-2.5 rounded-lg border border-rose-200 text-rose-500 text-sm font-medium hover:bg-rose-50">삭제</button>
            ) : <div />}
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50">취소</button>
              <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 disabled:opacity-50">저장</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── 메인 탭 (통합) ─────────────────────────────────────────
function MainTab() {
  const { isAdmin } = useAdmin()
  const [verse, setVerse] = useState({ content: '여호와는 나의 목자시니 내게 부족함이 없으리로다', reference: '시편 23:1' })
  const [birthdays, setBirthdays] = useState([])
  const [news, setNews] = useState([])

  // 모달 제어 상태
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
        if (a.category === 'birthday' && b.category !== 'birthday') return -1
        if (a.category !== 'birthday' && b.category === 'birthday') return 1
        return 0
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
    <div className="space-y-8">
      {/* 1. 주간 생일자 요약 (이번 주) */}
      <WeeklyBirthdays birthdays={birthdays} />

      {/* 2. 실시간 시계 */}
      <LiveClock />

      {/* 3. 금주의 암송 말씀 */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg border border-stone-200 group"
        style={{ background: 'linear-gradient(135deg, #fdfcf9 0%, #f5f0e6 45%, #ede8db 100%)' }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-300 rounded-l-2xl" />
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #c4a052 0%, transparent 70%)' }} />
        <div className="absolute -bottom-10 -left-4 w-36 h-36 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #a07840 0%, transparent 70%)' }} />

        <div className="px-8 py-10 md:px-12 md:py-12 relative">
          <div className="flex items-center justify-between mb-6">
            <span className="inline-flex items-center gap-1.5 bg-amber-600/10 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full tracking-widest border border-amber-400/30">
              ✦ 금주의 암송 말씀
            </span>
            {isAdmin && (
              <button 
                onClick={() => setVerseModal({ isOpen: true, initialData: verse })}
                className="p-2 rounded-full text-amber-600 hover:bg-amber-100 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="말씀 수정"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
            )}
          </div>

          <div className="text-5xl text-amber-400/60 font-serif leading-none mb-2 select-none">"</div>
          <blockquote className="text-xl md:text-2xl text-slate-700 leading-[1.85] tracking-wide max-w-2xl font-serif whitespace-pre-wrap">
            {verse.content}
          </blockquote>
          <div className="flex items-end justify-between mt-5">
            <div className="text-5xl text-amber-400/60 font-serif leading-none select-none self-end">"</div>
            <div className="text-right">
              <p className="text-amber-700 font-semibold text-sm tracking-widest">— {verse.reference} —</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. 교회 소식 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-700 flex items-center gap-2.5">
            <span className="w-1 h-5 bg-amber-500 rounded-full inline-block" />
            교회 소식
          </h2>
          {isAdmin && (
            <button 
              onClick={() => setNewsModal({ isOpen: true, editData: null })}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors flex items-center gap-1"
            >
              <span>+</span> 소식 추가
            </button>
          )}
        </div>
        
        {news.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 p-8 text-center text-stone-400 text-sm">
            등록된 교회 소식이 없습니다.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden flex flex-col max-h-[400px]">
            <div className="overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent">
              {news.map((item) => {
                const cat = NEWS_CATEGORIES[item.category] || NEWS_CATEGORIES.notice
                const d = new Date(item.created_at)
                const dateStr = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`
                
                return (
                  <div
                    key={item.id}
                    onClick={() => { if (isAdmin) setNewsModal({ isOpen: true, editData: item }) }}
                    className={`px-4 py-3 rounded-lg flex flex-col sm:flex-row sm:items-center gap-3 transition-colors group ${isAdmin ? 'hover:bg-stone-50 cursor-pointer' : ''}`}
                  >
                    <div className="flex items-center gap-3 flex-1 overflow-hidden">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded border shrink-0 ${cat.style}`}>
                        {cat.label}
                      </span>
                      <span className="text-slate-700 font-medium group-hover:text-amber-600 transition-colors truncate">
                        {item.category === 'birthday' ? `🎉 ${item.title}` : item.title}
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

      {/* 모달 */}
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
