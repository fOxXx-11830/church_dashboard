import React, { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { supabase } from '../supabase'
import { useAdmin } from '../AdminContext'

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

// (기존 PinModal 관련 코드 제거)

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
        setTitle(editData.extendedProps?.originalTitle || editData.title || '')
        setDescription(editData.extendedProps?.description || '')
        const cat = editData.extendedProps?.category || 'event'
        setCategory(cat)
        const isAllDay = cat === 'birthday' ? true : (editData.allDay || false)
        setAllDay(isAllDay)
        
        const origEnd = editData.extendedProps?.originalEnd || editData.start
        setStart(formatDt(editData.start, isAllDay))
        setEnd(formatDt(origEnd, isAllDay))
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

    if (category === 'birthday') {
      endDate = startDate
    } else if (endDate < startDate) {
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
            <select 
              value={category} 
              onChange={(e) => {
                const val = e.target.value
                setCategory(val)
                if (val === 'birthday') {
                  setAllDay(true)
                  if (start && start.length > 10) setStart(start.slice(0, 10))
                  if (end && end.length > 10) setEnd(end.slice(0, 10))
                }
              }} 
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
            >
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {category === 'birthday' ? '이름' : '제목'}
            </label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder={category === 'birthday' ? "성함만 입력해 주세요 (예: 홍길동)" : "예: 구역장 모임"} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none" />
          </div>
          
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="allDayCheck" 
              checked={allDay} 
              disabled={category === 'birthday'}
              onChange={handleAllDayChange}
              className="w-4 h-4 text-amber-500 rounded border-stone-300 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <label htmlFor="allDayCheck" className={`text-sm font-semibold text-slate-700 ${category === 'birthday' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
              하루 종일
            </label>
          </div>

          <div className={`grid gap-3 ${category === 'birthday' ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                {category === 'birthday' ? '생일 날짜' : '시작일시'}
              </label>
              <input type={allDay ? "date" : "datetime-local"} required value={start} onChange={(e) => setStart(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none" />
            </div>
            {category !== 'birthday' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">종료일시</label>
                <input type={allDay ? "date" : "datetime-local"} min={start} value={end} onChange={(e) => setEnd(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none" />
              </div>
            )}
          </div>
          {category !== 'birthday' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">상세 설명</label>
              <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="일정에 대한 상세한 설명을 적어주세요." className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none resize-none" />
            </div>
          )}
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
function DetailModal({ isOpen, onClose, event, onEdit, onDelete, isAdmin }) {
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
                {event.extendedProps?.originalEnd && new Date(event.extendedProps.originalEnd).getTime() !== event.start.getTime() && (
                  <p className="text-stone-400 mt-0.5">~ {formatTime(event.extendedProps.originalEnd, event.allDay)}</p>
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

          {isAdmin && (
            <div className="flex gap-2">
              <button onClick={onEdit} className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors">수정</button>
              <button onClick={onDelete} className="flex-1 py-2 rounded-xl border border-rose-200 text-rose-600 text-sm font-medium hover:bg-rose-50 transition-colors">삭제</button>
            </div>
          )}
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
  const { isAdmin } = useAdmin()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  // 모달 상태
  const [detailModal, setDetailModal] = useState({ isOpen: false, event: null })
  const [formModal, setFormModal] = useState({ isOpen: false, editData: null, startStr: '' })

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('church_events').select('*')
      if (error) throw error
      
      const formattedEvents = data.map(ev => {
        let finalEnd = ev.end
        // 하루종일 이벤트인 경우 FullCalendar는 end 날짜를 포함하지 않음(exclusive)
        // 따라서 화면에 제대로 렌더링되게 하려면 끝나는 날짜에 1일을 더해주어야 함
        if (ev.all_day && ev.end) {
          const d = new Date(ev.end)
          d.setDate(d.getDate() + 1)
          finalEnd = d.toISOString().slice(0, 10)
        }

        return {
          id: ev.id,
          title: ev.category === 'birthday' ? `🎉 ${ev.title}` : ev.title,
          start: ev.start,
          end: finalEnd,
          allDay: ev.all_day,
          backgroundColor: CATEGORY_COLORS[ev.category] || CATEGORY_COLORS.other,
          borderColor: CATEGORY_COLORS[ev.category] || CATEGORY_COLORS.other,
          extendedProps: {
            originalTitle: ev.title, // 이모지 없는 원본 제목
            originalEnd: ev.end, // 실제 DB 상의 종료일 저장
            description: ev.description,
            category: ev.category
          }
        }
      })
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

  // 다른 달(이전/다음 달) 일정 연하게 표시
  const getEventClassNames = (arg) => {
    const currentMonth = arg.view.currentStart.getMonth()
    const eventMonth = arg.event.start?.getMonth()
    
    if (eventMonth !== undefined && eventMonth !== currentMonth) {
      return ['opacity-40', 'hover:opacity-70']
    }
    return []
  }

  // 빈 날짜 클릭 -> (관리자일 때만) 등록
  const handleDateClick = (info) => {
    if (!isAdmin) return
    setFormModal({ isOpen: true, editData: null, startStr: info.dateStr })
  }

  // 일정 클릭 -> 상세 팝업
  const handleEventClick = (info) => {
    setDetailModal({ isOpen: true, event: info.event })
  }

  // 상세 팝업에서 수정 버튼 클릭
  const handleEditClick = () => {
    setDetailModal({ isOpen: false, event: null })
    setFormModal({ isOpen: true, editData: detailModal.event, startStr: '' })
  }

  // 상세 팝업에서 삭제 버튼 클릭
  const handleDeleteClick = () => {
    if (window.confirm('정말 이 일정을 삭제하시겠습니까?')) {
      executeDelete(detailModal.event.id)
    }
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
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: ''
          }}
          buttonText={{
            today: '오늘'
          }}
          locale="ko"
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventClassNames={getEventClassNames}
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
        isAdmin={isAdmin}
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
