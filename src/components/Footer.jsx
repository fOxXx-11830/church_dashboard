function Footer({ onAdminClick }) {
  return (
    <footer className="bg-gradient-to-b from-slate-800 to-slate-900 text-slate-400 py-8 mt-auto relative">
      <div className="max-w-5xl mx-auto px-4 text-center space-y-2">
        <p className="text-base font-semibold text-white flex items-center justify-center gap-2">
          <span className="text-sky-400">✝</span>
          열린교회
        </p>
        <p className="text-sm flex items-center justify-center gap-1.5">
          <span>📍</span>
          <span>서울특별시 강남구 테헤란로 123, 열린교회빌딩 3층</span>
        </p>
        <p className="text-sm flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <span className="flex items-center gap-1.5">
            <span>📞</span>
            <span>02-123-4567</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1.5">
            <span>✉️</span>
            <span>info@openchurch.kr</span>
          </span>
        </p>
        <div className="pt-3 border-t border-slate-700/50 mt-4">
          <p className="text-xs text-slate-500">© 2026 열린교회. All rights reserved.</p>
        </div>
      </div>

      {/* Admin Lock Icon - small and subtle in bottom right corner */}
      <button
        onClick={onAdminClick}
        className="absolute bottom-3 right-3 p-2 text-slate-600 hover:text-slate-400 transition-colors rounded-lg hover:bg-slate-700/30 group"
        title="관리자 로그인"
        aria-label="관리자 로그인"
      >
        <svg 
          className="w-4 h-4 opacity-40 group-hover:opacity-70 transition-opacity" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
          />
        </svg>
      </button>
    </footer>
  )
}

export default Footer
