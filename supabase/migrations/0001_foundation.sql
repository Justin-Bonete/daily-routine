-- Run in Supabase: SQL Editor > New query > paste > Run.
-- Pattern for every table: user_id column + RLS policy "auth.uid() = user_id".

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  timezone text not null default 'Asia/Manila',
  currency text not null default 'PHP',
  theme text not null default 'dark' check (theme in ('dark', 'light')),
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  parent_id uuid references public.tasks(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  description text,
  category text,
  priority text not null default 'medium' check (priority in ('urgent', 'high', 'medium', 'low')),
  due_at timestamptz,
  recurrence text,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.tasks (user_id, due_at);

create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  schedule_days smallint[] not null default '{0,1,2,3,4,5,6}',
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.habit_logs (
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  log_date date not null,
  primary key (habit_id, log_date)
);
create index on public.habit_logs (user_id, log_date);

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;

create policy "own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own tasks" on public.tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own habits" on public.habits for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own habit logs" on public.habit_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- On sign-up: create the profile and seed the default habits.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name) values (new.id, split_part(new.email, '@', 1));
  insert into public.habits (user_id, name)
  select new.id, h from unnest(array[
    'Wake up consistently', 'Make my bed', 'Drink water', 'Exercise', 'Read', 'Study',
    'Work on my business', 'Avoid unnecessary screen time', 'Journal', 'Sleep consistently'
  ]) as h;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();
