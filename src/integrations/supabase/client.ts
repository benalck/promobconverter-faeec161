
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://npnkmbflfflqpjwhxbfu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wbmttYmZsZmZscXBqd2h4YmZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMTczNzQsImV4cCI6MjA1Njc5MzM3NH0.GeMbI1QFKmH9GKDnq-rUQaGhhOaCIlAPHFg5Q68BOaU";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
