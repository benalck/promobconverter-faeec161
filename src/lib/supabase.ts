
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const supabaseUrl = 'https://npnkmbflfflqpjwhxbfu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wbmttYmZsZmZscXBqd2h4YmZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMTczNzQsImV4cCI6MjA1Njc5MzM3NH0.GeMbI1QFKmH9GKDnq-rUQaGhhOaCIlAPHFg5Q68BOaU';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
