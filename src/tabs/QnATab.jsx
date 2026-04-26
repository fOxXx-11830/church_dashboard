import { useState, useEffect } from 'react'
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

// ─── 날짜 포맷 ────────────────────────────────────────────
function formatDate(ts) {
  if (!ts) return '방금 전'
  const d = ts.toDate()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

// ─── 아코디언 아이템 ──────────────────────────────────────
function AccordionItem({ item, isOpen, onToggle }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
      {/* 헤더 — 클릭으로 열고 닫기 */}
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-start gap-3 text-left hover:bg-stone-50 transition-colors duration-150 focus:outline-none"
      >
        {/* Q 뱃지 */}
        <span className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">
          Q
        </span>

        {/* 본문 */}
        <div className="flex-1 min-w-0">
          {/* 질문 내용 한 줄 미리보기 */}
          <p className="font-medium text-slate-700 truncate">{item.content}</p>
          <p className="text-xs text-stone-400 mt-0.5">
            {item.nickname} &nbsp;·&nbsp; {formatDate(item.createdAt)}
          </p>
        </div>

        {/* 열림/닫힘 화살표 */}
        <span
          className={`shrink-0 text-stone-400 mt-0.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        >
          ▾
        </span>
      </button>

      {/* 펼쳐지는 본문 — CSS grid 트릭으로 부드러운 슬라이드 */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 border-t border-stone-100">

            {/* 전체 질문 내용 */}
            <div className="flex items-start gap-3 pt-4">
              <span className="shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center mt-0.5">
                Q
              </span>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {item.content}
              </p>
            </div>

            {/* 목사님 답변 */}
            <div className="flex items-start gap-3 mt-4">
              <span className="shrink-0 w-6 h-6 rounded-full bg-slate-700 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                A
              </span>
              {item.answer ? (
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {item.answer}
                </p>
              ) : (
                <p className="text-sm text-stone-400 italic">
                  아직 답변이 등록되지 않았습니다.
                </p>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

// ─── 질문과 답변 탭 ───────────────────────────────────────
function QnATab() {
  const [nickname, setNickname]   = useState('')
  const [content, setContent]     = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading]     = useState(true)
  const [openId, setOpenId]       = useState(null)
  const [error, setError]         = useState('')

  // Firestore 실시간 구독 (createdAt 내림차순)
  useEffect(() => {
    const q = query(
      collection(db, 'questions'),
      orderBy('createdAt', 'desc')
    )
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setQuestions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
        setLoading(false)
      },
      (err) => {
        console.error('Firestore 읽기 오류:', err)
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [])

  // 질문 등록
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!nickname.trim()) { setError('닉네임을 입력해 주세요.'); return }
    if (!content.trim())  { setError('질문 내용을 입력해 주세요.'); return }

    setSubmitting(true)
    try {
      await addDoc(collection(db, 'questions'), {
        nickname:  nickname.trim(),
        content:   content.trim(),
        createdAt: serverTimestamp(),
        answer:    '',
      })
      setNickname('')
      setContent('')
    } catch (err) {
      console.error('등록 오류:', err)
      setError('등록 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.')
    }
    setSubmitting(false)
  }

  const toggleOpen = (id) => setOpenId(prev => prev === id ? null : id)

  return (
    <div className="space-y-8">

      {/* ① 질문 입력 폼 */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
        <h2 className="text-base font-bold text-slate-700 mb-1 flex items-center gap-2">
          <span className="w-1 h-5 bg-amber-500 rounded-full inline-block" />
          익명으로 질문 남기기
        </h2>
        <p className="text-xs text-stone-400 mb-5">
          닉네임만 입력하고 익명으로 궁금한 점을 질문해 보세요.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* 닉네임 */}
          <input
            id="qna-nickname"
            type="text"
            placeholder="닉네임 (예: 믿음이)"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            maxLength={20}
            disabled={submitting}
            className="w-full sm:w-48 px-4 py-2.5 rounded-lg border border-stone-200 text-sm text-slate-700
              placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
              transition disabled:opacity-50"
          />

          {/* 질문 내용 */}
          <textarea
            id="qna-content"
            rows={4}
            placeholder="궁금한 점을 자유롭게 적어주세요..."
            value={content}
            onChange={e => setContent(e.target.value)}
            disabled={submitting}
            className="w-full px-4 py-3 rounded-lg border border-stone-200 text-sm text-slate-700
              placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
              transition resize-none disabled:opacity-50"
          />

          {/* 에러 메시지 */}
          {error && (
            <p className="text-xs text-rose-500 font-medium">{error}</p>
          )}

          {/* 등록 버튼 */}
          <div className="flex justify-end">
            <button
              id="qna-submit"
              type="submit"
              disabled={submitting}
              className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-sm font-medium
                px-6 py-2.5 rounded-lg transition-colors duration-150 flex items-center gap-2"
            >
              {submitting && (
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              )}
              {submitting ? '등록 중...' : '질문 등록'}
            </button>
          </div>
        </form>
      </div>

      {/* ② 질문 목록 */}
      <div>
        <h3 className="text-base font-bold text-slate-700 mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-slate-600 rounded-full inline-block" />
          질문 목록
          {!loading && (
            <span className="ml-1 text-xs font-normal text-stone-400">
              ({questions.length}건)
            </span>
          )}
        </h3>

        {/* 로딩 */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl border border-stone-200 h-16 animate-pulse" />
            ))}
          </div>
        )}

        {/* 데이터 없음 */}
        {!loading && questions.length === 0 && (
          <div className="bg-white rounded-xl border border-stone-200 py-12 text-center text-stone-400">
            <p className="text-2xl mb-2">🙏</p>
            <p className="text-sm">아직 등록된 질문이 없습니다.</p>
            <p className="text-xs mt-1">첫 번째 질문을 남겨보세요!</p>
          </div>
        )}

        {/* 아코디언 리스트 */}
        {!loading && questions.length > 0 && (
          <div className="space-y-3">
            {questions.map(item => (
              <AccordionItem
                key={item.id}
                item={item}
                isOpen={openId === item.id}
                onToggle={() => toggleOpen(item.id)}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default QnATab
