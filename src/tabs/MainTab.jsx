import React, { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useAdmin } from '../AdminContext'
import DOMPurify from 'dompurify'
import { Clock, PartyPopper, Cake, BookOpen, Calendar, Edit3, PlusCircle } from 'lucide-react'

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
    <div className="flex flex-col items-center justify-center py-10 mb-8 bg-gradient-to-b from-white/60 to-white/90 rounded-[2rem] border border-[#eaddb1]/60 shadow-sm relative overflow-hidden backdrop-blur-sm">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#8cc4d8] via-[#eaddb1] to-[#c0a080]" />
      <p className="text-[#a18c73] text-sm md:text-base font-semibold tracking-widest mb-3">{dateStr}</p>
      <div className="flex items-center gap-4">
        <Clock className="w-8 h-8 md:w-10 md:h-10 text-[#8cc4d8]" />
        <time className="text-6xl md:text-7xl lg:text-8xl font-light text-[#5c4d3c] tracking-wider tabular-nums drop-shadow-sm">
          {timeStr}
        </time>
      </div>
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
    <div className="mb-8 overflow-hidden rounded-xl bg-pink-50 border border-pink-100 shadow-sm">
      <div className="w-full h-1 bg-gradient-to-r from-pink-400 to-rose-400" />
      <div className="flex items-center justify-center gap-3 py-3.5 px-4">
        <PartyPopper className="w-5 h-5 text-pink-700 shrink-0" />
        <p className="text-pink-800 font-medium text-sm md:text-base">
          🎉 금주의 생일자: <span className="font-bold">{birthdayText}</span>
        </p>
        <Cake className="w-5 h-5 text-pink-700 shrink-0 hidden md:block" />
      </div>
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
    // 카카오톡 인앱 브라우저 등에서 window.confirm이 무시되는 현상을 막기 위해 삭제
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

      {/* 3. 금주의 암송 말씀 (HeroBanner) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#b59e84]/10 to-[#8cc4d8]/10 py-12 px-6 rounded-[2rem] mb-8 group border border-[#eaddb1]/50">
        <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(ellipse at 50% 120%, #c0a080 0%, transparent 60%)" }} />
        <div className="relative py-10 md:py-14 px-6 md:px-10 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-5 py-2 rounded-full border border-[#eaddb1] shadow-sm">
              <BookOpen className="w-4 h-4 text-[#8a7258]" />
              <span className="text-sm font-bold text-[#8a7258]">금주의 암송 말씀</span>
            </div>
            {isAdmin && (
              <button 
                onClick={() => setVerseModal({ isOpen: true, initialData: verse })}
                className="ml-3 p-1.5 rounded-full text-slate-500 hover:bg-slate-200 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="말씀 수정"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
          </div>
          <blockquote className="font-serif text-2xl md:text-3xl lg:text-4xl leading-relaxed max-w-2xl mx-auto mb-6 text-[#5c4d3c] text-balance whitespace-pre-wrap">
            &quot;{DOMPurify.sanitize(verse.content)}&quot;
          </blockquote>
          <cite className="text-[#a18c73] text-base md:text-lg font-semibold not-italic">
            — {DOMPurify.sanitize(verse.reference)} —
          </cite>
        </div>
      </section>

      {/* 4. 교회 소식 (NewsFeed) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-3">
          <h2 className="text-xl font-bold text-[#5c4d3c] tracking-tight">교회 소식</h2>
          {isAdmin && (
            <button 
              onClick={() => setNewsModal({ isOpen: true, editData: null })}
              className="text-xs font-semibold px-4 py-2 rounded-full border border-[#eaddb1] bg-white text-[#8a7258] hover:bg-[#fbf7da] transition-colors flex items-center gap-1 shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" /> 소식 추가
            </button>
          )}
        </div>
        
        {news.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 p-8 text-center text-stone-400 text-sm">
            등록된 교회 소식이 없습니다.
          </div>
        ) : (
          <div className="grid gap-4">
            {news.map((item) => {
              const cat = NEWS_CATEGORIES[item.category] || NEWS_CATEGORIES.notice
              const d = new Date(item.created_at)
              const dateStr = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`
              
              return (
                <div
                  key={item.id}
                  onClick={() => { if (isAdmin) setNewsModal({ isOpen: true, editData: item }) }}
                  className={`group relative bg-white border border-stone-200 rounded-xl p-5 hover:shadow-md transition-all duration-200 ${isAdmin ? 'cursor-pointer hover:border-slate-300' : ''}`}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${cat.style}`}>
                        {cat.label}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-stone-500">
                        <Calendar className="w-3 h-3" />
                        {dateStr}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-800 group-hover:text-amber-600 transition-colors line-clamp-1">
                        {item.category === 'birthday' ? `🎉 ${DOMPurify.sanitize(item.title)}` : DOMPurify.sanitize(item.title)}
                      </h3>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

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
