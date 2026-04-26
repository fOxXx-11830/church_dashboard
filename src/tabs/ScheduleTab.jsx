import React, { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { supabase } from '../supabase'

// ─── 카테고리 색상 및 레이블 ──────────────────────────────────────────
const CATEGORY_COLORS = {
  event: '#3b82f6',    // blue
  birthday: '#ec4899', // pink
  pastor: '#f97316',   // orange
  other: '#9ca3af',    // gray
}

const CATEGORY_LABELS = {
  event: '교회 행사',
  birthday: '생일',
  pastor: '목사 동정',
  other: '기타'
}

// ─── 핀 인증 모달 ──────────────────────────────────────────────────
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
    if (pin === '0000') {
      onSuccess()
    } else {
      setError('비밀번호가 틀렸습니다.')
      setPin('')
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
        <h3 className="text-lg font-bold text-slate-800 mb-2">관리자 인증</h3>
        <p className="text-sm text-stone-500 mb-5">
          {actionType === 'add' ? '일정을 등록' : actionType === 'edit' ? '일정을 수정' : '일정을 삭제'}하시려면 관리자 PIN을 입력하세요.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            maxLength={4}
            value={pin}
            onChange={(e) => { setPin(e.target.value.replace(/[^0-9]/g, '')); setError('') }}
            placeholder="4자리 숫자"
            className="w-full text-center tracking-widest text-xl px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
            autoFocus
          />
          {error && <p className="text-xs text-rose-500 font-medium text-center">{error}</p>}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-medium hover:bg-stone-50">취소</button>
            <button type="submit" disabled={pin.length < 4} className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-50">확인</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── 일정 등록/수정 폼 모달 ──────────────────────────────────────────
function EventFormModal({ isOpen, onClose, onSaved, editData, initialStart }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [category, setCategory] = useState('event')
  const [allDay, setAllDay] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const formatDt = (dtStr, isAllDay) => {
        if (!dtStr) return ''
        const d = new Date(dtStr)
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
        const iso = d.toISOString()
        return isAllDay ? iso.slice(0, 10) : iso.slice(0, 16)
      }

      if (editData) {
        setTitle(editData.title || '')
        setDescription(editData.extendedProps?.description || '')
        setCategory(editData.extendedProps?.category || 'event')
        const isAllDay = editData.allDay || false
        setAllDay(isAllDay)
        
        setStart(formatDt(editData.start, isAllDay))
        setEnd(formatDt(editData.end, isAllDay) || formatDt(editData.start, isAllDay))
      } else {
        setTitle('')
        setDescription('')
        setCategory('event')
        
        // 날짜 클릭으로 생성 시 기본적으로 클릭한 날짜가 넘어옴
        const isDateOnly = !initialStart.includes('T')
        setAllDay(isDateOnly)

        if (isDateOnly) {
          setStart(initialStart)
          setEnd(initialStart)
        } else {
          const st = initialStart.slice(0, 16)
          setStart(st)
          setEnd(st)
        }
      }
    }
  }, [isOpen, editData, initialStart])

  // 하루종일 토글 시 포맷 변경
  const handleAllDayChange = (e) => {
    const checked = e.target.checked
    setAllDay(checked)
    if (checked) {
      if (start) setStart(start.slice(0, 10))
      if (end) setEnd(end.slice(0, 10))
    } else {
      if (start && start.length === 10) setStart(`${start}T09:00`)
      if (end && end.length === 10) setEnd(`${end}T10:00`)
    }
  }

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !start) return

    const startDate = new Date(start)
    let endDate = end ? new Date(end) : startDate

    if (endDate < startDate) {
      alert('종료 날짜/시간이 시작 날짜/시간보다 빠를 수 없습니다.')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        category,
        all_day: allDay
      }

      if (editData) {
        const { error } = await supabase.from('church_events').update(payload).eq('id', editData.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('church_events').insert([payload])
        if (error) throw error
      }
      onSaved()
      onClose()
    } catch (err) {
      console.error('일정 저장 오류:', err)
      alert('일정 저장 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
        <h3 className="text-lg font-bold text-slate-800 mb-4">{editData ? '일정 수정' : '새 일정 등록'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">카테고리</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none">
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">제목</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 구역장 모임" className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none" />
          </div>
          
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="allDayCheck" 
              checked={allDay} 
              onChange={handleAllDayChange}
              className="w-4 h-4 text-amber-500 rounded border-stone-300 focus:ring-amber-500"
            />
            <label htmlFor="allDayCheck" className="text-sm font-semibold text-slate-700 cursor-pointer">
              하루 종일
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">시작일시</label>
              <input type={allDay ? "date" : "datetime-local"} required value={start} onChange={(e) => setStart(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">종료일시</label>
              <input type={allDay ? "date" : "datetime-local"} value={end} onChange={(e) => setEnd(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">상세 설명</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="일정에 대한 상세한 설명을 적어주세요." className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none resize-none" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50">취소</button>
            <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 disabled:opacity-50">{submitting ? '저장중...' : '저장하기'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── 일정 상세 팝업 ──────────────────────────────────────────
function DetailModal({ isOpen, onClose, event, onEdit, onDelete }) {
  if (!isOpen || !event) return null

  const catLabel = CATEGORY_LABELS[event.extendedProps?.category] || '기타'
  const catColor = CATEGORY_COLORS[event.extendedProps?.category] || CATEGORY_COLORS.other
  
  // 날짜 포맷
  const formatTime = (dateStr, isAllDay) => {
    if (!dateStr) return ''
    const opts = isAllDay 
      ? { year: 'numeric', month: 'long', day: 'numeric' }
      : { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    return new Date(dateStr).toLocaleString('ko-KR', opts)
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: catColor }} />
            <span className="text-xs font-bold text-slate-500">{catLabel}</span>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-4 leading-tight">{event.title}</h3>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 text-sm text-slate-600">
              <span className="text-lg">🕒</span>
              <div>
                <p>{formatTime(event.start, event.allDay)}</p>
                {event.end && event.end.getTime() !== event.start.getTime() && (
                  <p className="text-stone-400 mt-0.5">~ {formatTime(event.end, event.allDay)}</p>
                )}
              </div>
            </div>
            {event.extendedProps?.description && (
              <div className="flex items-start gap-3 text-sm text-slate-600">
                <span className="text-lg">📝</span>
                <p className="whitespace-pre-wrap leading-relaxed flex-1 bg-stone-50 p-3 rounded-xl border border-stone-100">{event.extendedProps.description}</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button onClick={onEdit} className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors">수정</button>
            <button onClick={onDelete} className="flex-1 py-2 rounded-xl border border-rose-200 text-rose-600 text-sm font-medium hover:bg-rose-50 transition-colors">삭제</button>
          </div>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  )
}

// ─── 메인 탭 컴포넌트 ────────────────────────────────────────
function ScheduleTab() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  // 모달 상태
  const [detailModal, setDetailModal] = useState({ isOpen: false, event: null })
  const [pinModal, setPinModal] = useState({ isOpen: false, action: null, payload: null })
  const [formModal, setFormModal] = useState({ isOpen: false, editData: null, startStr: '' })

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('church_events').select('*')
      if (error) throw error
      
      const formattedEvents = data.map(ev => ({
        id: ev.id,
        title: ev.title,
        start: ev.start,
        end: ev.end,
        allDay: ev.all_day, // DB의 all_day 값을 FullCalendar allDay 속성에 연결
        backgroundColor: CATEGORY_COLORS[ev.category] || CATEGORY_COLORS.other,
        borderColor: CATEGORY_COLORS[ev.category] || CATEGORY_COLORS.other,
        extendedProps: {
          description: ev.description,
          category: ev.category
        }
      }))
      setEvents(formattedEvents)
    } catch (err) {
      console.error('일정 로딩 오류:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  // 빈 날짜 클릭 -> 등록 PIN 요구
  const handleDateClick = (info) => {
    setPinModal({ isOpen: true, action: 'add', payload: { startStr: info.dateStr } })
  }

  // 일정 클릭 -> 상세 팝업
  const handleEventClick = (info) => {
    setDetailModal({ isOpen: true, event: info.event })
  }

  // 상세 팝업에서 수정 버튼 클릭
  const handleEditClick = () => {
    setPinModal({ isOpen: true, action: 'edit', payload: detailModal.event })
  }

  // 상세 팝업에서 삭제 버튼 클릭
  const handleDeleteClick = () => {
    setPinModal({ isOpen: true, action: 'delete', payload: detailModal.event })
  }

  // 실제 삭제 실행
  const executeDelete = async (id) => {
    try {
      const { error } = await supabase.from('church_events').delete().eq('id', id)
      if (error) throw error
      setDetailModal({ isOpen: false, event: null })
      fetchEvents()
    } catch (err) {
      console.error('삭제 오류:', err)
      alert('일정 삭제 중 오류가 발생했습니다.')
    }
  }

  // PIN 인증 통과 시 분기 처리
  const handlePinSuccess = () => {
    const { action, payload } = pinModal
    setPinModal({ isOpen: false, action: null, payload: null })

    if (action === 'add') {
      setFormModal({ isOpen: true, editData: null, startStr: payload.startStr })
    } else if (action === 'edit') {
      setDetailModal({ isOpen: false, event: null })
      setFormModal({ isOpen: true, editData: payload, startStr: '' })
    } else if (action === 'delete') {
      executeDelete(payload.id)
    }
  }

  return (
    <div className="space-y-6">
      {/* 타이틀 및 범례 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2">
            <span className="text-amber-500">📅</span> 교회 일정
          </h2>
          <p className="text-stone-400 text-sm mt-1">우리 교회의 주요 행사와 모임을 확인하세요</p>
        </div>
        
        <div className="flex flex-wrap gap-3 text-xs font-medium text-stone-600 bg-white px-4 py-2 rounded-xl border border-stone-200 shadow-sm">
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <span key={k} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[k] }} />
              {v}
            </span>
          ))}
        </div>
      </div>

      {/* 달력 영역 */}
      <div className="bg-white p-4 md:p-6 rounded-2xl border border-stone-200 shadow-sm overflow-hidden custom-calendar-wrapper">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          buttonText={{
            today: '오늘',
            month: '월',
            week: '주',
            day: '일'
          }}
          locale="ko"
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="auto"
          dayMaxEvents={true}
        />
      </div>

      {/* 모달 컴포넌트들 */}
      <DetailModal
        isOpen={detailModal.isOpen}
        event={detailModal.event}
        onClose={() => setDetailModal({ isOpen: false, event: null })}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      <PinModal
        isOpen={pinModal.isOpen}
        actionType={pinModal.action}
        onClose={() => setPinModal({ isOpen: false, action: null, payload: null })}
        onSuccess={handlePinSuccess}
      />

      <EventFormModal
        isOpen={formModal.isOpen}
        editData={formModal.editData}
        initialStart={formModal.startStr}
        onClose={() => setFormModal({ isOpen: false, editData: null, startStr: '' })}
        onSaved={fetchEvents}
      />

      {/* FullCalendar 커스텀 CSS (테일윈드와 조화롭게) */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-calendar-wrapper .fc {
          --fc-border-color: #e2e8f0;
          --fc-button-text-color: #475569;
          --fc-button-bg-color: #ffffff;
          --fc-button-border-color: #cbd5e1;
          --fc-button-hover-bg-color: #f8fafc;
          --fc-button-hover-border-color: #94a3b8;
          --fc-button-active-bg-color: #e2e8f0;
          --fc-button-active-border-color: #94a3b8;
          /* --fc-event-bg-color 제거하여 개별 이벤트의 backgroundColor 속성이 먹히도록 함 */
          --fc-today-bg-color: #fef3c7;
          font-family: inherit;
        }
        .custom-calendar-wrapper .fc-toolbar-title {
          font-size: 1.25rem !important;
          font-weight: 700;
          color: #334155;
        }
        .custom-calendar-wrapper .fc-button {
          text-transform: capitalize;
          border-radius: 0.5rem !important;
          padding: 0.4rem 0.75rem !important;
          font-weight: 500 !important;
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
        }
        .custom-calendar-wrapper .fc-button-primary:not(:disabled).fc-button-active {
          background-color: #1e293b !important;
          border-color: #1e293b !important;
          color: white !important;
        }
        .custom-calendar-wrapper .fc-daygrid-day-number {
          font-size: 0.875rem;
          color: #475569;
          padding: 0.5rem;
        }
        .custom-calendar-wrapper .fc-col-header-cell-cushion {
          color: #64748b;
          font-size: 0.875rem;
          font-weight: 600;
          padding: 0.5rem 0;
        }
        /* 이벤트 라운딩 처리 */
        .custom-calendar-wrapper .fc-event {
          border-radius: 4px;
          padding: 1px 3px;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: transform 0.1s;
        }
        .custom-calendar-wrapper .fc-event:hover {
          transform: scale(1.02);
          opacity: 0.9;
        }
      `}} />
    </div>
  )
}

export default ScheduleTab
