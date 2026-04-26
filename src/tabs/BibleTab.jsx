import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'
import { useAdmin } from '../AdminContext'

// ─── 유틸: 유튜브 ID 추출 ────────────────────────────────
function getYouTubeID(url) {
  if (!url) return null
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

// ─── 관리자 등록/수정 폼 ──────────────────────────────────
// ... (이하 AdminForm 코드는 그대로 유지)
function AdminForm({ onAddSuccess, editData, onCancelEdit }) {
  const [day, setDay] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [content, setContent] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  // editData가 들어오면 폼 채우고 열기
  useEffect(() => {
    if (editData) {
      setDay(editData.day.toString())
      setSubtitle(editData.subtitle || '')
      setContent(editData.content || '')
      setYoutubeUrl(editData.youtube_url || '')
      setIsOpen(true)
    } else {
      setDay('')
      setSubtitle('')
      setContent('')
      setYoutubeUrl('')
    }
  }, [editData])

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
        // 수정 (Update)
        const { error } = await supabase
          .from('daily_readings')
          .update(payload)
          .eq('id', editData.id)
        if (error) throw error
      } else {
        // 등록 (Insert)
        const { error } = await supabase
          .from('daily_readings')
          .insert([payload])
        if (error) throw error
      }

      // 초기화
      setDay('')
      setSubtitle('')
      setContent('')
      setYoutubeUrl('')
      setIsOpen(false)
      if (onAddSuccess) onAddSuccess()
      if (editData && onCancelEdit) onCancelEdit()
    } catch (err) {
      console.error('저장 오류:', err)
      setError('저장 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (editData && onCancelEdit) {
      onCancelEdit()
    } else {
      setIsOpen(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden mt-10 transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <span className="text-lg">⚙️</span>
          {editData ? '관리자 모드: 성경읽기 수정' : '관리자 모드: 성경읽기 등록'}
        </span>
        <span className="text-slate-400">{isOpen ? '닫기 ▾' : '열기 ▸'}</span>
      </button>

      {isOpen && (
        <form onSubmit={handleSubmit} className="p-6 border-t border-stone-200 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">일차 (숫자)</label>
              <input
                type="number"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                placeholder="예: 1"
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">부제목</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="예: 마음에 근심하지 말라"
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">유튜브 URL</label>
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="예: https://www.youtube.com/watch?v=..."
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">본문 및 강해 내용</label>
            <textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="말씀 본문과 강해 내용을 적어주세요..."
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none resize-none"
            />
          </div>

          {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            {editData && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2.5 rounded-lg border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50 transition-colors"
              >
                취소
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {submitting ? '저장 중...' : editData ? '수정 완료' : '말씀 등록하기'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

// ─── 메인 뷰어 컴포넌트 ──────────────────────────────────
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
      ([entry]) => {
        setIsFloating(!entry.isIntersecting)
      },
      { threshold: 0 }
    )

    if (observerRef.current) observer.observe(observerRef.current)
    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current)
    }
  }, [])

  // 플로팅 모드가 풀리면 위치 및 상태 초기화
  useEffect(() => {
    if (!isFloating) {
      setPosition({ x: 0, y: 0 })
      setPipClosed(false)
    }
  }, [isFloating])

  // --- 드래그 로직 (이동) ---
  const handlePointerDown = (e) => {
    if (!isFloating || pipClosed) return
    setIsDragging(true)
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e) => {
    if (!isDragging) return
    let newX = e.clientX - dragStart.current.x
    let newY = e.clientY - dragStart.current.y

    // 화면 바깥으로 나가지 않도록 제약 (Constraints)
    const pipHeight = pipWidth * (9 / 16) + 28 // 28 = 상단 핸들바 높이
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

  // --- 리사이즈 로직 (크기 조절) ---
  const handleResizeDown = (e) => {
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    isResizing.current = true
    resizeStart.current = { x: e.clientX, width: pipWidth }
  }

  const handleResizeMove = (e) => {
    if (!isResizing.current) return
    // 좌측 하단 핸들이므로 왼쪽으로 마우스를 끌면(clientX 감소) 너비 증가
    const deltaX = resizeStart.current.x - e.clientX
    let newWidth = resizeStart.current.width + deltaX

    const minW = 200
    // 우측 기준 고정이므로 좌측 화면 바깥으로 넘어가지 않도록 최대 너비 제한
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
      <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-400">
        <p className="text-2xl mb-2">📖</p>
        <p className="text-sm">등록된 성경읽기 데이터가 없습니다.</p>
      </div>
    )
  }

  const videoId = getYouTubeID(reading.youtube_url)

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col relative">
      {/* 윗부분: 유튜브 영상 (최상단 배치 & PiP 스크롤 감지) */}
      <div className="w-full bg-slate-900 border-b border-stone-200">
        <div ref={observerRef} className="relative w-full aspect-video mx-auto max-w-4xl">
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
                      touchAction: 'none', // 드래그 중 화면 스크롤 방지
                      transition: isDragging || isResizing.current ? 'none' : 'width 0.1s ease-out',
                    }
                  : { transform: 'none' }
              }
            >
              {/* 드래그 핸들바 및 닫기 버튼 (플로팅 상태에서만 보임) */}
              <div
                className={`w-full bg-slate-800 flex items-center justify-between cursor-move shrink-0 px-2 select-none ${
                  isFloating && !pipClosed ? 'h-7 opacity-100' : 'h-0 opacity-0 hidden'
                }`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                <div className="w-6" /> {/* 가운데 정렬용 여백 */}
                <div className="w-10 h-1.5 bg-slate-500 rounded-full" />
                <button
                  onClick={(e) => { e.stopPropagation(); setPipClosed(true); }}
                  onPointerDown={(e) => e.stopPropagation()} // 클릭 시 드래그 방지
                  className="w-6 h-6 flex items-center justify-center text-stone-400 hover:text-white rounded hover:bg-slate-700 transition-colors"
                  title="플로팅 영상 닫기"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>

              {/* 실제 영상 영역 */}
              <div className={`relative w-full ${isFloating && !pipClosed ? 'aspect-video' : 'h-full'}`}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full pointer-events-auto"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                
                {/* 크기 조절(리사이즈) 핸들 - 좌측 하단에 배치 */}
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
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
              <span className="text-3xl mb-2">🎞️</span>
              <span className="text-xs">유튜브 영상이 없습니다</span>
            </div>
          )}
        </div>
      </div>

      {/* 아랫부분: 내용 영역 */}
      <div className="w-full p-6 md:p-8 flex flex-col">
        <div className="mb-6 border-b border-stone-100 pb-4">
          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full mb-3">
            제 {reading.day} 일차
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-snug">
            {reading.subtitle}
          </h2>
        </div>

        <div className="w-full">
          <p className="text-slate-600 text-sm md:text-base leading-loose whitespace-pre-wrap font-serif tracking-wide">
            {reading.content}
          </p>
        </div>
      </div>
    </div>
  )
}

