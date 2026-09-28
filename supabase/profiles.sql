create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text check (first_name is null or char_length(first_name) <= 80),
  last_name text check (last_name is null or char_length(last_name) <= 80),
  avatar_path text check (avatar_path is null or avatar_path like id::text || '/%'),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
grant select, update on public.profiles to authenticated;
create policy "Read own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "Update own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create schema if not exists private;
create function private.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function private.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.handle_new_user();
insert into public.profiles(id) select id from auth.users on conflict (id) do nothing;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/jpeg','image/png','image/webp']);
create policy "Upload own avatar" on storage.objects for insert to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Read own avatar objects" on storage.objects for select to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Delete own avatar" on storage.objects for delete to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
