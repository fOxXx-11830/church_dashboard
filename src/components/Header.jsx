import { CalendarDays, MessageCircleQuestion, BookOpenText } from "lucide-react"

const ICONS = {
  main: BookOpenText,
  bible: BookOpenText,
  qna: MessageCircleQuestion,
  schedule: CalendarDays,
}

function Header({ activeTab, setActiveTab, tabs }) {
  return (
    <header className="bg-white border-b border-stone-200 shadow-sm sticky top-0 z-50">
      {/* Logo Section */}
      <div className="flex items-center justify-center gap-3 py-4 border-b border-stone-200/50">
        <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden shadow-md bg-slate-800 flex items-center justify-center">
          <svg viewBox="0 0 40 44" className="w-8 h-8" fill="none">
            <rect x="15" y="2"  width="10" height="40" rx="3" fill="#f59e0b" />
            <rect x="4"  y="14" width="32" height="10" rx="3" fill="#f59e0b" />
          </svg>
        </div>
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-slate-800 tracking-wide">
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
                      ? "bg-slate-800 text-white shadow-sm"
                      : "text-stone-500 hover:bg-stone-100 hover:text-slate-800"
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
