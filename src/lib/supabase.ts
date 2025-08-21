import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ejanzfmdtbaoiomijyou.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqYW56Zm1kdGJhb2lvbWlqeW91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NTM0MTMsImV4cCI6MjA3MTMyOTQxM30.R7dcuRNQC24ABhLn4Tv7qbh1IdeLjNXrSGz3qs74LBo'
const supabase = createClient(supabaseUrl, supabaseKey)

export { supabase }