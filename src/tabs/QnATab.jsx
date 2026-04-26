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

// ─── 관리자: 질문 수정 모달 ────────────────────────────────
function AdminEditModal({ isOpen, onClose, onSaved, editData }) {
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setContent(editData?.content || '')
      setError('')
    }
  }, [isOpen, editData])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) {
      setError('내용을 입력해주세요.')
      return
    }

    setSubmitting(true)
    try {
      const { error: dbError } = await supabase.from('questions').update({ content }).eq('id', editData.id)
      if (dbError) throw dbError
      onSaved()
      onClose()
    } catch (err) {
      setError(`저장 중 오류가 발생했습니다: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4">질문 내용 수정</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <textarea
              rows={5}
              value={content}
              onChange={(e) => { setContent(e.target.value); setError(''); }}
              placeholder="질문을 수정하세요..."
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
function AccordionItem({ item, isOpen, onToggle, onEdit, onDelete, onReply, onDeleteReply }) {
  const { isAdmin } = useAdmin()
  const [replyNick, setReplyNick] = useState(isAdmin ? '황철민 목사' : '')
  const [replyContent, setReplyContent] = useState('')
  const [replying, setReplying] = useState(false)

  // item.answers 렌더링 (없을 경우 빈 배열)
  const answers = item.answers || []

  // 관리자로 전환 시 닉네임 자동 세팅
  useEffect(() => {
    if (isAdmin) setReplyNick('황철민 목사')
  }, [isAdmin])

  const handleReplySubmit = async (e) => {
    e.preventDefault()
    if (!replyNick.trim() || !replyContent.trim()) return
    setReplying(true)
    await onReply(item.id, replyNick, replyContent, isAdmin)
    setReplying(false)
    if (!isAdmin) setReplyNick('')
    setReplyContent('')
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-start gap-3 text-left hover:bg-stone-50 transition-colors duration-150 focus:outline-none"
      >
        <span className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">Q</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-700 truncate">{item.content}</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-stone-400">
              {item.nickname} &nbsp;·&nbsp; {formatDate(item.created_at)}
            </p>
            {(answers.length > 0 || item.answer) && (
              <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-medium">
                답변 {answers.length + (item.answer ? 1 : 0)}
              </span>
            )}
          </div>
        </div>
        <span className={`shrink-0 text-stone-400 mt-0.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▾</span>
      </button>

      <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="px-5 pb-5 border-t border-stone-100">
            
            {/* 원본 질문 영역 */}
            <div className="flex items-start gap-3 pt-4">
              <span className="shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center mt-0.5">Q</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-amber-700 mb-0.5">{item.nickname}</p>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{DOMPurify.sanitize(item.content)}</p>
              </div>
            </div>

            {isAdmin && (
              <div className="flex justify-end gap-2 mt-3">
                <button onClick={() => onEdit(item)} className="px-3 py-1.5 text-xs bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium">질문 내용 수정</button>
                <button onClick={() => onDelete(item.id)} className="px-3 py-1.5 text-xs border border-rose-200 text-rose-500 rounded-lg hover:bg-rose-50 transition-colors font-medium">삭제</button>
              </div>
            )}

            {/* 대댓글(답변) 영역 */}
            <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-stone-100">
              
              {/* 기존 단일 답변 렌더링 (하위 호환) */}
              {item.answer && (
                <div className="flex items-start gap-3 bg-amber-50/50 p-3 rounded-xl border border-amber-200/50 shadow-sm">
                  <span className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-slate-700 text-white text-[10px] font-bold flex items-center justify-center">목사님</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-amber-800 mb-0.5 flex items-center gap-1.5">
                      황철민 목사 
                      <span className="text-[10px] font-normal text-amber-600 bg-amber-100/80 px-1.5 py-0.5 rounded border border-amber-200/50">관리자 답변</span>
                    </p>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{DOMPurify.sanitize(item.answer)}</p>
                  </div>
                </div>
              )}

              {/* 다중 답변 렌더링 (answers 테이블) */}
              {answers.map(ans => (
                <div key={ans.id} className={`flex items-start gap-3 p-3 rounded-xl ${ans.is_admin ? 'bg-amber-50/80 border border-amber-200/50 shadow-sm' : 'bg-stone-50 border border-stone-100'}`}>
                  <span className={`shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${ans.is_admin ? 'bg-slate-700 text-white' : 'bg-stone-300 text-stone-600'}`}>
                    {ans.is_admin ? '목사님' : 'A'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold mb-0.5 flex items-center flex-wrap gap-1.5 ${ans.is_admin ? 'text-amber-800' : 'text-slate-700'}`}>
                      {ans.nickname}
                      {ans.is_admin && <span className="text-[10px] font-normal text-amber-600 bg-amber-100/80 px-1.5 py-0.5 rounded border border-amber-200/50">관리자 답변</span>}
                      <span className="text-[10px] font-normal text-stone-400 ml-1">{formatDate(ans.created_at)}</span>
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{DOMPurify.sanitize(ans.content)}</p>
                  </div>
                  {isAdmin && (
                    <button onClick={() => onDeleteReply(ans.id)} className="shrink-0 text-xs text-rose-400 hover:text-rose-600 px-2 py-1">삭제</button>
                  )}
                </div>
              ))}

              {/* 새 답변 달기 폼 */}
              <form onSubmit={handleReplySubmit} className="mt-2 flex flex-col sm:flex-row gap-2 bg-white p-3 rounded-xl border border-stone-200 shadow-sm">
                <input 
                  type="text" 
                  placeholder="닉네임" 
                  value={replyNick} 
                  onChange={e => setReplyNick(e.target.value)} 
                  disabled={isAdmin || replying}
                  className={`w-full sm:w-28 px-3 py-2 rounded-lg border border-stone-200 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none ${isAdmin ? 'bg-amber-50 text-amber-800 font-bold border-amber-200 cursor-not-allowed' : ''}`} 
                />
                <div className="flex flex-1 gap-2">
                  <textarea 
                    rows={1} 
                    placeholder="자유롭게 답변이나 의견을 남겨주세요..." 
                    value={replyContent} 
                    onChange={e => setReplyContent(e.target.value)} 
                    disabled={replying}
                    className="flex-1 px-3 py-2 rounded-lg border border-stone-200 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none resize-none" 
                  />
                  <button type="submit" disabled={!replyNick || !replyContent || replying} className="px-4 py-2 bg-slate-800 text-white text-xs font-medium rounded-lg hover:bg-slate-700 disabled:opacity-50 shrink-0 transition-colors">
                    등록
                  </button>
                </div>
              </form>
            </div>

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

  const [editModal, setEditModal] = useState({ isOpen: false, data: null }) 

  const fetchQuestions = async () => {
    try {
      let fetchedData
      // answers 테이블과 조인하여 가져오기 시도
      const res = await supabase.from('questions').select('*, answers(*)').order('created_at', { ascending: false })
      
      if (res.error) {
        // answers 테이블이 아직 없을 경우 폴백 처리
        const fallback = await supabase.from('questions').select('*').order('created_at', { ascending: false })
        fetchedData = fallback.data
      } else {
        fetchedData = res.data.map(q => ({
          ...q,
          answers: (q.answers || []).sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        }))
      }
      setQuestions(fetchedData || [])
    } catch (err) {
      console.error('Supabase 읽기 오류:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
    const channel1 = supabase
      .channel('public:questions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'questions' }, () => fetchQuestions())
      .subscribe()
    const channel2 = supabase
      .channel('public:answers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'answers' }, () => fetchQuestions())
      .subscribe()

    return () => { 
      supabase.removeChannel(channel1)
      supabase.removeChannel(channel2)
    }
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
      const cleanNickname = DOMPurify.sanitize(nickname.trim())
      const cleanContent = DOMPurify.sanitize(content.trim())

      const { error: dbError } = await supabase.from('questions').insert([{ nickname: cleanNickname, content: cleanContent }])
      if (dbError) throw dbError
      setNickname('')
      setContent('')
      
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
    setDeleteError('')
    try {
      const { data, error: dbError } = await supabase.from('questions').delete().eq('id', id).select()
      if (dbError) throw dbError
      if (!data || data.length === 0) {
        throw new Error('Supabase 권한 오류 (RLS)')
      }
      fetchQuestions()
    } catch (err) {
      console.error('삭제 오류:', err)
      setDeleteError(`삭제 오류: ${err.message}`)
    }
  }

  // 대댓글(답변) 등록
  const handleReply = async (questionId, replyNick, replyContent, isAdmin) => {
    try {
      const cleanNick = DOMPurify.sanitize(replyNick.trim())
      const cleanContent = DOMPurify.sanitize(replyContent.trim())
      
      const { error } = await supabase.from('answers').insert([{
        question_id: questionId,
        nickname: cleanNick,
        content: cleanContent,
        is_admin: isAdmin
      }])
      
      if (error) {
        if (error.message.includes('relation "answers" does not exist')) {
          alert('💡 기능 업데이트 안내\n\n대댓글 기능을 사용하려면 Supabase에 answers 테이블을 추가로 생성해야 합니다! 채팅창의 안내 코드를 참조해 주세요.')
        } else {
          throw error
        }
      } else {
        fetchQuestions()
      }
    } catch (err) {
      alert(`오류: ${err.message}`)
    }
  }

  // 대댓글 삭제
  const handleDeleteReply = async (replyId) => {
    try {
      await supabase.from('answers').delete().eq('id', replyId)
      fetchQuestions()
    } catch (err) {
      console.error(err)
    }
  }

  const toggleOpen = (id) => setOpenId(prev => prev === id ? null : id)

  return (
    <div className="space-y-8">
      {/* 질문 입력 폼 */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
        <h2 className="text-base font-bold text-slate-700 mb-1 flex items-center gap-2">
          <span className="w-1 h-5 bg-amber-500 rounded-full inline-block" />
          질문 남기기
        </h2>
        <p className="text-xs text-stone-400 mb-5">살아가면서 마주한 신앙인으로서의 고민, 질문을 나누어 보세요.</p>
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
                onEdit={(data) => setEditModal({ isOpen: true, data })}
                onDelete={handleDelete}
                onReply={handleReply}
                onDeleteReply={handleDeleteReply}
              />
            ))}
          </div>
        )}
      </div>

      <AdminEditModal
        isOpen={editModal.isOpen}
        editData={editModal.data}
        onClose={() => setEditModal({ isOpen: false, data: null })}
        onSaved={fetchQuestions}
      />
    </div>
  )
}

export default QnATab
