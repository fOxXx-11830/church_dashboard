function BibleTab() {
  return (
    <div className="space-y-6">

      {/* 탭 제목 */}
      <div>
        <h2 className="text-xl font-bold text-slate-700">이번 주 말씀</h2>
        <p className="text-stone-400 text-sm mt-1">요한복음 14장 1-14절 &nbsp;|&nbsp; 담임목사 홍길동</p>
      </div>

      {/* 유튜브 플레이어 더미 박스 */}
      <div
        className="w-full rounded-2xl overflow-hidden shadow-lg bg-slate-800 flex items-center justify-center"
        style={{ aspectRatio: '16/9' }}
      >
        <div className="text-center space-y-3">
          {/* 재생 버튼 아이콘 */}
          <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center mx-auto backdrop-blur-sm">
            <svg className="w-9 h-9 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <p className="text-slate-300 text-sm font-medium">유튜브 영상이 여기에 표시됩니다</p>
          <p className="text-slate-500 text-xs">Firebase 연동 후 설교 영상 URL이 자동으로 불러와집니다</p>
        </div>
      </div>

      {/* 성경 본문 강해 텍스트 영역 */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-2.5 pb-4 border-b border-stone-100">
          <span className="text-xl">📖</span>
          <div>
            <h3 className="font-bold text-slate-700">말씀 본문 &amp; 강해</h3>
            <p className="text-xs text-stone-400">요한복음 14:1-14</p>
          </div>
        </div>

        {/* 성경 본문 */}
        <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl px-5 py-4 space-y-2">
          <p className="text-sm text-slate-600 leading-relaxed">
            <span className="font-bold text-amber-700 mr-1.5">1절</span>
            너희는 마음에 근심하지 말라 하나님을 믿으니 또 나를 믿으라.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            <span className="font-bold text-amber-700 mr-1.5">2절</span>
            내 아버지 집에 거할 곳이 많도다 그렇지 않으면 너희에게 일렀으리라 내가 너희를 위하여 거처를 예비하러 가노니.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            <span className="font-bold text-amber-700 mr-1.5">6절</span>
            예수께서 이르시되 내가 곧 길이요 진리요 생명이니 나로 말미암지 않고는 아버지께로 올 자가 없느니라.
          </p>
        </div>

        {/* 강해 텍스트 */}
        <div className="space-y-3 text-sm text-stone-600 leading-relaxed">
          <p>
            오늘 본문에서 예수님은 제자들의 흔들리는 마음을 붙잡아 주십니다. "마음에 근심하지 말라"는 말씀은 단순한 위로가 아니라, 하나님과의 신뢰 관계 위에 세워진 강력한 선언입니다.
          </p>
          <p>
            예수님은 스스로를 "길, 진리, 생명"이라고 선언하십니다. 이는 구원의 유일성과 완전성을 나타내는 동시에, 믿는 자들에게 더 큰 일을 행할 것을 약속하시는 은혜의 말씀입니다.
          </p>
          <p className="text-stone-400 italic text-xs">
            ※ 이 강해 내용은 Firebase 연동 후 목사님이 직접 업로드하신 내용으로 대체됩니다.
          </p>
        </div>
      </div>

    </div>
  )
}

export default BibleTab
