# 📝 Todo App with Supabase

React + TypeScript + Vite + shadcn/ui + Supabase로 구축된 실시간 할일 관리 애플리케이션

## ✨ 주요 기능

- ✅ **할일 관리**: 추가, 삭제, 완료 상태 변경
- 🔄 **실시간 동기화**: 여러 브라우저/탭에서 자동 업데이트
- ☁️ **클라우드 저장**: Supabase를 통한 데이터 영구 저장
- 🎨 **모던 UI**: shadcn/ui 컴포넌트 기반의 세련된 디자인
- 📱 **반응형 디자인**: 모바일, 태블릿, 데스크톱 지원
- 🌓 **다크 모드 지원**: 시스템 테마 자동 감지
- 📊 **통계 대시보드**: 전체, 진행 중, 완료된 할일 수 표시
- 🔍 **필터링**: 전체/진행 중/완료 상태별 필터

## 🛠 기술 스택

### Frontend
- **React 19** - 사용자 인터페이스 구축
- **TypeScript** - 타입 안정성
- **Vite** - 빠른 개발 서버 및 빌드
- **Tailwind CSS** - 유틸리티 기반 스타일링
- **shadcn/ui** - 재사용 가능한 UI 컴포넌트
- **Lucide React** - 아이콘

### Backend
- **Supabase** - 백엔드 서비스 (PostgreSQL, 실시간 구독, 인증)

## 📦 설치 방법

### 1. 저장소 클론
```bash
git clone https://github.com/your-username/todo-app-shadcn.git
cd todo-app-shadcn
```

### 2. 의존성 설치
```bash
npm install
```

### 3. Supabase 설정

#### 3.1 Supabase 프로젝트 생성
1. [Supabase](https://supabase.com)에 가입
2. 새 프로젝트 생성
3. 프로젝트 설정에서 URL과 Anon Key 확인

#### 3.2 환경 변수 설정
`.env` 파일을 생성하고 다음 내용 입력:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 3.3 데이터베이스 테이블 생성
Supabase SQL Editor에서 다음 SQL 실행:

```sql
-- todos 테이블 생성
CREATE TABLE IF NOT EXISTS todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성 (쿼리 성능 향상)
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at DESC);

-- Row Level Security 활성화
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- 모든 작업 허용 정책 (필요시 수정)
CREATE POLICY "Allow all operations on todos" ON todos
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_todos_updated_at 
  BEFORE UPDATE ON todos 
  FOR EACH ROW 
  EXECUTE PROCEDURE update_updated_at_column();
```

### 4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:5173](http://localhost:5173) 접속

## 🚀 배포

### Vercel 배포
```bash
npm run build
vercel --prod
```

### Netlify 배포
```bash
npm run build
netlify deploy --prod --dir=dist
```

## 📁 프로젝트 구조

```
todo-app-shadcn/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui 컴포넌트
│   │   ├── TodoApp.tsx      # 로컬 스토리지 버전
│   │   ├── TodoAppSupabase.tsx  # Supabase 연동 버전
│   │   └── TodoAppPro.tsx   # Pro 버전
│   ├── lib/
│   │   ├── utils.ts         # 유틸리티 함수
│   │   └── supabase.ts      # Supabase 클라이언트
│   ├── services/
│   │   └── todoService.ts   # Todo CRUD 서비스
│   ├── types/
│   │   └── todo.ts          # TypeScript 타입 정의
│   ├── App.tsx              # 메인 앱 컴포넌트
│   └── main.tsx             # 진입점
├── supabase/
│   └── schema.sql           # 데이터베이스 스키마
├── .env.example             # 환경 변수 예시
└── package.json
```

## 🎯 사용 방법

### 할일 추가
1. 입력 필드에 할일 입력
2. Enter 키 또는 + 버튼 클릭

### 할일 완료
- 체크박스 클릭하여 완료 상태 변경

### 할일 삭제
- 휴지통 아이콘 클릭

### 필터링
- 전체/진행 중/완료 버튼으로 필터링

### 완료된 항목 일괄 삭제
- 하단의 "완료된 항목 모두 삭제" 버튼 클릭

## 🔧 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview

# 린트 검사
npm run lint

# 타입 체크
npm run type-check
```

## 🤝 기여 방법

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일 참조

## 👨‍💻 개발자

- GitHub: [@your-username](https://github.com/your-username)

## 🙏 감사의 글

- [shadcn/ui](https://ui.shadcn.com/) - 아름다운 UI 컴포넌트
- [Supabase](https://supabase.com/) - 강력한 백엔드 서비스
- [Vite](https://vitejs.dev/) - 빠른 개발 환경

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해주세요.

---

**Made with ❤️ using React + shadcn/ui + Supabase**