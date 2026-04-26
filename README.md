# ✝️ 교회 대시보드 (Church Dashboard)

React + Firebase 기반의 교회 전용 대시보드 웹 애플리케이션입니다.

## 🛠 기술 스택

- **Frontend**: React 19, Vite 8
- **Styling**: Tailwind CSS v4
- **Backend / DB**: Firebase (Firestore, Auth 예정)
- **Deployment**: Vercel

## 📁 프로젝트 구조

```
src/
├── App.jsx                 # 탭 상태 관리 (메인 진입점)
├── main.jsx
├── index.css               # Tailwind CSS 전역 스타일
├── firebase.js             # Firebase 초기화 (환경 변수 사용)
├── components/
│   ├── Header.jsx          # 교회 로고 + 탭 내비게이션
│   └── Footer.jsx          # 주소, 연락처, 저작권
└── tabs/
    ├── MainTab.jsx         # 시계, 암송 말씀 배너, 교회 소식
    ├── BibleTab.jsx        # 설교 영상(YouTube), 성경 강해
    ├── QnATab.jsx          # 익명 Q&A (아코디언)
    └── ScheduleTab.jsx     # 교회 일정 달력 그리드
```

## 🚀 로컬 실행

```bash
# 1. 저장소 클론
git clone https://github.com/fOxXx-11830/church_dashboard.git
cd church_dashboard

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env
# .env 파일을 열어 Firebase 설정값 입력

# 4. 개발 서버 실행
npm run dev
```

## 🔐 환경 변수 설정

`.env.example`을 복사해 `.env` 파일을 만들고, Firebase 콘솔에서 발급받은 값을 입력하세요.

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

> ⚠️ `.env` 파일은 `.gitignore`에 의해 GitHub에 절대 업로드되지 않습니다.

## 📋 주요 기능 (현재 구현)

- [x] 4개 탭 내비게이션 (메인 / 성경읽기 / 질문과 답변 / 교회일정)
- [x] 금주의 암송 말씀 배너
- [x] 교회 소식 리스트
- [x] 유튜브 영상 플레이어 영역
- [x] 익명 Q&A 아코디언 폼
- [x] 월별 교회 일정 달력 그리드
- [ ] 실시간 시계 (Firebase 연동 후 구현 예정)
- [ ] Firebase 데이터 연동

## 📄 License

© 2026 열린교회. All rights reserved.
