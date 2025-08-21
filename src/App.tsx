import { useState } from 'react'
import TodoApp from './components/TodoApp'
import TodoAppSupabase from './components/TodoAppSupabase'
import TodoAppPro from './components/TodoAppPro'
import { Button } from './components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './components/ui/card'

function App() {
  const [mode, setMode] = useState<'local' | 'supabase' | 'pro'>('supabase')

  if (mode === 'local') {
    return <TodoApp />
  }

  if (mode === 'pro') {
    return <TodoAppPro />
  }

  // Supabase 설정 확인 - 하드코딩된 값이 있으므로 항상 true
  const hasSupabaseConfig = true

  if (!hasSupabaseConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 flex items-center justify-center">
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>Supabase 설정 필요</CardTitle>
            <CardDescription>
              Supabase를 사용하려면 환경 변수를 설정해주세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm">1. Supabase 프로젝트를 생성하세요</p>
              <p className="text-sm">2. .env 파일에 다음 정보를 입력하세요:</p>
              <pre className="bg-muted p-2 rounded text-xs">
                VITE_SUPABASE_URL=your_project_url{'\n'}
                VITE_SUPABASE_ANON_KEY=your_anon_key
              </pre>
              <p className="text-sm">3. supabase/schema.sql 파일의 SQL을 실행하세요</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setMode('local')} variant="outline">
                로컬 스토리지 버전 사용
              </Button>
              <Button onClick={() => setMode('pro')} variant="outline">
                Pro 버전 사용
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <TodoAppSupabase />
}

export default App