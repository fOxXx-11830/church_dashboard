import { Heart } from "lucide-react"

function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-white/50 py-8 mt-auto">
      <div className="flex flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-base font-semibold text-slate-800">열린교회</p>
        <p className="text-sm text-stone-500">📍 서울특별시 강남구 테헤란로 123, 열린교회빌딩 3층</p>
        <p className="text-sm text-stone-500">
          📞 02-123-4567 &nbsp;|&nbsp; ✉️ info@openchurch.kr
        </p>
        <p className="text-xs text-stone-400 mt-2">
          © {new Date().getFullYear()} 열린교회. All rights reserved.
        </p>
        <p className="flex items-center gap-1.5 text-xs text-stone-400">
          <span>Made with</span>
          <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
          <span>for our community</span>
        </p>
      </div>
    </footer>
  )
}

export default Footer
