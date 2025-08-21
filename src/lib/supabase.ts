import { createClient } from '@supabase/supabase-js'

// Supabase 설정
const supabaseUrl = 'https://zuesdeadfmbhmksqlsao.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1ZXNkZWFkZm1iaG1rc3Fsc2FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NDAxNTUsImV4cCI6MjA3MTMxNjE1NX0.9DcnOLDkT3zgVZsrQ37ggbHI-94dBq7xM2lTBDtvc4I'

// 환경 변수가 있으면 사용, 없으면 하드코딩된 값 사용
const url = import.meta.env.VITE_SUPABASE_URL || supabaseUrl
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || supabaseKey

export const supabase = createClient(url, key)