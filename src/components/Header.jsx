function Header({ activeTab, setActiveTab, tabs }) {
  return (
    <header className="bg-slate-800 shadow-xl">
      {/* 로고 영역 */}
      <div className="flex flex-col items-center pt-7 pb-4">
        <div className="flex items-center gap-3">
          {/* 십자가 SVG 아이콘 */}
          <svg viewBox="0 0 40 44" className="w-10 h-11" fill="none">
            <rect x="15" y="2"  width="10" height="40" rx="3" fill="#f59e0b" />
            <rect x="4"  y="14" width="32" height="10" rx="3" fill="#f59e0b" />
          </svg>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide leading-tight">열린교회</h1>
            <p className="text-xs text-amber-400 tracking-[0.3em] font-light">OPEN CHURCH</p>
          </div>
        </div>
      </div>

      {/* 탭 내비게이션 */}
      <nav className="flex justify-center">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-5 py-3 text-sm font-medium transition-all duration-200 focus:outline-none
                ${activeTab === tab.id
                  ? 'text-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              <span className="mr-1.5">{tab.icon}</span>
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-t-sm" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </header>
  )
}

export default Header
