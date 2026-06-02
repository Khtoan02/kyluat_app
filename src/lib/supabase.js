import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseKey)

// SQL to run in Supabase SQL editor:
// 
// create table checkins (
//   id uuid default gen_random_uuid() primary key,
//   user_id uuid references auth.users not null,
//   date date not null,
//   slot_id text not null,
//   checked_at timestamptz,
//   status text default 'pending', -- 'on_time' | 'late' | 'missed' | 'pending'
//   delay_minutes int default 0,
//   created_at timestamptz default now(),
//   unique(user_id, date, slot_id)
// );
// 
// alter table checkins enable row level security;
// create policy "Users can manage own checkins" on checkins
//   for all using (auth.uid() = user_id);
