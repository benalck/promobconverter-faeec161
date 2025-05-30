
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://npnkmbflfflqpjwhxbfu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wbmttYmZsZmZscXBqd2h4YmZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMTczNzQsImV4cCI6MjA1Njc5MzM3NH0.GeMbI1QFKmH9GKDnq-rUQaGhhOaCIlAPHFg5Q68BOaU";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    // Define timeouts to prevent indefinitely pending operations
    fetch: (url, options) => {
      const timeoutController = new AbortController();
      const timeoutId = setTimeout(() => timeoutController.abort(), 30000); // 30 seconds
      
      return fetch(url, {
        ...options,
        signal: timeoutController.signal
      }).finally(() => {
        clearTimeout(timeoutId);
      });
    }
  }
});

// Admin client for operations that require service_role
// Important: Only use this on the server side or in protected admin routes
export const getAdminAuthClient = () => {
  // In production, the service role key would be loaded from environment variables
  // This is just for development purposes
  const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_SERVICE_ROLE) {
    console.warn('No service role key available, falling back to standard client');
    return supabase;
  }
  
  // Create a separate client with service_role permissions
  return createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
};
