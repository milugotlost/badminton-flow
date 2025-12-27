-- 1. Create Courts Table
create table courts (
  id text primary key,
  name text not null,
  status text not null default 'empty', -- 'empty' or 'occupied'
  match_start_time bigint,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Players Table
create table players (
  id text primary key,
  display_name text not null,
  photo_url text,
  status text not null default 'queueing', -- 'queueing', 'ready', 'playing'
  court_id text references courts(id), -- If playing, which court
  check_in_time bigint not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable Realtime
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table courts, players;

-- 4. ROW LEVEL SECURITY
alter table courts enable row level security;
alter table players enable row level security;

create policy "Anon Read Courts"      on courts  for select using (true);
create policy "Anon Insert Courts"    on courts  for insert with check (true);
create policy "Anon Update Courts"    on courts  for update using (true);
create policy "Anon Delete Courts"    on courts  for delete using (true);

create policy "Anon Read Players"     on players for select using (true);
create policy "Anon Insert Players"   on players for insert with check (true);
create policy "Anon Update Players"   on players for update using (true);
create policy "Anon Delete Players"   on players for delete using (true);

-- 5. Insert Default Courts
insert into courts (id, name) values 
('1', '1 號場'),
('2', '2 號場'),
('3', '3 號場')
on conflict (id) do nothing;
