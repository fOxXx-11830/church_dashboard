import { CalendarDays, MessageCircleQuestion, BookOpenText } from "lucide-react"

const ICONS = {
  main: BookOpenText,
  bible: BookOpenText,
  qna: MessageCircleQuestion,
  schedule: CalendarDays,
}

function Header({ activeTab, setActiveTab, tabs }) {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-[#eaddb1] shadow-sm sticky top-0 z-50">
      {/* Logo Section */}
      <div className="flex items-center justify-center gap-3 py-4 border-b border-[#eaddb1]/30">
        <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden shadow-sm bg-gradient-to-b from-[#8cc4d8] to-[#c0a080] flex items-center justify-center">
          <svg viewBox="0 0 40 44" className="w-8 h-8 drop-shadow-md" fill="none">
            <rect x="15" y="2"  width="10" height="40" rx="3" fill="#fbf7da" />
            <rect x="4"  y="14" width="32" height="10" rx="3" fill="#fbf7da" />
          </svg>
        </div>
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#8a7258] tracking-wide">
            열린교회
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-4 py-2 overflow-x-auto">
        <ul className="flex items-center justify-center gap-1 md:gap-2 min-w-max mx-auto">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            const Icon = ICONS[tab.id] || BookOpenText;
            return (
              <li key={tab.id}>
                <button
                  id={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#b59e84] text-white shadow-sm"
                      : "text-[#a18c73] hover:bg-[#fbf7da] hover:text-[#8a7258]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "animate-pulse" : ""}`} />
                  {tab.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}

export default Header
