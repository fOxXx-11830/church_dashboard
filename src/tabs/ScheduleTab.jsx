import React, { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { supabase } from '../supabase'
import { useAdmin } from '../AdminContext'

// ─── Category Colors & Labels ──────────────────────────────────────────
const CATEGORY_COLORS = {
  event: '#0ea5e9',    // sky blue
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

// ─── Event Form Modal ──────────────────────────────────────────
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh] border border-sky-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">📅</span>
          {editData ? '일정 수정' : '새 일정 등록'}
        </h3>
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
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:outline-none"
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
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder={category === 'birthday' ? "성함만 입력해 주세요 (예: 홍길동)" : "예: 구역장 모임"} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:outline-none" />
          </div>
          
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="allDayCheck" 
              checked={allDay} 
              disabled={category === 'birthday'}
              onChange={handleAllDayChange}
              className="w-4 h-4 text-sky-500 rounded border-stone-300 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <input type={allDay ? "date" : "datetime-local"} required value={start} onChange={(e) => setStart(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:outline-none" />
            </div>
            {category !== 'birthday' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">종료일시</label>
                <input type={allDay ? "date" : "datetime-local"} min={start} value={end} onChange={(e) => setEnd(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:outline-none" />
              </div>
            )}
          </div>
          {category !== 'birthday' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">상세 설명</label>
              <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="일정에 대한 상세한 설명을 적어주세요." className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:outline-none resize-none" />
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50">취소</button>
            <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 disabled:opacity-50">{submitting ? '저장중...' : '저장하기'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Detail Modal ──────────────────────────────────────────
function DetailModal({ isOpen, onClose, event, onEdit, onDelete, isAdmin, deleteError }) {
  if (!isOpen || !event) return null

  const catLabel = CATEGORY_LABELS[event.extendedProps?.category] || '기타'
  const catColor = CATEGORY_COLORS[event.extendedProps?.category] || CATEGORY_COLORS.other
  
  const formatTime = (dateStr, isAllDay) => {
    if (!dateStr) return ''
    const opts = isAllDay 
      ? { year: 'numeric', month: 'long', day: 'numeric' }
      : { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    return new Date(dateStr).toLocaleString('ko-KR', opts)
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-sky-100 relative" onClick={e => e.stopPropagation()}>
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
                <p className="whitespace-pre-wrap leading-relaxed flex-1 bg-sky-50 p-3 rounded-xl border border-sky-100">{event.extendedProps.description}</p>
              </div>
            )}
          </div>

          {deleteError && (
            <div className="p-3 bg-rose-100 text-rose-700 rounded-lg text-sm mb-4 font-medium">
              {deleteError}
            </div>
          )}

          {isAdmin && (
            <div className="flex gap-2">
              <button onClick={onEdit} className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                수정
              </button>
              <button onClick={onDelete} className="flex-1 py-2 rounded-xl border border-rose-200 text-rose-600 text-sm font-medium hover:bg-rose-50 transition-colors flex items-center justify-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                삭제
              </button>
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

// ─── Schedule Tab Main Component ────────────────────────────────────────
function ScheduleTab() {
  const { isAdmin } = useAdmin()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  const [detailModal, setDetailModal] = useState({ isOpen: false, event: null })
  const [formModal, setFormModal] = useState({ isOpen: false, editData: null, startStr: '' })
  const [deleteError, setDeleteError] = useState('')

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('church_events').select('*')
      if (error) throw error
      
      const formattedEvents = data.map(ev => {
        let finalEnd = ev.end
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
            originalTitle: ev.title,
            originalEnd: ev.end,
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

  const getEventClassNames = (arg) => {
    const currentMonth = arg.view.currentStart.getMonth()
    const eventMonth = arg.event.start?.getMonth()
    
    if (eventMonth !== undefined && eventMonth !== currentMonth) {
      return ['opacity-40', 'hover:opacity-70']
    }
    return []
  }

  const handleDateClick = (info) => {
    if (!isAdmin) return
    setFormModal({ isOpen: true, editData: null, startStr: info.dateStr })
  }

  const handleEventClick = (info) => {
    setDetailModal({ isOpen: true, event: info.event })
  }

  const handleEditClick = () => {
    setDetailModal({ isOpen: false, event: null })
    setFormModal({ isOpen: true, editData: detailModal.event, startStr: '' })
  }

  const handleDeleteClick = () => {
    executeDelete(detailModal.event.id)
  }

  const executeDelete = async (id) => {
    setDeleteError('')
    try {
      const { data, error } = await supabase.from('church_events').delete().eq('id', id).select()
      if (error) throw error
      if (!data || data.length === 0) {
        throw new Error('Supabase 대시보드에서 RLS를 꺼주세요! (권한 없음)')
      }
      setDetailModal({ isOpen: false, event: null })
      fetchEvents()
    } catch (err) {
      console.error('삭제 오류:', err)
      setDeleteError(`삭제 오류: ${err.message}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Title & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2">
            <span className="text-sky-500">📅</span> 교회 일정
          </h2>
          <p className="text-stone-400 text-sm mt-1">우리 교회의 주요 행사와 모임을 확인하세요</p>
        </div>
        
        <div className="flex flex-wrap gap-3 text-xs font-medium text-stone-600 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-sky-100 shadow-sm">
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <span key={k} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[k] }} />
              {v}
            </span>
          ))}
        </div>
      </div>

      {/* Add Event Button (Admin) */}
      {isAdmin && (
        <div className="flex justify-end">
          <button 
            onClick={() => setFormModal({ isOpen: true, editData: null, startStr: new Date().toISOString().slice(0, 10) })}
            className="text-xs font-semibold px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors flex items-center gap-1.5"
          >
            <span>+</span> 새 일정 추가
          </button>
        </div>
      )}

      {/* Calendar Area */}
      <div className="bg-white/80 backdrop-blur-sm p-4 md:p-6 rounded-2xl border border-sky-100 shadow-sm overflow-hidden custom-calendar-wrapper">
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

      {/* Modals */}
      <DetailModal
        isOpen={detailModal.isOpen}
        event={detailModal.event}
        onClose={() => { setDetailModal({ isOpen: false, event: null }); setDeleteError(''); }}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        isAdmin={isAdmin}
        deleteError={deleteError}
      />

      <EventFormModal
        isOpen={formModal.isOpen}
        editData={formModal.editData}
        initialStart={formModal.startStr}
        onClose={() => setFormModal({ isOpen: false, editData: null, startStr: '' })}
        onSaved={fetchEvents}
      />

      {/* FullCalendar Custom CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-calendar-wrapper .fc {
          --fc-border-color: #e0f2fe;
          --fc-button-text-color: #0369a1;
          --fc-button-bg-color: #ffffff;
          --fc-button-border-color: #bae6fd;
          --fc-button-hover-bg-color: #f0f9ff;
          --fc-button-hover-border-color: #7dd3fc;
          --fc-button-active-bg-color: #e0f2fe;
          --fc-button-active-border-color: #7dd3fc;
          --fc-today-bg-color: #e0f2fe;
          font-family: inherit;
        }
        .custom-calendar-wrapper .fc-toolbar-title {
          font-size: 1.25rem !important;
          font-weight: 700;
          color: #0c4a6e;
        }
        .custom-calendar-wrapper .fc-button {
          text-transform: capitalize;
          border-radius: 0.5rem !important;
          padding: 0.4rem 0.75rem !important;
          font-weight: 500 !important;
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
        }
        .custom-calendar-wrapper .fc-button-primary:not(:disabled).fc-button-active {
          background-color: #0284c7 !important;
          border-color: #0284c7 !important;
          color: white !important;
        }
        .custom-calendar-wrapper .fc-daygrid-day-number {
          font-size: 0.875rem;
          color: #0369a1;
          padding: 0.5rem;
        }
        .custom-calendar-wrapper .fc-col-header-cell-cushion {
          color: #0c4a6e;
          font-size: 0.875rem;
          font-weight: 600;
          padding: 0.5rem 0;
        }
        .custom-calendar-wrapper .fc-event {
          border-radius: 6px;
          padding: 2px 4px;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: transform 0.1s, opacity 0.1s;
        }
        .custom-calendar-wrapper .fc-event:hover {
          transform: scale(1.02);
          opacity: 0.9;
        }
        .custom-calendar-wrapper .fc-day-today {
          background-color: #f0f9ff !important;
        }
        .custom-calendar-wrapper .fc-daygrid-day:hover {
          background-color: #f0f9ff;
        }
      `}} />
    </div>
  )
}

export default ScheduleTab
