import { useAdmin } from '../AdminContext'
import { useState, useRef } from 'react'
import { supabase } from '../supabase'

export default function Header({ activeTab, setActiveTab, tabs }) {
  const { isAdmin } = useAdmin()
  const fileInputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleTabClick = async (tabId) => {
    if (tabId === 'bulletin') {
      if (isAdmin) {
        fileInputRef.current?.click()
      } else {
        try {
          const { data } = supabase.storage.from('bulletins').getPublicUrl('latest_bulletin.pdf')
          if (data && data.publicUrl) {
            try {
              const response = await fetch(data.publicUrl)
              
              if (response.status === 404) {
                alert('아직 관리자가 주보를 업로드하지 않았거나 파일을 찾을 수 없습니다.')
                return
              }
              
              if (!response.ok) throw new Error('Network Error')
              
              const blob = await response.blob()
              const downloadUrl = window.URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.href = downloadUrl
              link.download = '전주옛길교회_주보.pdf'
              document.body.appendChild(link)
              link.click()
              link.remove()
              window.URL.revokeObjectURL(downloadUrl)
            } catch (fetchErr) {
              // CORS 등의 문제로 fetch가 실패한 경우에만 직접 열기 시도
              window.open(data.publicUrl, '_blank')
            }
          }
        } catch (err) {
          alert('등록된 주보가 없습니다.')
        }
      }
      return
    }
    setActiveTab(tabId)
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      alert('PDF 파일만 업로드 가능합니다.')
      e.target.value = ''
      return
    }

    setIsUploading(true)
    try {
      const { data, error } = await supabase.storage
        .from('bulletins')
        .upload('latest_bulletin.pdf', file, { upsert: true, contentType: 'application/pdf' })
      
      if (error) {
        if (error.message.includes('Bucket not found') || error.message.includes('not exist')) {
          alert('오류: Supabase Storage에 "bulletins"라는 이름의 Public 버킷을 생성해 주세요!')
        } else {
          throw error
        }
      } else {
        alert('주보가 성공적으로 업로드되었습니다!')
      }
    } catch (err) {
      console.error(err)
      alert(`업로드 실패: ${err.message}`)
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-[#eaddb1] shadow-sm sticky top-0 z-50">
      {/* Logo Section */}
      <div className="flex items-center justify-center gap-3 py-4 border-b border-[#eaddb1]/30">
        <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden shadow-sm bg-white flex items-center justify-center border border-[#eaddb1]/50">
          <img src="/logo.jpg" alt="전주옛길교회 로고" className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#8a7258] tracking-wide">
            전주옛길교회
          </h1>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <nav className="flex overflow-x-auto no-scrollbar border-t border-[#eaddb1]/30 relative">
        {isUploading && (
          <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-sm flex items-center justify-center">
            <span className="text-xs font-bold text-[#8a7258] animate-pulse">주보 업로드 중...</span>
          </div>
        )}
        <div className="flex w-full max-w-5xl mx-auto px-2 py-2 gap-1 sm:gap-2">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id
            const isBulletin = tab.id === 'bulletin'
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`
                  flex-1 min-w-[72px] sm:min-w-[90px] flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-b from-[#8cc4d8]/10 to-[#c0a080]/10 border border-[#c0a080]/30 shadow-sm' 
                    : 'hover:bg-[#fbf7da]/50 border border-transparent'
                  }
                  ${isBulletin && isAdmin ? 'border-dashed border-[#8cc4d8] bg-[#8cc4d8]/5' : ''}
                `}
              >
                <span className={`text-xl sm:text-2xl transition-transform duration-300 ${isActive ? 'scale-110' : 'grayscale-[0.3]'}`}>
                  {tab.icon}
                </span>
                <span className={`text-[11px] sm:text-xs font-bold tracking-tight text-center leading-tight ${isActive ? 'text-[#8a7258]' : 'text-stone-400'}`}>
                  {tab.label}
                  {isBulletin && isAdmin && <span className="block text-[9px] text-[#8cc4d8] mt-0.5 font-semibold">업로드</span>}
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      <input 
        type="file" 
        accept="application/pdf" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />
    </header>
  );
}
