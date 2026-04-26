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

function MainTab() {
  return (
    <div className="space-y-8">

      {/* ① 현재 시간 뼈대 */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 px-8 py-10 text-center">
        <p className="text-xs font-semibold text-stone-400 tracking-[0.25em] uppercase mb-3">
          현재 시각
        </p>
        <p className="text-7xl font-thin text-slate-700 tracking-widest tabular-nums select-none">
          12:00:00
        </p>
        <p className="text-stone-400 mt-3 text-sm tracking-wide">2026년 4월 26일 일요일</p>
      </div>

      {/* ② 금주의 암송 말씀 배너 */}
      <div className="rounded-2xl overflow-hidden shadow-sm border border-amber-200">
        <div className="bg-gradient-to-br from-amber-50 via-stone-50 to-amber-100 px-8 py-10 text-center relative">
          {/* 배경 장식 따옴표 */}
          <span className="absolute top-4 left-6 text-6xl text-amber-300 font-serif leading-none select-none">"</span>
          <span className="absolute bottom-2 right-6 text-6xl text-amber-300 font-serif leading-none select-none">"</span>

          <span className="inline-block bg-amber-500 text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-widest mb-5">
            ✦ 금주의 암송 말씀
          </span>

          <blockquote className="text-xl font-medium text-slate-700 leading-relaxed max-w-2xl mx-auto">
            내가 진실로 진실로 너희에게 이르노니 나를 믿는 자는 내가 하는 일을
            그도 할 것이요 또한 그보다 큰 일도 하리니 이는 내가 아버지께로 감이라.
          </blockquote>

          <p className="mt-5 text-amber-700 font-bold tracking-wide">요한복음 14:12</p>
        </div>
      </div>

      {/* ③ 교회 소식 */}
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
