create extension if not exists pgcrypto;

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  work_type text not null,
  title text not null check (char_length(title) <= 180),
  author text not null default '',
  reviewer text not null default '',
  institution text not null default '',
  assessment_date date,
  overall_note text not null default '',
  aspects jsonb not null,
  score numeric(5,2) not null check (score >= 0 and score <= 100),
  grade text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists assessments_user_created_idx
  on public.assessments (user_id, created_at desc);

alter table public.assessments enable row level security;

create policy "Users can read own assessments"
  on public.assessments for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create own assessments"
  on public.assessments for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own assessments"
  on public.assessments for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own assessments"
  on public.assessments for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.assessments to authenticated;

create or replace function public.set_assessments_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists assessments_updated_at on public.assessments;
create trigger assessments_updated_at
  before update on public.assessments
  for each row execute procedure public.set_assessments_updated_at();
