function Footer() {
  return (
    <footer className="bg-slate-800 text-slate-400 py-7 mt-8">
      <div className="max-w-5xl mx-auto px-4 text-center space-y-1.5">
        <p className="text-base font-semibold text-slate-200">열린교회</p>
        <p className="text-sm">📍 서울특별시 강남구 테헤란로 123, 열린교회빌딩 3층</p>
        <p className="text-sm">
          📞 02-123-4567 &nbsp;|&nbsp; ✉️ info@openchurch.kr
        </p>
        <div className="pt-2 border-t border-slate-700 mt-3">
          <p className="text-xs text-slate-500">© 2026 열린교회. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
