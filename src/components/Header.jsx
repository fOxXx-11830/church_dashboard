function Header({ activeTab, setActiveTab, tabs }) {
  return (
    <header className="bg-gradient-to-b from-sky-600 via-sky-500 to-sky-400 shadow-lg relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-white rounded-full blur-2xl -translate-y-1/3" />
      </div>

      {/* Logo area */}
      <div className="relative flex flex-col items-center pt-6 pb-4">
        <div className="flex items-center gap-4">
          {/* Church Logo Image */}
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden shadow-lg border-2 border-white/30 bg-white">
            <img 
              src="/images/church-logo.jpg" 
              alt="교회 로고" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide leading-tight drop-shadow-sm">
              열린교회
            </h1>
            <p className="text-xs md:text-sm text-sky-100 tracking-[0.2em] font-light">
              OPEN CHURCH
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <nav className="relative flex justify-center px-2 pb-1">
        <div className="flex bg-white/10 rounded-xl p-1 backdrop-blur-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-3 sm:px-5 py-2.5 text-xs sm:text-sm font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50
                ${activeTab === tab.id
                  ? 'bg-white text-sky-700 shadow-md'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
            >
              <span className="mr-1 sm:mr-1.5 hidden sm:inline">{tab.icon}</span>
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </header>
  )
}

export default Header
