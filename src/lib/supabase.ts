
import { createClient } from '@supabase/supabase-js'

// These environment variables are automatically available when deployed
const supabaseUrl = "https://npnkmbflfflqpjwhxbfu.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wbmttYmZsZmZscXBqd2h4YmZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk3NzI5MjUsImV4cCI6MjAzNTM0ODkyNX0.o7ZO6EM7Mb9EWJ45dj7IEJo3G4fGbpfDq4ZC58nYKfo"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

