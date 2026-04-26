import { useState } from 'react'

const DUMMY_QNA = [
  {
    id: 1,
    nickname: '믿음이',
    question: '천국에서는 우리가 서로 알아볼 수 있나요?',
    answer: '성경은 천국에서의 완전한 지식을 약속합니다(고전 13:12). 많은 신학자들은 우리가 서로를 알아볼 수 있다고 믿으며, 변화산에서 제자들이 모세와 엘리야를 알아본 것이 좋은 예가 됩니다.',
    date: '2026.04.24',
  },
  {
    id: 2,
    nickname: '소망나무',
    question: '기도할 때 집중이 잘 안 돼서 너무 힘든데 어떻게 해야 할까요?',
    answer: '기도 중 집중이 안 되는 것은 매우 자연스러운 현상입니다. 짧고 구체적인 기도로 시작하거나, 기도 노트를 활용해 쓰면서 기도하는 방법이 도움이 됩니다. 하나님은 완벽한 언어보다 진실한 마음을 원하십니다.',
    date: '2026.04.22',
  },
  {
    id: 3,
    nickname: '새신자123',
    question: '세례와 침례의 차이가 무엇인가요?',
    answer: '세례(洗禮)는 물을 머리에 부어 주는 방식이고, 침례(浸禮)는 물속에 완전히 잠겼다 나오는 방식입니다. 두 방식 모두 예수님을 믿음으로 죄 씻음과 새로운 삶을 선언하는 동일한 의미를 가집니다.',
    date: '2026.04.19',
  },
]

function AccordionItem({ item }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
      <button
        id={`qna-item-${item.id}`}
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-4 flex items-start gap-3 text-left hover:bg-stone-50 transition-colors duration-150"
      >
        <span className="mt-0.5 shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">
          Q
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-700">{item.question}</p>
          <p className="text-xs text-stone-400 mt-1">{item.nickname} · {item.date}</p>
        </div>
        <span
          className={`shrink-0 text-stone-400 mt-0.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-stone-100">
          <div className="flex items-start gap-3 pt-4">
            <span className="shrink-0 w-6 h-6 rounded-full bg-slate-700 text-white text-xs font-bold flex items-center justify-center mt-0.5">
              A
            </span>
            <p className="text-sm text-slate-600 leading-relaxed">{item.answer}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function QnATab() {
  return (
    <div className="space-y-8">

      {/* 질문 입력 폼 */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
        <h2 className="text-base font-bold text-slate-700 mb-1 flex items-center gap-2">
          <span className="w-1 h-5 bg-amber-500 rounded-full inline-block" />
          익명으로 질문 남기기
        </h2>
        <p className="text-xs text-stone-400 mb-5">닉네임만 입력하고 익명으로 궁금한 점을 물어보세요.</p>

        <div className="space-y-3">
          <div className="flex gap-3">
            <input
              id="qna-nickname"
              type="text"
              placeholder="닉네임 (예: 믿음이)"
              className="w-36 px-4 py-2.5 rounded-lg border border-stone-200 text-sm text-slate-700 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
            />
            <input
              id="qna-title"
              type="text"
              placeholder="제목을 입력하세요"
              className="flex-1 px-4 py-2.5 rounded-lg border border-stone-200 text-sm text-slate-700 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
            />
          </div>

          <textarea
            id="qna-content"
            rows={4}
            placeholder="궁금한 점을 자유롭게 적어주세요..."
            className="w-full px-4 py-3 rounded-lg border border-stone-200 text-sm text-slate-700 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition resize-none"
          />

          <div className="flex justify-end">
            <button
              id="qna-submit"
              className="bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors duration-150"
            >
              질문 등록
            </button>
          </div>
        </div>
      </div>

      {/* 기존 Q&A 아코디언 목록 */}
      <div>
        <h3 className="text-base font-bold text-slate-700 mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-slate-600 rounded-full inline-block" />
          질문 목록
        </h3>
        <div className="space-y-3">
          {DUMMY_QNA.map((item) => (
            <AccordionItem key={item.id} item={item} />
          ))}
        </div>
      </div>

    </div>
  )
}

export default QnATab
