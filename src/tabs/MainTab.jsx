import { useState, useEffect } from 'react'

// ─── 상수 ────────────────────────────────────────────────
const DAY_KO = ['주일', '월', '화', '수', '목', '금', '토']

const DUMMY_NEWS = [
  { id: 1, date: '2026.04.27', title: '5월 가정의 달 특별 예배 안내', badge: '예배' },
  { id: 2, date: '2026.04.25', title: '2026년 상반기 교회 수련회 참가 신청 안내', badge: '행사' },
  { id: 3, date: '2026.04.20', title: '교회 주차 봉사자 모집 공고', badge: '안내' },
]

const BADGE_STYLE = {
  '예배': 'bg-blue-100 text-blue-700 border-blue-200',
  '행사': 'bg-amber-100 text-amber-700 border-amber-200',
  '안내': 'bg-stone-100 text-stone-600 border-stone-200',
}

// ─── 시간 포맷 함수 ───────────────────────────────────────
function formatDateTime(date) {
  const year    = date.getFullYear()
  const month   = date.getMonth() + 1
  const day     = date.getDate()
  const dayName = DAY_KO[date.getDay()]
  const h24     = date.getHours()
  const ampm    = h24 < 12 ? '오전' : '오후'
  const h12     = String(h24 % 12 || 12).padStart(2, '0')
  const min     = String(date.getMinutes()).padStart(2, '0')
  const sec     = String(date.getSeconds()).padStart(2, '0')
  return {
    date: `${year}년 ${month}월 ${day}일 (${dayName})`,
    time: `${ampm} ${h12}:${min}:${sec}`,
  }
}

// ─── 실시간 시계 컴포넌트 ─────────────────────────────────
function LiveClock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)   // 언마운트 시 정리
  }, [])

  const { date, time } = formatDateTime(now)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 px-8 py-10 text-center select-none">
      <p className="text-xs font-semibold text-stone-400 tracking-[0.25em] uppercase mb-4">
        현재 시각
      </p>
      {/* 시간 — 큰 숫자 */}
      <p className="text-6xl font-light text-slate-700 tracking-widest tabular-nums">
        {time}
      </p>
      {/* 날짜 */}
      <p className="text-stone-400 mt-3 text-base tracking-wide">
        {date}
      </p>
    </div>
  )
}

// ─── 히어로 배너 컴포넌트 ─────────────────────────────────
function VerseBanner() {
  return (
    <div
      className="relative rounded-2xl overflow-hidden shadow-lg border border-stone-200"
      style={{
        background: 'linear-gradient(135deg, #fdfcf9 0%, #f5f0e6 45%, #ede8db 100%)',
      }}
    >
      {/* 좌측 골드 세로 라인 장식 */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-300 rounded-l-2xl" />

      {/* 배경 수묵화 느낌 원형 장식 */}
      <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #c4a052 0%, transparent 70%)' }} />
      <div className="absolute -bottom-10 -left-4 w-36 h-36 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #a07840 0%, transparent 70%)' }} />

      <div className="px-10 py-12 pl-12 relative">
        {/* 뱃지 */}
        <span className="inline-flex items-center gap-1.5 bg-amber-600/10 text-amber-700 text-xs font-bold
          px-3 py-1.5 rounded-full tracking-widest border border-amber-400/30 mb-6">
          ✦ 금주의 암송 말씀
        </span>

        {/* 오프닝 따옴표 */}
        <div className="text-5xl text-amber-400/60 font-serif leading-none mb-2 select-none">
          "
        </div>

        {/* 말씀 본문 — 핵심 타이포그래피 */}
        <blockquote
          className="text-2xl text-slate-700 leading-[1.85] tracking-wide max-w-2xl"
          style={{ fontFamily: '"Noto Serif KR", "Noto Sans KR", Georgia, serif' }}
        >
          여호와는 나의 목자시니 내게 부족함이 없으리로다
        </blockquote>

        {/* 클로징 따옴표 + 출처 — 우측 하단 정렬 */}
        <div className="flex items-end justify-between mt-5">
          <div className="text-5xl text-amber-400/60 font-serif leading-none select-none self-end">
            "
          </div>
          <div className="text-right">
            <p className="text-amber-700 font-semibold text-sm tracking-widest">
              — 시편 23:1 —
            </p>
            <p className="text-stone-400 text-xs mt-0.5 tracking-wide">Psalms 23:1</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── 메인 탭 ─────────────────────────────────────────────
function MainTab() {
  return (
    <div className="space-y-8">

      {/* ① 실시간 시계 */}
      <LiveClock />

      {/* ② 금주의 암송 말씀 히어로 배너 */}
      <VerseBanner />

      {/* ③ 교회 소식 — 기존 유지 */}
      <div>
        <h2 className="text-base font-bold text-slate-700 mb-4 flex items-center gap-2.5">
          <span className="w-1 h-5 bg-amber-500 rounded-full inline-block" />
          교회 소식
        </h2>
        <div className="space-y-3">
          {DUMMY_NEWS.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-stone-200 shadow-sm px-5 py-4 flex items-center gap-4 hover:border-amber-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
            >
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${BADGE_STYLE[item.badge]}`}>
                {item.badge}
              </span>
              <span className="flex-1 text-slate-700 font-medium group-hover:text-slate-900 transition-colors">
                {item.title}
              </span>
              <span className="text-xs text-stone-400 shrink-0">{item.date}</span>
              <span className="text-stone-300 group-hover:text-amber-400 transition-colors shrink-0">›</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

export default MainTab
