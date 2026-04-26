// 2026년 4월 기준 더미 달력
// 4월 1일 = 수요일 (0:일, 1:월, 2:화, 3:수, 4:목, 5:금, 6:토)
const YEAR = 2026
const MONTH = 4
const MONTH_LABEL = '2026년 4월'
const START_DAY = 3  // 수요일
const TOTAL_DAYS = 30

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

const EVENTS = {
  6:  [{ label: '주일예배 10:00', color: 'bg-blue-500' }],
  10: [{ label: '구역모임', color: 'bg-amber-500' }],
  13: [{ label: '주일예배 10:00', color: 'bg-blue-500' }],
  16: [{ label: '새벽기도 5:30', color: 'bg-slate-400' }],
  17: [{ label: '새벽기도 5:30', color: 'bg-slate-400' }],
  18: [{ label: '청년부 모임', color: 'bg-emerald-500' }],
  20: [{ label: '주일예배 10:00', color: 'bg-blue-500' }],
  26: [
    { label: '주일예배 10:00', color: 'bg-blue-500' },
    { label: '가정의달 행사', color: 'bg-rose-400' },
  ],
  27: [{ label: '새벽기도 5:30', color: 'bg-slate-400' }],
}

function buildCalendarDays() {
  const days = []
  // 앞 빈칸
  for (let i = 0; i < START_DAY; i++) days.push(null)
  // 날짜
  for (let d = 1; d <= TOTAL_DAYS; d++) days.push(d)
  // 뒷 빈칸 (6의 배수 채우기)
  while (days.length % 7 !== 0) days.push(null)
  return days
}

const TODAY = 26  // 오늘 날짜 (더미)

function ScheduleTab() {
  const days = buildCalendarDays()
  const weeks = []
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))

  return (
    <div className="space-y-5">
      {/* 캘린더 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-700">{MONTH_LABEL}</h2>
        <div className="flex gap-2">
          <button
            id="calendar-prev"
            className="px-4 py-2 rounded-lg border border-stone-200 bg-white text-stone-500 text-sm hover:bg-stone-50 hover:border-stone-300 transition-colors"
          >
            ← 이전
          </button>
          <button
            id="calendar-today"
            className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm hover:bg-slate-700 transition-colors"
          >
            오늘
          </button>
          <button
            id="calendar-next"
            className="px-4 py-2 rounded-lg border border-stone-200 bg-white text-stone-500 text-sm hover:bg-stone-50 hover:border-stone-300 transition-colors"
          >
            다음 →
          </button>
        </div>
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap gap-4 text-xs text-stone-500">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />주일예배</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />구역모임</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />청년부</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />특별행사</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />새벽기도</span>
      </div>

      {/* 달력 그리드 */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 border-b border-stone-200">
          {DAY_LABELS.map((day, idx) => (
            <div
              key={day}
              className={`py-3 text-center text-xs font-bold tracking-wider
                ${idx === 0 ? 'text-rose-500' : idx === 6 ? 'text-blue-500' : 'text-stone-400'}
              `}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 행 */}
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-stone-100 last:border-b-0">
            {week.map((day, di) => {
              const isToday = day === TODAY
              const isSun = di === 0
              const isSat = di === 6
              const events = day ? (EVENTS[day] || []) : []

              return (
                <div
                  key={di}
                  className={`min-h-[90px] p-2 border-r border-stone-100 last:border-r-0
                    ${day ? 'hover:bg-stone-50 transition-colors' : 'bg-stone-50/50'}
                  `}
                >
                  {day && (
                    <>
                      {/* 날짜 숫자 */}
                      <div className="flex justify-start mb-1">
                        <span
                          className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full
                            ${isToday
                              ? 'bg-amber-500 text-white'
                              : isSun
                              ? 'text-rose-500'
                              : isSat
                              ? 'text-blue-500'
                              : 'text-slate-600'
                            }
                          `}
                        >
                          {day}
                        </span>
                      </div>
                      {/* 일정 이벤트 */}
                      <div className="space-y-0.5">
                        {events.map((ev, ei) => (
                          <div
                            key={ei}
                            className={`${ev.color} text-white text-xs rounded px-1.5 py-0.5 truncate font-medium`}
                          >
                            {ev.label}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ScheduleTab
