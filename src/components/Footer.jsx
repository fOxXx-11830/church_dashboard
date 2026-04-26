import { Heart, MapPin, Phone, Coffee, Lock, Unlock } from "lucide-react"
import { useAdmin } from '../AdminContext'

function Footer({ onAdminLoginClick }) {
  const { isAdmin, setIsAdmin } = useAdmin()

  return (
    <footer className="border-t border-[#eaddb1]/60 bg-white/40 backdrop-blur-sm py-10 mt-auto">
      <div className="flex flex-col items-center justify-center gap-4 px-4 text-center max-w-2xl mx-auto">
        <p className="text-xl font-bold text-[#8a7258] mb-1 font-serif tracking-wide">전주옛길교회</p>
        
        <div className="text-sm text-stone-600 space-y-2.5">
          <p className="flex items-center justify-center gap-2">
            목사 <span className="text-[#a18c73] font-black text-lg tracking-[0.2em] ml-1">황 철 민</span>
          </p>
          <p className="flex items-center justify-center gap-1.5 break-keep">
            <MapPin className="w-3.5 h-3.5 text-[#8cc4d8] shrink-0" />
            <span>전주시 덕진구 견훤로 247 송동물센터 3층 (인후1가 448-33)</span>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 pt-1">
            <p className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#c0a080] shrink-0" />
              010-2656-0125
            </p>
            <p className="flex items-center gap-1.5">
              <Coffee className="w-3.5 h-3.5 text-[#c0a080] shrink-0" />
              <a href="http://cafe.naver.com/reformedjj" target="_blank" rel="noreferrer" className="hover:text-[#a18c73] transition-colors underline underline-offset-4 decoration-[#eaddb1]">
                cafe.naver.com/reformedjj
              </a>
            </p>
          </div>
        </div>

        <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#eaddb1] to-transparent my-4" />

        <div className="flex flex-col sm:flex-row items-center justify-between w-full max-w-sm gap-4">
          <p className="text-xs text-stone-400">
            © {new Date().getFullYear()} 전주옛길교회.
          </p>
          
          <button 
            onClick={() => isAdmin ? setIsAdmin(false) : onAdminLoginClick()}
            className="flex items-center gap-1.5 text-[11px] text-stone-400 hover:text-stone-600 transition-colors font-medium bg-white/50 px-3 py-1.5 rounded-full border border-stone-200"
          >
            {isAdmin ? (
              <><Lock className="w-3 h-3 text-rose-400" /> 관리자 모드 종료</>
            ) : (
              <><Unlock className="w-3 h-3 text-[#a18c73]" /> 관리자 모드 진입</>
            )}
          </button>
        </div>
      </div>
    </footer>
  )
}

export default Footer
