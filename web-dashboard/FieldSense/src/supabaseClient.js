import { createClient } from "@supabase/supabase-js";

// Replace with your real Supabase project URL and anon key
const supabaseUrl = "https://jacxtluxhninfejndrjm.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphY3h0bHV4aG5pbmZlam5kcmptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MzM2NDcsImV4cCI6MjA5MzQwOTY0N30.y2E8C9pER3IbH4vcFGeql-yQBJa8mNJc8vdwGHwsuec";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
