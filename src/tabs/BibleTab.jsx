import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'
import { useAdmin } from '../AdminContext'

// ─── YouTube ID Extraction ────────────────────────────────
function getYouTubeID(url) {
  if (!url) return null
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

// ─── Admin Form Modal ──────────────────────────────────────
function AdminFormModal({ isOpen, onClose, onSaved, editData }) {
  const [day, setDay] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [content, setContent] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setDay(editData.day.toString())
        setSubtitle(editData.subtitle || '')
        setContent(editData.content || '')
        setYoutubeUrl(editData.youtube_url || '')
      } else {
        setDay('')
        setSubtitle('')
        setContent('')
        setYoutubeUrl('')
      }
      setError('')
    }
  }, [isOpen, editData])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const dayNum = parseInt(day, 10)
    if (!day || isNaN(dayNum)) { setError('유효한 일차(숫자)를 입력해주세요.'); return }
    if (!subtitle.trim()) { setError('부제목을 입력해주세요.'); return }
    if (!content.trim()) { setError('본문/강해 내용을 입력해주세요.'); return }

    setSubmitting(true)
    try {
      const payload = {
        day: dayNum,
        subtitle: subtitle.trim(),
        content: content.trim(),
        youtube_url: youtubeUrl.trim(),
      }

      if (editData) {
        const { error } = await supabase.from('daily_readings').update(payload).eq('id', editData.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('daily_readings').insert([payload])
        if (error) throw error
      }

      onSaved()
      onClose()
    } catch (err) {
      console.error('저장 오류:', err)
      setError('저장 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 border border-sky-100 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">📖</span>
          {editData ? '성경읽기 수정' : '새 성경읽기 등록'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">일차 (숫자)</label>
              <input type="number" value={day} onChange={(e) => setDay(e.target.value)} placeholder="예: 1" className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">부제목</label>
              <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="예: 마음에 근심하지 말라" className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">유튜브 URL</label>
            <input type="text" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="예: https://www.youtube.com/watch?v=..." className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">본문 및 강해 내용</label>
            <textarea rows={8} value={content} onChange={(e) => setContent(e.target.value)} placeholder="말씀 본문과 강해 내용을 적어주세요..." className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:outline-none resize-none" style={{ fontFamily: '"Noto Serif KR", Georgia, serif' }} />
          </div>
          {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50">취소</button>
            <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 disabled:opacity-50">{submitting ? '저장 중...' : '저장하기'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main Viewer Component ──────────────────────────────────
function MainViewer({ reading }) {
  const [isFloating, setIsFloating] = useState(false)
  const [pipClosed, setPipClosed] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [pipWidth, setPipWidth] = useState(() => Math.min(320, window.innerWidth - 48))
  
  const observerRef = useRef(null)
  const dragStart = useRef({ x: 0, y: 0 })
  const isResizing = useRef(false)
  const resizeStart = useRef({ x: 0, width: 0 })

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { setIsFloating(!entry.isIntersecting) },
      { threshold: 0 }
    )

    if (observerRef.current) observer.observe(observerRef.current)
    return () => { if (observerRef.current) observer.unobserve(observerRef.current) }
  }, [])

  useEffect(() => {
    if (!isFloating) {
      setPosition({ x: 0, y: 0 })
      setPipClosed(false)
    }
  }, [isFloating])

  const handlePointerDown = (e) => {
    if (!isFloating || pipClosed) return
    setIsDragging(true)
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e) => {
    if (!isDragging) return
    let newX = e.clientX - dragStart.current.x
    let newY = e.clientY - dragStart.current.y

    const pipHeight = pipWidth * (9 / 16) + 28
    const maxX = 24
    const minX = -(window.innerWidth - pipWidth - 24)
    const maxY = 24
    const minY = -(window.innerHeight - pipHeight - 24)

    newX = Math.max(minX, Math.min(newX, maxX))
    newY = Math.max(minY, Math.min(newY, maxY))

    setPosition({ x: newX, y: newY })
  }

  const handlePointerUp = (e) => {
    if (!isDragging) return
    setIsDragging(false)
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  const handleResizeDown = (e) => {
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    isResizing.current = true
    resizeStart.current = { x: e.clientX, width: pipWidth }
  }

  const handleResizeMove = (e) => {
    if (!isResizing.current) return
    const deltaX = resizeStart.current.x - e.clientX
    let newWidth = resizeStart.current.width + deltaX

    const minW = 200
    const maxW = Math.min(800, window.innerWidth - 24 + position.x)
    newWidth = Math.max(minW, Math.min(newWidth, maxW))
    setPipWidth(newWidth)
  }

  const handleResizeUp = (e) => {
    isResizing.current = false
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  if (!reading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-sky-100 p-12 text-center text-stone-400">
        <p className="text-3xl mb-2">📖</p>
        <p className="text-sm">등록된 성경읽기 데이터가 없습니다.</p>
      </div>
    )
  }

  const videoId = getYouTubeID(reading.youtube_url)

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-sky-100 shadow-sm overflow-hidden flex flex-col lg:flex-row relative">
      {/* Video Section - Left on PC */}
      <div className="w-full lg:w-[60%] bg-slate-900">
        <div ref={observerRef} className="relative w-full aspect-video">
          {videoId ? (
            <div
              className={
                isFloating && !pipClosed
                  ? "fixed z-50 shadow-2xl rounded-xl overflow-hidden border border-slate-700 bg-slate-900 flex flex-col ring-4 ring-white/10"
                  : "absolute inset-0 w-full h-full"
              }
              style={
                isFloating && !pipClosed
                  ? {
                      bottom: '24px',
                      right: '24px',
                      width: `${pipWidth}px`,
                      transform: `translate(${position.x}px, ${position.y}px)`,
                      touchAction: 'none',
                      transition: isDragging || isResizing.current ? 'none' : 'width 0.1s ease-out',
                    }
                  : { transform: 'none' }
              }
            >
              {/* Floating handle bar */}
              <div
                className={`w-full bg-slate-800 flex items-center justify-between cursor-move shrink-0 px-2 select-none ${isFloating && !pipClosed ? 'h-7 opacity-100' : 'h-0 opacity-0 hidden'}`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                <div className="w-6" />
                <div className="w-10 h-1.5 bg-slate-500 rounded-full" />
                <button
                  onClick={(e) => { e.stopPropagation(); setPipClosed(true); }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="w-6 h-6 flex items-center justify-center text-stone-400 hover:text-white rounded hover:bg-slate-700 transition-colors"
                  title="플로팅 영상 닫기"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>

              <div className={`relative w-full ${isFloating && !pipClosed ? 'aspect-video' : 'h-full'}`}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full pointer-events-auto"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                
                {isFloating && !pipClosed && (
                  <div
                    className="absolute bottom-0 left-0 w-8 h-8 cursor-sw-resize flex items-end justify-start p-1.5 touch-none"
                    onPointerDown={handleResizeDown}
                    onPointerMove={handleResizeMove}
                    onPointerUp={handleResizeUp}
                    onPointerCancel={handleResizeUp}
                    title="크기 조절"
                  >
                    <svg className="w-4 h-4 text-white/70 rotate-90 drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-800">
              <span className="text-4xl mb-2">🎞️</span>
              <span className="text-sm">유튜브 영상이 없습니다</span>
            </div>
          )}
        </div>
      </div>

      {/* Text Section - Right on PC */}
      <div className="w-full lg:w-[40%] p-6 md:p-8 flex flex-col overflow-y-auto max-h-[500px] lg:max-h-none">
        <div className="mb-6 border-b border-sky-100 pb-4">
          <span className="inline-block px-3 py-1 bg-sky-100 text-sky-700 text-xs font-bold rounded-full mb-3">
            제 {reading.day} 일차
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-snug">
            {reading.subtitle}
          </h2>
        </div>

        <div className="w-full flex-1 overflow-y-auto scrollbar-thin">
          <p 
            className="text-slate-600 text-sm md:text-base leading-loose whitespace-pre-wrap tracking-wide"
            style={{ fontFamily: '"Noto Serif KR", Georgia, serif' }}
          >
            {reading.content}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Bible Tab Main ────────────────────────────────────────
function BibleTab() {
  const { isAdmin } = useAdmin()
  const [readings, setReadings] = useState([])
  const [selectedReading, setSelectedReading] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formModal, setFormModal] = useState({ isOpen: false, editData: null })
  const [deleteError, setDeleteError] = useState('')

  const fetchReadings = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('daily_readings').select('*').order('day', { ascending: false })
      if (error) throw error

      setReadings(data || [])
      if (data && data.length > 0) {
        if (!selectedReading || !data.find(r => r.id === selectedReading.id)) {
          setSelectedReading(data[0])
        } else {
          setSelectedReading(data.find(r => r.id === selectedReading.id))
        }
      } else {
        setSelectedReading(null)
      }
    } catch (err) {
      console.error('성경읽기 로딩 오류:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReadings()
  }, [])

  const handleDelete = async (id) => {
    setDeleteError('')
    try {
      const { data, error } = await supabase.from('daily_readings').delete().eq('id', id).select()
      if (error) throw error
      if (!data || data.length === 0) {
        throw new Error('Supabase 대시보드에서 해당 테이블의 RLS를 꺼주세요! (권한 없음)')
      }
      fetchReadings()
    } catch (err) {
      console.error('삭제 오류:', err)
      setDeleteError(`삭제 오류: ${err.message}`)
    }
  }

  return (
    <div className="space-y-8">
      {/* Title Area */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2">
            <span className="text-sky-500">📖</span> 매일 성경읽기
          </h2>
          <p className="text-stone-400 text-sm mt-1">말씀과 함께하는 은혜로운 하루</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setFormModal({ isOpen: true, editData: null })}
            className="text-xs font-semibold px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors flex items-center gap-1.5"
          >
            <span>+</span> 새 말씀 등록
          </button>
        )}
      </div>

      {loading ? (
        <div className="h-64 bg-white/80 rounded-2xl border border-sky-100 animate-pulse" />
      ) : (
        <>
          {deleteError && (
            <div className="p-3 bg-rose-100 text-rose-700 rounded-xl text-sm font-medium mb-4">
              {deleteError}
            </div>
          )}

          {/* Main Viewer */}
          <MainViewer reading={selectedReading} />

          {/* Past Readings List */}
          {readings.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-sky-400 rounded-full inline-block" />
                성경읽기 목록
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {readings.map((item) => (
                  <div
                    key={item.id}
                    className={`relative flex items-stretch rounded-xl border transition-all duration-200 overflow-hidden group ${
                      selectedReading?.id === item.id
                        ? 'border-sky-400 bg-sky-50 shadow-sm ring-1 ring-sky-400'
                        : 'border-sky-100 bg-white/80 hover:border-sky-300'
                    }`}
                  >
                    <button
                      onClick={() => setSelectedReading(item)}
                      className="flex-1 text-left px-4 py-3 focus:outline-none"
                    >
                      <span className="block text-xs font-bold text-sky-600 mb-1">
                        {item.day}일차
                      </span>
                      <span className="block text-sm font-medium text-slate-700 truncate pr-6">
                        {item.subtitle}
                      </span>
                    </button>

                    {isAdmin && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); setFormModal({ isOpen: true, editData: item }); }}
                          className="p-1.5 rounded-lg bg-white/90 text-sky-600 hover:bg-sky-100 transition-colors shadow-sm border border-sky-100"
                          title="수정"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                          className="p-1.5 rounded-lg bg-white/90 text-rose-500 hover:bg-rose-50 transition-colors shadow-sm border border-rose-100"
                          title="삭제"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <AdminFormModal
        isOpen={formModal.isOpen}
        editData={formModal.editData}
        onClose={() => setFormModal({ isOpen: false, editData: null })}
        onSaved={fetchReadings}
      />
    </div>
  )
}

export default BibleTab
