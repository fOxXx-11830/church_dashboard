import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useAdmin } from '../AdminContext'
import DOMPurify from 'dompurify'

// ─── 날짜 포맷 ────────────────────────────────────────────
function formatDate(isoString) {
  if (!isoString) return '방금 전'
  const d = new Date(isoString)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

// ─── 관리자: 답변/수정 모달 ────────────────────────────────
function AdminQnAModal({ isOpen, onClose, onSaved, editData, mode }) {
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (mode === 'answer') {
        setContent(editData?.answer || '')
      } else if (mode === 'edit') {
        setContent(editData?.content || '')
      }
      setError('')
    }
  }, [isOpen, editData, mode])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) {
      setError('내용을 입력해주세요.')
      return
    }

    setSubmitting(true)
    try {
      const payload = mode === 'answer' ? { answer: content } : { content: content }
      const { error: dbError } = await supabase.from('questions').update(payload).eq('id', editData.id)
      
      if (dbError) throw dbError
      onSaved()
      onClose()
    } catch (err) {
      console.error(err)
      setError(`저장 중 오류가 발생했습니다: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4">
          {mode === 'answer' ? '답변 작성/수정' : '질문 수정'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <textarea
              rows={5}
              value={content}
              onChange={(e) => { setContent(e.target.value); setError(''); }}
              placeholder={mode === 'answer' ? "답변을 입력하세요..." : "질문을 수정하세요..."}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none resize-none"
            />
          </div>
          {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50">취소</button>
            <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 disabled:opacity-50">
              {submitting ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── 아코디언 아이템 ──────────────────────────────────────
function AccordionItem({ item, isOpen, onToggle, onEdit, onDelete, onAnswer }) {
  const { isAdmin } = useAdmin()

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-start gap-3 text-left hover:bg-stone-50 transition-colors duration-150 focus:outline-none"
      >
        <span className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">Q</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-700 truncate">{item.content}</p>
          <p className="text-xs text-stone-400 mt-0.5">
            {item.nickname} &nbsp;·&nbsp; {formatDate(item.created_at)}
          </p>
        </div>
        <span className={`shrink-0 text-stone-400 mt-0.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▾</span>
      </button>

      <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="px-5 pb-5 border-t border-stone-100">
            <div className="flex items-start gap-3 pt-4">
              <span className="shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center mt-0.5">Q</span>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{DOMPurify.sanitize(item.content)}</p>
            </div>

            <div className="flex items-start gap-3 mt-4">
              <span className="shrink-0 w-6 h-6 rounded-full bg-slate-700 text-white text-xs font-bold flex items-center justify-center mt-0.5">A</span>
              {item.answer ? (
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{DOMPurify.sanitize(item.answer)}</p>
              ) : (
                <p className="text-sm text-stone-400 italic">아직 답변이 등록되지 않았습니다.</p>
              )}
            </div>

            {isAdmin && (
              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-stone-100">
                <button onClick={() => onAnswer(item)} className="px-3 py-1.5 text-xs bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors font-medium">답변 달기/수정</button>
                <button onClick={() => onEdit(item)} className="px-3 py-1.5 text-xs bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium">질문 내용 수정</button>
                <button onClick={() => onDelete(item.id)} className="px-3 py-1.5 text-xs border border-rose-200 text-rose-500 rounded-lg hover:bg-rose-50 transition-colors font-medium">삭제</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── 질문과 답변 탭 ───────────────────────────────────────
function QnATab() {
  const [nickname, setNickname] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState(null)
  const [error, setError] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [cooldown, setCooldown] = useState(0) // 도배 방지 쿨타임 (초)

  const [adminModal, setAdminModal] = useState({ isOpen: false, data: null, mode: 'answer' }) // mode: 'answer' | 'edit'

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase.from('questions').select('*').order('created_at', { ascending: false })
      if (error) throw error
      setQuestions(data || [])
    } catch (err) {
      console.error('Supabase 읽기 오류:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
    const channel = supabase
      .channel('public:questions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'questions' }, () => {
        fetchQuestions()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  // 도배 방지 쿨타임 체크 (로컬스토리지 기반)
  useEffect(() => {
    const lastPostTime = localStorage.getItem('lastQnAPostTime')
    if (lastPostTime) {
      const timeDiff = Math.floor((Date.now() - parseInt(lastPostTime, 10)) / 1000)
      if (timeDiff < 60) {
        setCooldown(60 - timeDiff)
      }
    }
  }, [])

  useEffect(() => {
    let timer
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(c => c - 1), 1000)
    }
    return () => clearInterval(timer)
  }, [cooldown])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (cooldown > 0) {
      setError(`도배 방지를 위해 ${cooldown}초 후에 다시 질문할 수 있습니다.`)
      return
    }

    if (!nickname.trim()) { setError('닉네임을 입력해 주세요.'); return }
    if (!content.trim())  { setError('질문 내용을 입력해 주세요.'); return }

    setSubmitting(true)
    try {
      // DOMPurify로 XSS 방어 처리 후 DB에 저장
      const cleanNickname = DOMPurify.sanitize(nickname.trim())
      const cleanContent = DOMPurify.sanitize(content.trim())

      const { error: dbError } = await supabase.from('questions').insert([{ nickname: cleanNickname, content: cleanContent }])
      if (dbError) throw dbError
      setNickname('')
      setContent('')
      
      // 글 작성 성공 시 60초 쿨타임 부여
      localStorage.setItem('lastQnAPostTime', Date.now().toString())
      setCooldown(60)

      fetchQuestions()
    } catch (err) {
      console.error('등록 오류:', err.message)
      setError('등록 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    // window.confirm 제거 (인앱 브라우저 무시 현상 방지)
    setDeleteError('')
    try {
      const { data, error: dbError } = await supabase.from('questions').delete().eq('id', id).select()
      if (dbError) throw dbError
      if (!data || data.length === 0) {
        throw new Error('Supabase 대시보드에서 해당 테이블의 RLS를 꺼주세요! (권한 없음)')
      }
      fetchQuestions()
    } catch (err) {
      console.error('삭제 오류:', err)
      setDeleteError(`삭제 오류: ${err.message}`)
    }
  }

  const toggleOpen = (id) => setOpenId(prev => prev === id ? null : id)

  return (
    <div className="space-y-8">
      {/* 질문 입력 폼 */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
        <h2 className="text-base font-bold text-slate-700 mb-1 flex items-center gap-2">
          <span className="w-1 h-5 bg-amber-500 rounded-full inline-block" />
          익명으로 질문 남기기
        </h2>
        <p className="text-xs text-stone-400 mb-5">닉네임만 입력하고 익명으로 궁금한 점을 질문해 보세요.</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="닉네임 (예: 믿음이)"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            maxLength={20}
            disabled={submitting}
            className="w-full sm:w-48 px-4 py-2.5 rounded-lg border border-stone-200 text-sm text-slate-700 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400 transition disabled:opacity-50"
          />
          <textarea
            rows={4}
            placeholder="궁금한 점을 자유롭게 적어주세요..."
            value={content}
            onChange={e => setContent(e.target.value)}
            disabled={submitting}
            className="w-full px-4 py-3 rounded-lg border border-stone-200 text-sm text-slate-700 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400 transition resize-none disabled:opacity-50"
          />
          {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
          <div className="flex justify-end">
            <button type="submit" disabled={submitting || cooldown > 0} className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors duration-150 flex items-center gap-2">
              {submitting ? '등록 중...' : (cooldown > 0 ? `${cooldown}초 대기` : '질문 등록')}
            </button>
          </div>
        </form>
      </div>

      {/* 질문 목록 */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <h3 className="text-base font-bold text-slate-700 flex items-center gap-2">
            <span className="w-1 h-5 bg-slate-600 rounded-full inline-block" />
            질문 목록
            {!loading && <span className="ml-1 text-xs font-normal text-stone-400">({questions.length}건)</span>}
          </h3>
        </div>

        {deleteError && (
          <div className="p-3 bg-rose-100 text-rose-700 rounded-lg text-sm mb-4 font-medium">
            {deleteError}
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-xl border border-stone-200 h-16 animate-pulse" />)}
          </div>
        )}

        {!loading && questions.length === 0 && (
          <div className="bg-white rounded-xl border border-stone-200 py-12 text-center text-stone-400">
            <p className="text-2xl mb-2">🙏</p>
            <p className="text-sm">아직 등록된 질문이 없습니다.</p>
            <p className="text-xs mt-1">첫 번째 질문을 남겨보세요!</p>
          </div>
        )}

        {!loading && questions.length > 0 && (
          <div className="space-y-3">
            {questions.map(item => (
              <AccordionItem
                key={item.id}
                item={item}
                isOpen={openId === item.id}
                onToggle={() => toggleOpen(item.id)}
                onAnswer={(data) => setAdminModal({ isOpen: true, data, mode: 'answer' })}
                onEdit={(data) => setAdminModal({ isOpen: true, data, mode: 'edit' })}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <AdminQnAModal
        isOpen={adminModal.isOpen}
        mode={adminModal.mode}
        editData={adminModal.data}
        onClose={() => setAdminModal({ isOpen: false, data: null, mode: 'answer' })}
        onSaved={fetchQuestions}
      />
    </div>
  )
}

export default QnATab