// (기존 PinModal 관련 코드 제거)

// ─── 성경읽기 탭 메인 ────────────────────────────────────
function BibleTab() {
  const { isAdmin } = useAdmin()
  const [readings, setReadings] = useState([])
  const [selectedReading, setSelectedReading] = useState(null)
  const [loading, setLoading] = useState(true)

  // 관리 기능 상태
  const [openMenuId, setOpenMenuId] = useState(null) // 어떤 항목의 메뉴가 열려있는지
  const [editingItem, setEditingItem] = useState(null)

  const fetchReadings = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('daily_readings')
        .select('*')
        .order('day', { ascending: false })

      if (error) throw error

      setReadings(data || [])
      // 현재 선택된 아이템이 삭제되었거나 없으면 가장 최신으로 세팅
      if (data && data.length > 0) {
        if (!selectedReading || !data.find(r => r.id === selectedReading.id)) {
          setSelectedReading(data[0])
        } else {
          // 내용이 갱신되었을 수 있으므로 업데이트
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 삭제 실행
  const handleDelete = async (id) => {
    if (!window.confirm('정말 이 말씀을 삭제하시겠습니까?')) return
    try {
      const { data, error } = await supabase.from('daily_readings').delete().eq('id', id).select()
      if (error) throw error
      if (!data || data.length === 0) {
        throw new Error('권한이 없거나 이미 삭제된 항목입니다. (Supabase RLS 설정을 확인해주세요)')
      }
      fetchReadings() // 목록 새로고침
    } catch (err) {
      console.error('삭제 오류:', err)
      alert(`삭제 중 오류가 발생했습니다: ${err.message}`)
    }
  }

  const handleEditClick = (item) => {
    setEditingItem(item)
    setOpenMenuId(null)
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    }, 100)
  }

  return (
    <div className="space-y-8">
      {/* 타이틀 영역 */}
      <div>
        <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2">
          <span className="text-amber-500">📖</span> 매일 성경읽기
        </h2>
        <p className="text-stone-400 text-sm mt-1">말씀과 함께하는 은혜로운 하루</p>
      </div>

      {loading ? (
        <div className="h-64 bg-white rounded-2xl border border-stone-200 animate-pulse" />
      ) : (
        <>
          {/* 메인 뷰어 */}
          <MainViewer reading={selectedReading} />

          {/* 지난 말씀 리스트 */}
          {readings.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-slate-400 rounded-full inline-block" />
                성경읽기 목록
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {readings.map((item) => (
                  <div
                    key={item.id}
                    className={`relative flex items-stretch rounded-xl border transition-all duration-200 overflow-hidden ${
                      selectedReading?.id === item.id
                        ? 'border-amber-400 bg-amber-50 shadow-sm ring-1 ring-amber-400'
                        : 'border-stone-200 bg-white hover:border-amber-300'
                    }`}
                  >
                    {/* 카드 본문 (클릭 시 뷰어 변경) */}
                    <button
                      onClick={() => setSelectedReading(item)}
                      className="flex-1 text-left px-4 py-3 focus:outline-none"
                    >
                      <span className="block text-xs font-bold text-amber-600 mb-1">
                        {item.day}일차
                      </span>
                      <span className="block text-sm font-medium text-slate-700 truncate pr-6">
                        {item.subtitle}
                      </span>
                    </button>

                    {/* 연필 아이콘 / 액션 메뉴 토글 */}
                    {isAdmin && (
                      <div className="absolute top-2 right-2 flex items-center gap-1">
                        {openMenuId === item.id ? (
                          <div className="flex items-center gap-1 bg-white/90 backdrop-blur rounded-lg px-1.5 py-1 shadow-sm border border-stone-200 animate-in fade-in slide-in-from-right-2 duration-200">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEditClick(item); }}
                              className="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                            >
                              수정
                            </button>
                            <div className="w-px h-3 bg-stone-300" />
                            <button
                              onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); handleDelete(item.id); }}
                              className="text-xs text-rose-600 hover:bg-rose-50 px-2 py-1 rounded transition-colors"
                            >
                              삭제
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }}
                              className="ml-1 text-stone-400 hover:text-stone-600"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(item.id); }}
                            className="p-1.5 text-stone-400 hover:text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                            title="관리"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* 관리자 폼 */}
      {isAdmin && (
        <AdminForm 
          onAddSuccess={() => { fetchReadings(); setEditingItem(null); }} 
          editData={editingItem}
          onCancelEdit={() => setEditingItem(null)}
        />
      )}

      {/* 스크롤바 CSS 주입 */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
      `}} />
    </div>
  )
}

export default BibleTab
