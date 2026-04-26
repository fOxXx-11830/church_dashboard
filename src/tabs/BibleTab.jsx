import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

// ─── 유틸: 유튜브 ID 추출 ────────────────────────────────
function getYouTubeID(url) {
  if (!url) return null
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

// ─── 관리자 등록/수정 폼 ──────────────────────────────────
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
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
      {/* 왼쪽: 유튜브 영상 */}
      <div className="w-full md:w-1/2 bg-slate-900 shrink-0">
        <div className="relative w-full h-0 pb-[56.25%] md:pb-[100%] lg:pb-[56.25%]">
          {videoId ? (
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
              <span className="text-3xl mb-2">🎞️</span>
              <span className="text-xs">유튜브 영상이 없습니다</span>
            </div>
          )}
        </div>
      </div>

      {/* 오른쪽: 내용 영역 */}
      <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
        <div className="mb-6 border-b border-stone-100 pb-4">
          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full mb-3">
            제 {reading.day} 일차
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-snug">
            {reading.subtitle}
          </h2>
        </div>

        {/* 스크롤 가능한 본문 영역 */}
        <div className="flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
          <p className="text-slate-600 text-sm md:text-base leading-loose whitespace-pre-wrap font-serif tracking-wide">
            {reading.content}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── 핀 인증 모달 ─────────────────────────────────────────
function PinModal({ isOpen, onClose, onSuccess, actionType }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setPin('')
      setError('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    // 하드코딩된 PIN 번호 검증
    if (pin === '0000') {
      onSuccess()
      onClose()
    } else {
      setError('비밀번호가 틀렸습니다.')
      setPin('')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-2">
            관리자 인증
          </h3>
          <p className="text-sm text-stone-500 mb-5">
            이 항목을 {actionType === 'edit' ? '수정' : '삭제'}하시려면 관리자 PIN 번호를 입력하세요.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/[^0-9]/g, ''))
                setError('')
              }}
              placeholder="4자리 숫자"
              className="w-full text-center tracking-widest text-xl px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
              autoFocus
            />
            {error && <p className="text-xs text-rose-500 font-medium text-center">{error}</p>}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-medium hover:bg-stone-50 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={pin.length < 4}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"
              >
                확인
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// ─── 성경읽기 탭 메인 ────────────────────────────────────
function BibleTab() {
  const [readings, setReadings] = useState([])
  const [selectedReading, setSelectedReading] = useState(null)
  const [loading, setLoading] = useState(true)

  // 관리 기능 상태
  const [openMenuId, setOpenMenuId] = useState(null) // 어떤 항목의 메뉴가 열려있는지
  const [editingItem, setEditingItem] = useState(null)
  
  // PIN 모달 상태
  const [pinModal, setPinModal] = useState({ isOpen: false, action: null, item: null })

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
      const { error } = await supabase.from('daily_readings').delete().eq('id', id)
      if (error) throw error
      fetchReadings() // 목록 새로고침
    } catch (err) {
      console.error('삭제 오류:', err.message)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  // PIN 인증 성공 처리기
  const handlePinSuccess = () => {
    const { action, item } = pinModal
    if (action === 'edit') {
      setEditingItem(item)
      setOpenMenuId(null)
      // 화면 하단 관리자 폼으로 스크롤 이동
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
      }, 100)
    } else if (action === 'delete') {
      setOpenMenuId(null)
      handleDelete(item.id)
    }
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
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      {openMenuId === item.id ? (
                        // 열린 상태: 수정/삭제 버튼
                        <div className="flex items-center gap-1 bg-white/90 backdrop-blur rounded-lg px-1.5 py-1 shadow-sm border border-stone-200 animate-in fade-in slide-in-from-right-2 duration-200">
                          <button
                            onClick={(e) => { e.stopPropagation(); setPinModal({ isOpen: true, action: 'edit', item }); }}
                            className="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                          >
                            수정
                          </button>
                          <div className="w-px h-3 bg-stone-300" />
                          <button
                            onClick={(e) => { e.stopPropagation(); setPinModal({ isOpen: true, action: 'delete', item }); }}
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
                        // 닫힌 상태: 연필 아이콘
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
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* 관리자 폼 */}
      <AdminForm 
        onAddSuccess={() => { fetchReadings(); setEditingItem(null); }} 
        editData={editingItem}
        onCancelEdit={() => setEditingItem(null)}
      />

      {/* PIN 인증 모달 */}
      <PinModal
        isOpen={pinModal.isOpen}
        actionType={pinModal.action}
        onClose={() => setPinModal({ ...pinModal, isOpen: false })}
        onSuccess={handlePinSuccess}
      />

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
