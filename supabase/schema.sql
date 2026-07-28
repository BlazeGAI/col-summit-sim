create table if not exists public.game_rooms (
  room_code text primary key,
  round_index integer not null default 0,
  phase text not null default 'lobby',
  resources jsonb not null default '{}'::jsonb,
  team_score integer not null default 0,
  submissions jsonb not null default '{}'::jsonb,
  history jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.game_rooms enable row level security;
create policy "public read rooms" on public.game_rooms for select using (true);
create policy "public insert rooms" on public.game_rooms for insert with check (true);
create policy "public update rooms" on public.game_rooms for update using (true) with check (true);

alter publication supabase_realtime add table public.game_rooms;
