# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 접속하여 계정을 생성합니다.
2. 새 프로젝트를 생성합니다.
3. 프로젝트 설정에서 다음 정보를 확인합니다:
   - Project URL
   - Anon Key

## 2. 환경 변수 설정

`.env` 파일을 열고 다음 정보를 입력합니다:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 3. 데이터베이스 테이블 생성

1. Supabase 대시보드에서 SQL Editor로 이동합니다.
2. `supabase/schema.sql` 파일의 내용을 복사하여 실행합니다.
3. 또는 아래 SQL을 직접 실행합니다:

```sql
-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an index on created_at for better query performance
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now
CREATE POLICY "Allow all operations on todos" ON todos
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_todos_updated_at 
  BEFORE UPDATE ON todos 
  FOR EACH ROW 
  EXECUTE PROCEDURE update_updated_at_column();
```

## 4. 실시간 구독 활성화 (선택사항)

1. Supabase 대시보드에서 Database > Replication으로 이동합니다.
2. `todos` 테이블을 찾아 Replication을 활성화합니다.
3. 이렇게 하면 여러 브라우저나 탭에서 실시간으로 동기화됩니다.

## 5. 애플리케이션 실행

```bash
npm run dev
```

애플리케이션이 자동으로 Supabase와 연동됩니다!

## 기능

- ✅ 실시간 동기화
- ✅ 클라우드 저장
- ✅ 여러 기기에서 접근 가능
- ✅ 자동 타임스탬프
- ✅ 빠른 쿼리를 위한 인덱싱

## 문제 해결

### 환경 변수가 로드되지 않는 경우
- 개발 서버를 재시작하세요: `npm run dev`

### CORS 에러가 발생하는 경우
- Supabase 대시보드에서 Authentication > URL Configuration을 확인하세요
- 로컬 개발 URL (http://localhost:5173)이 허용되어 있는지 확인하세요

### 데이터가 저장되지 않는 경우
- RLS 정책이 올바르게 설정되어 있는지 확인하세요
- Anon Key가 올바른지 확인하세요