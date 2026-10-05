-- Public captions; private ballots; owner-only generation drafts.
create table public.generations (
 id uuid primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 scene text not null check (char_length(btrim(scene)) between 10 and 500),
 prompt text not null check (char_length(prompt) between 10 and 6000),
 style text not null check (style in ('dry','chaotic','wholesome')),
 daily_key text check (daily_key is null or daily_key ~ '^\d{4}-\d{2}-\d{2}$'),
 remix_of uuid references public.generations(id) on delete set null,
 model text not null,
 status text not null default 'pending' check (status in ('pending','complete','failed')),
 caption text,
 input_tokens integer check (input_tokens >= 0),
 output_tokens integer check (output_tokens >= 0),
 estimated_cost_usd numeric(12,8),
 created_at timestamptz not null default now(),
 upvotes integer not null default 0 check (upvotes >= 0),
 downvotes integer not null default 0 check (downvotes >= 0),
 score integer generated always as (upvotes-downvotes) stored,
 check (status <> 'complete' or (caption is not null and char_length(btrim(caption)) between 1 and 400))
);
create index generations_feed on public.generations (status, created_at desc);
create index generations_owner on public.generations (user_id, created_at desc);
create index generations_remix on public.generations (remix_of);
create table public.caption_votes (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 generation_id uuid not null references public.generations(id) on delete cascade,
 value smallint not null check (value in (-1,1)),
 created_at timestamptz not null default now(),
 unique (user_id, generation_id)
);
create index caption_votes_generation on public.caption_votes(generation_id);
alter table public.generations enable row level security;
alter table public.caption_votes enable row level security;
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
revoke all on public.generations, public.caption_votes from anon, authenticated;
grant select on public.generations to anon, authenticated;
grant insert(id,user_id,scene,prompt,style,daily_key,remix_of,model) on public.generations to authenticated;
grant update(status,caption,input_tokens,output_tokens,estimated_cost_usd) on public.generations to authenticated;
grant select,delete on public.caption_votes to authenticated;
grant insert(user_id,generation_id,value) on public.caption_votes to authenticated;
grant update(value) on public.caption_votes to authenticated;
create policy "Public completed captions or own drafts" on public.generations for select to anon,authenticated
 using (status='complete' or user_id=(select auth.uid()));
create policy "Create own generation" on public.generations for insert to authenticated
 with check (user_id=(select auth.uid()) and status='pending');
create policy "Finish own pending generation" on public.generations for update to authenticated
 using (user_id=(select auth.uid()) and status='pending')
 with check (user_id=(select auth.uid()) and status in ('complete','failed'));
create policy "Read own ballot" on public.caption_votes for select to authenticated using (user_id=(select auth.uid()));
create policy "Vote as yourself on published captions" on public.caption_votes for insert to authenticated
 with check (user_id=(select auth.uid()) and exists(select 1 from public.generations g where g.id=generation_id and g.status='complete'));
create policy "Change own ballot" on public.caption_votes for update to authenticated
 using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()) and exists(select 1 from public.generations g where g.id=generation_id and g.status='complete'));
create policy "Withdraw own ballot" on public.caption_votes for delete to authenticated using (user_id=(select auth.uid()));
-- Restrict existing grants to the fields the Profile UI actually edits.
revoke insert,update,delete,truncate,references,trigger on public.profiles from anon,authenticated;
grant update(first_name,last_name,avatar_path) on public.profiles to authenticated;
revoke insert,update,delete,truncate,references,trigger on public.courses from anon,authenticated;
-- Enforce quotas in the database as well as the UI; concurrent calls share this lock.
create function private.check_generation_insert() returns trigger language plpgsql set search_path='' as $$
begin
 if auth.uid() is null or new.user_id <> auth.uid() then raise exception 'Sign in to generate a caption.'; end if;
 perform pg_advisory_xact_lock(hashtextextended(new.user_id::text, 0));
 if (select count(*) from public.generations where user_id=new.user_id and created_at > now()-interval '24 hours') >= 10 then
   raise exception 'You have used your 10 generations for the last 24 hours. Come back tomorrow.';
 end if;
 if exists(select 1 from public.generations where user_id=new.user_id and created_at > now()-interval '10 seconds') then
   raise exception 'Give the last caption a moment. Try again in 10 seconds.';
 end if;
 if new.remix_of is not null and not exists(select 1 from public.generations where id=new.remix_of and status='complete') then raise exception 'That caption is not available to remix.'; end if;
 return new;
end; $$;
revoke all on function private.check_generation_insert() from public,anon,authenticated;
create trigger check_generation_insert before insert on public.generations for each row execute function private.check_generation_insert();
-- Ballot counts are maintained only by this internal trigger. Clients have no
-- INSERT/UPDATE privileges on count columns and cannot call this function.
create function private.update_caption_counts() returns trigger language plpgsql security definer set search_path='' as $$
declare target_id uuid; up_delta integer := 0; down_delta integer := 0;
begin
 if tg_op='DELETE' then target_id:=old.generation_id;
 else
   target_id:=new.generation_id;
   if auth.uid() is null or new.user_id <> auth.uid() then raise exception 'Vote ownership mismatch'; end if;
 end if;
 if tg_op in ('UPDATE','DELETE') then
   up_delta:=up_delta-case when old.value=1 then 1 else 0 end;
   down_delta:=down_delta-case when old.value=-1 then 1 else 0 end;
 end if;
 if tg_op in ('INSERT','UPDATE') then
   up_delta:=up_delta+case when new.value=1 then 1 else 0 end;
   down_delta:=down_delta+case when new.value=-1 then 1 else 0 end;
 end if;
 update public.generations set upvotes=upvotes+up_delta,downvotes=downvotes+down_delta where id=target_id;
 return null;
end; $$;
revoke all on function private.update_caption_counts() from public,anon,authenticated;
create trigger update_caption_counts after insert or update or delete on public.caption_votes for each row execute function private.update_caption_counts();
