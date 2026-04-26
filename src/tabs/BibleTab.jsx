import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

// ─── 유틸: 유튜브 ID 추출 ────────────────────────────────
function getYouTubeID(url) {
  if (!url) return null
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

// ─── 관리자 등록 폼 ──────────────────────────────────────
function AdminForm({ onAddSuccess }) {
  const [day, setDay] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [content, setContent] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const dayNum = parseInt(day, 10)
    if (!day || isNaN(dayNum)) { setError('유효한 일차(숫자)를 입력해주세요.'); return }
    if (!subtitle.trim()) { setError('부제목을 입력해주세요.'); return }
    if (!content.trim()) { setError('본문/강해 내용을 입력해주세요.'); return }

    setSubmitting(true)
    try {
      const { error } = await supabase.from('daily_readings').insert([
        {
          day: dayNum,
          subtitle: subtitle.trim(),
          content: content.trim(),
          youtube_url: youtubeUrl.trim(),
        },
      ])
      if (error) throw error

      // 초기화
      setDay('')
      setSubtitle('')
      setContent('')
      setYoutubeUrl('')
      setIsOpen(false)
      if (onAddSuccess) onAddSuccess()
    } catch (err) {
      console.error('등록 오류:', err)
      setError('등록 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden mt-10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <span className="text-lg">⚙️</span>
          관리자 모드: 성경읽기 등록 (PIN 연동 준비)
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

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {submitting ? '등록 중...' : '말씀 등록하기'}
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
      {/* 왼쪽: 유튜브 영상 (모바일 상단) */}
      <div className="w-full md:w-1/2 bg-slate-900 shrink-0">
        <div className="relative w-full h-0 pb-[56.25%]">
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

      {/* 오른쪽: 내용 영역 (모바일 하단) */}
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

// ─── 성경읽기 탭 메인 ────────────────────────────────────
function BibleTab() {
  const [readings, setReadings] = useState([])
  const [selectedReading, setSelectedReading] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchReadings = async () => {
    setLoading(true)
    try {
      // day 기준 내림차순 (가장 최근 일차가 먼저 오도록)
      const { data, error } = await supabase
        .from('daily_readings')
        .select('*')
        .order('day', { ascending: false })

      if (error) throw error

      setReadings(data || [])
      // 선택된 항목이 없고, 데이터가 있으면 첫 번째(최신) 항목 자동 선택
      if (data && data.length > 0) {
        setSelectedReading(data[0])
      }
    } catch (err) {
      console.error('성경읽기 데이터 로딩 오류:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReadings()
  }, [])

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
                  <button
                    key={item.id}
                    onClick={() => setSelectedReading(item)}
                    className={`text-left px-4 py-3 rounded-xl border transition-all duration-200 ${
                      selectedReading?.id === item.id
                        ? 'border-amber-400 bg-amber-50 shadow-sm ring-1 ring-amber-400'
                        : 'border-stone-200 bg-white hover:border-amber-300 hover:bg-amber-50/50'
                    }`}
                  >
                    <span className="block text-xs font-bold text-amber-600 mb-1">
                      {item.day}일차
                    </span>
                    <span className="block text-sm font-medium text-slate-700 truncate">
                      {item.subtitle}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* 관리자 등록 폼 */}
      <AdminForm onAddSuccess={fetchReadings} />

      {/* 스크롤바 CSS 주입 (본문 스크롤을 예쁘게) */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
      `}} />
    </div>
  )
}

export default BibleTab
