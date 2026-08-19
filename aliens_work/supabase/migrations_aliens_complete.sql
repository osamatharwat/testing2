-- ALIENS SPACE — COMPLETE PRODUCTION MIGRATION
-- Run once in Supabase SQL Editor.
-- Additive by design; does not delete user data.

create extension if not exists pgcrypto;

create table if not exists public.aliens_os_state (
  store_key text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_by uuid null,
  updated_at timestamptz not null default now()
);

alter table public.aliens_os_state enable row level security;

create or replace function public.aliens_is_leader()
returns boolean
language sql stable security definer set search_path = public
as $$
  select lower(coalesce((select p.role from public.profiles p where p.id = auth.uid()), 'guest'))
    in ('og','head','sub_head','team_head','team_sub_head');
$$;
revoke all on function public.aliens_is_leader() from public;
grant execute on function public.aliens_is_leader() to authenticated;

drop policy if exists aliens_state_public_read on public.aliens_os_state;
create policy aliens_state_public_read on public.aliens_os_state
for select to public using (
  store_key in ('committees','dynamic_questions','events','gallery','memories','projects','internships','cultural','settings')
);

drop policy if exists aliens_state_leaders_read on public.aliens_os_state;
create policy aliens_state_leaders_read on public.aliens_os_state
for select to authenticated using (public.aliens_is_leader());

drop policy if exists aliens_state_leaders_write on public.aliens_os_state;
create policy aliens_state_leaders_write on public.aliens_os_state
for all to authenticated using (public.aliens_is_leader()) with check (public.aliens_is_leader());

-- Add stable external ids where the UI uses string ids.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'committees','committee_questions','events','event_participations',
    'gallery_images','gallery_comments','gallery_likes','memories',
    'memory_comments','memory_likes','member_projects','internships',
    'cultural_resources','performance_evaluations'
  ] LOOP
    EXECUTE format('alter table public.%I add column if not exists external_id text', t);
    EXECUTE format(
      'create unique index if not exists %I on public.%I (external_id) where external_id is not null',
      'idx_' || t || '_external_id', t
    );
  END LOOP;
END $$;

-- Applications: complete the dual-review model used by the website.
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS submitted_by_email text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS submitted_at timestamptz;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS shifted_from_committee text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS ir_evaluator_id uuid;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS ir_evaluator_name text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS ir_decision_note text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS ir_decision_date timestamptz;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS head_decision text default 'pending';
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS head_evaluator_id uuid;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS head_evaluator_name text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS head_decision_note text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS head_decision_date timestamptz;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS final_decision_role text;

-- Committees.
ALTER TABLE public.committees ADD COLUMN IF NOT EXISTS name_ar text;
ALTER TABLE public.committees ADD COLUMN IF NOT EXISTS tag text;
ALTER TABLE public.committees ADD COLUMN IF NOT EXISTS head_id uuid;
ALTER TABLE public.committees ADD COLUMN IF NOT EXISTS sub_head_id uuid;
ALTER TABLE public.committees ADD COLUMN IF NOT EXISTS capacity_limit integer;
ALTER TABLE public.committees ADD COLUMN IF NOT EXISTS is_recruitment_open boolean default true;
ALTER TABLE public.committees ADD COLUMN IF NOT EXISTS tasks jsonb default '[]'::jsonb;

-- Dynamic questions.
ALTER TABLE public.dynamic_questions ADD COLUMN IF NOT EXISTS category text default 'committee';
ALTER TABLE public.dynamic_questions ADD COLUMN IF NOT EXISTS question_type text default 'text';
ALTER TABLE public.dynamic_questions ADD COLUMN IF NOT EXISTS question_options jsonb default '[]'::jsonb;
ALTER TABLE public.dynamic_questions ADD COLUMN IF NOT EXISTS is_required boolean default true;
ALTER TABLE public.dynamic_questions ADD COLUMN IF NOT EXISTS sort_order integer default 0;
ALTER TABLE public.dynamic_questions ADD COLUMN IF NOT EXISTS created_by uuid;
ALTER TABLE public.dynamic_questions ADD COLUMN IF NOT EXISTS created_by_name text;
ALTER TABLE public.dynamic_questions ADD COLUMN IF NOT EXISTS helper_text text;
ALTER TABLE public.dynamic_questions ADD COLUMN IF NOT EXISTS is_active boolean default true;
ALTER TABLE public.dynamic_questions ADD COLUMN IF NOT EXISTS updated_at timestamptz default now();

-- Events and registrations.
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS date text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS time text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS speaker text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS whatsapp_groups jsonb default '[]'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS committee_key text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS category text default 'community';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_public boolean default true;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_paid boolean default false;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS ticket_price numeric default 0;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS certificate_enabled boolean default false;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS certificate_template_url text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS max_attendees integer;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS registration_count integer default 0;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS created_by_id uuid;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS created_by_name text;

ALTER TABLE public.event_participations ADD COLUMN IF NOT EXISTS external_id text;
ALTER TABLE public.event_participations ADD COLUMN IF NOT EXISTS event_title text;
ALTER TABLE public.event_participations ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.event_participations ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.event_participations ADD COLUMN IF NOT EXISTS faculty_level text;
ALTER TABLE public.event_participations ADD COLUMN IF NOT EXISTS student_id text;
ALTER TABLE public.event_participations ADD COLUMN IF NOT EXISTS ticket_code text;
ALTER TABLE public.event_participations ADD COLUMN IF NOT EXISTS ticket_tier text;
ALTER TABLE public.event_participations ADD COLUMN IF NOT EXISTS price_paid numeric;
ALTER TABLE public.event_participations ADD COLUMN IF NOT EXISTS notes text;

-- Gallery, memories, projects, internships, cultural resources.
ALTER TABLE public.gallery_images ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE public.gallery_images ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.gallery_images ADD COLUMN IF NOT EXISTS caption text;
ALTER TABLE public.gallery_images ADD COLUMN IF NOT EXISTS tag text;
ALTER TABLE public.gallery_images ADD COLUMN IF NOT EXISTS created_by text;
ALTER TABLE public.gallery_images ADD COLUMN IF NOT EXISTS created_by_id uuid;
ALTER TABLE public.gallery_comments ADD COLUMN IF NOT EXISTS user_avatar text;
ALTER TABLE public.gallery_comments ADD COLUMN IF NOT EXISTS user_role text;
ALTER TABLE public.gallery_comments ADD COLUMN IF NOT EXISTS gallery_id text;
ALTER TABLE public.memories ADD COLUMN IF NOT EXISTS member_committee text;
ALTER TABLE public.memories ADD COLUMN IF NOT EXISTS liked_by_users jsonb default '[]'::jsonb;
ALTER TABLE public.memories ADD COLUMN IF NOT EXISTS comments jsonb default '[]'::jsonb;
ALTER TABLE public.member_projects ADD COLUMN IF NOT EXISTS tags jsonb default '[]'::jsonb;
ALTER TABLE public.member_projects ADD COLUMN IF NOT EXISTS is_approved boolean default false;
ALTER TABLE public.internships ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.internships ADD COLUMN IF NOT EXISTS deadline text;
ALTER TABLE public.internships ADD COLUMN IF NOT EXISTS is_exclusive_to_members boolean default false;
ALTER TABLE public.cultural_resources ADD COLUMN IF NOT EXISTS description text;

-- Evaluations.
ALTER TABLE public.performance_evaluations ADD COLUMN IF NOT EXISTS external_id text;
ALTER TABLE public.performance_evaluations ADD COLUMN IF NOT EXISTS member_name text;
ALTER TABLE public.performance_evaluations ADD COLUMN IF NOT EXISTS member_committee text;
ALTER TABLE public.performance_evaluations ADD COLUMN IF NOT EXISTS evaluator_name text;
ALTER TABLE public.performance_evaluations ADD COLUMN IF NOT EXISTS evaluator_role text;
ALTER TABLE public.performance_evaluations ADD COLUMN IF NOT EXISTS criteria_scores jsonb default '{}'::jsonb;
ALTER TABLE public.performance_evaluations ADD COLUMN IF NOT EXISTS recommendation text;
ALTER TABLE public.performance_evaluations ADD COLUMN IF NOT EXISTS updated_at timestamptz default now();
ALTER TABLE public.performance_evaluations ENABLE ROW LEVEL SECURITY;

-- Missing UI domains.
CREATE TABLE IF NOT EXISTS public.access_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  committee text,
  position text,
  role text,
  max_uses integer not null default 1,
  current_uses integer not null default 0,
  is_active boolean not null default true,
  single_use boolean not null default true,
  expires_at timestamptz,
  created_by uuid,
  notes text,
  created_at timestamptz not null default now()
);
ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.member_warnings (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null,
  member_name text not null,
  member_committee text,
  reason text not null,
  level text not null,
  consecutive_months_low integer not null default 0,
  issued_by_name text not null,
  issued_by_id uuid,
  issued_by_role text,
  warning_type text,
  issued_at timestamptz not null default now(),
  is_active boolean not null default true,
  cleared_at timestamptz,
  cleared_by uuid
);
ALTER TABLE public.member_warnings ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.certificate_records (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  event_title text not null,
  user_id uuid,
  recipient_name text not null,
  recipient_email text,
  verification_code text not null unique,
  issued_at timestamptz not null default now(),
  template_url text
);
ALTER TABLE public.certificate_records ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  actor_name text not null,
  action text not null,
  target text not null,
  previous_value text,
  new_value text,
  created_at timestamptz not null default now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Core roles.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
drop policy if exists aliens_profiles_self_select on public.profiles;
create policy aliens_profiles_self_select on public.profiles for select to authenticated
using (auth.uid() = id or public.aliens_is_leader());
drop policy if exists aliens_profiles_self_update on public.profiles;
create policy aliens_profiles_self_update on public.profiles for update to authenticated
using (auth.uid() = id or public.aliens_is_leader())
with check (auth.uid() = id or public.aliens_is_leader());
drop policy if exists aliens_profiles_leader_insert on public.profiles;
create policy aliens_profiles_leader_insert on public.profiles for insert to authenticated
with check (public.aliens_is_leader() or auth.uid() = id);
drop policy if exists aliens_profiles_leader_delete on public.profiles;
create policy aliens_profiles_leader_delete on public.profiles for delete to authenticated
using (public.aliens_is_leader());

-- Applications.
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
drop policy if exists aliens_app_public_insert on public.applications;
create policy aliens_app_public_insert on public.applications for insert to public with check (true);
drop policy if exists aliens_app_owner_read on public.applications;
create policy aliens_app_owner_read on public.applications for select to authenticated
using (auth.uid() = user_id or public.aliens_is_leader() or lower(coalesce(public.current_profile_role(),'guest')) in ('ir','pr','media'));
drop policy if exists aliens_app_lead_update on public.applications;
create policy aliens_app_lead_update on public.applications for update to authenticated
using (public.aliens_is_leader() or lower(coalesce(public.current_profile_role(),'guest')) in ('ir','pr','media'))
with check (public.aliens_is_leader() or lower(coalesce(public.current_profile_role(),'guest')) in ('ir','pr','media'));
drop policy if exists aliens_app_lead_delete on public.applications;
create policy aliens_app_lead_delete on public.applications for delete to authenticated using (public.aliens_is_leader());

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committee_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cultural_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dynamic_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Leadership-only domains.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['access_codes','member_warnings','certificate_records','audit_logs','performance_evaluations'] LOOP
    EXECUTE format('drop policy if exists %I on public.%I', 'aliens_' || t || '_leader_all', t);
    EXECUTE format('create policy %I on public.%I for all to authenticated using (public.aliens_is_leader()) with check (public.aliens_is_leader())', 'aliens_' || t || '_leader_all', t);
  END LOOP;
END $$;

-- Useful indexes.
create index if not exists idx_applications_committee_status on public.applications (committee_key, status);
create index if not exists idx_applications_assigned_ir on public.applications (assigned_ir_id);
create index if not exists idx_event_participations_event on public.event_participations (event_id);
create index if not exists idx_notifications_audience on public.notifications (audience_role);
create index if not exists idx_memories_created_at on public.memories (created_at desc);
create index if not exists idx_gallery_images_created_at on public.gallery_images (created_at desc);

-- Current-schema recruitment RPC.
drop function if exists public.submit_application(text,text,text,text,text,jsonb);
create or replace function public.submit_application(
  p_committee_key text,
  p_applicant_name text,
  p_applicant_email text,
  p_applicant_phone text,
  p_faculty_level text,
  p_answers jsonb,
  p_role_requested text default ''
)
returns bigint
language plpgsql security definer set search_path = public
as $$
declare
  v_app_id bigint;
  v_committee_name text;
begin
  select committee_name into v_committee_name from public.committees
  where committee_key = p_committee_key limit 1;
  insert into public.applications (
    user_id, committee_key, committee_name, role_requested,
    applicant_name, applicant_email, phone, faculty_level,
    answers, dynamic_answers, status, source,
    submitted_by_email, submitted_by_phone, submitted_at,
    created_at, updated_at
  ) values (
    auth.uid(), p_committee_key, coalesce(v_committee_name,p_committee_key),
    coalesce(nullif(p_role_requested,''), p_committee_key),
    p_applicant_name, p_applicant_email, p_applicant_phone, p_faculty_level,
    coalesce(p_answers,'{}'::jsonb), coalesce(p_answers,'{}'::jsonb),
    'new', 'public_rpc', p_applicant_email, p_applicant_phone, now(), now(), now()
  ) returning id into v_app_id;
  return v_app_id;
end;
$$;
revoke all on function public.submit_application(text,text,text,text,text,jsonb,text) from public;
grant execute on function public.submit_application(text,text,text,text,text,jsonb,text) to anon, authenticated;

-- Interaction RPCs.
create or replace function public.aliens_toggle_gallery_like(p_image_id bigint)
returns boolean language plpgsql security invoker as $$
declare added boolean;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  if exists (select 1 from public.gallery_likes where image_name = p_image_id::text and user_id = auth.uid()) then
    delete from public.gallery_likes where image_name = p_image_id::text and user_id = auth.uid();
    added := false;
  else
    insert into public.gallery_likes(image_name,user_id,created_at) values (p_image_id::text,auth.uid(),now());
    added := true;
  end if;
  return added;
end;
$$;
grant execute on function public.aliens_toggle_gallery_like(bigint) to authenticated;

create or replace function public.aliens_toggle_memory_like(p_memory_id bigint)
returns boolean language plpgsql security invoker as $$
declare added boolean;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  if exists (select 1 from public.memory_likes where memory_id = p_memory_id and user_id = auth.uid()) then
    delete from public.memory_likes where memory_id = p_memory_id and user_id = auth.uid();
    added := false;
  else
    insert into public.memory_likes(memory_id,user_id,created_at) values (p_memory_id,auth.uid(),now());
    added := true;
  end if;
  return added;
end;
$$;
grant execute on function public.aliens_toggle_memory_like(bigint) to authenticated;

-- High-risk helper: authenticated-only.
revoke execute on function public.get_email_by_username(text) from public;
revoke execute on function public.get_email_by_username(text) from anon;
grant execute on function public.get_email_by_username(text) to authenticated;

-- =========================================================
-- POLICY CLEANUP FOR PREVIOUSLY OVER-PERMISSIVE POLICIES
-- Drops all policies only on the tables below, then recreates the
-- minimum production-safe policies used by this application.
-- =========================================================
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'analytics_events','application_assignments','applications','committee_questions',
        'committees','cultural_resources','dynamic_questions','event_participations','events',
        'gallery','gallery_comments','gallery_images','gallery_likes','internships',
        'member_projects','memories','memory_comments','memory_likes','notification_reads',
        'notifications','performance_evaluations','profiles','promo_codes','role_permissions','site_settings'
      )
  LOOP
    EXECUTE format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- Public content reads.
CREATE POLICY aliens_committees_public_read ON public.committees FOR SELECT TO public USING (true);
CREATE POLICY aliens_questions_public_read ON public.committee_questions FOR SELECT TO public USING (true);
CREATE POLICY aliens_dynamic_questions_public_read ON public.dynamic_questions FOR SELECT TO public USING (true);
CREATE POLICY aliens_events_public_read ON public.events FOR SELECT TO public USING (coalesce(is_public,true));
CREATE POLICY aliens_gallery_public_read ON public.gallery_images FOR SELECT TO public USING (true);
CREATE POLICY aliens_gallery_comments_public_read ON public.gallery_comments FOR SELECT TO public USING (true);
CREATE POLICY aliens_gallery_likes_public_read ON public.gallery_likes FOR SELECT TO public USING (true);
CREATE POLICY aliens_memories_public_read ON public.memories FOR SELECT TO public USING (is_approved = true);
CREATE POLICY aliens_memory_comments_public_read ON public.memory_comments FOR SELECT TO public USING (true);
CREATE POLICY aliens_memory_likes_public_read ON public.memory_likes FOR SELECT TO public USING (true);
CREATE POLICY aliens_internships_public_read ON public.internships FOR SELECT TO public USING (true);
CREATE POLICY aliens_cultural_public_read ON public.cultural_resources FOR SELECT TO public USING (true);
CREATE POLICY aliens_projects_public_read ON public.member_projects FOR SELECT TO public USING (is_approved = true);
CREATE POLICY aliens_promo_public_read ON public.promo_codes FOR SELECT TO public USING (is_active = true);
CREATE POLICY aliens_settings_public_read ON public.site_settings FOR SELECT TO public USING (true);

-- Authenticated interactions.
CREATE POLICY aliens_gallery_comment_insert ON public.gallery_comments FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);
CREATE POLICY aliens_gallery_comment_delete ON public.gallery_comments FOR DELETE TO authenticated
USING (auth.uid() = user_id OR public.aliens_is_leader());
CREATE POLICY aliens_gallery_like_insert ON public.gallery_likes FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);
CREATE POLICY aliens_gallery_like_delete ON public.gallery_likes FOR DELETE TO authenticated
USING (auth.uid() = user_id OR public.aliens_is_leader());
CREATE POLICY aliens_memory_comment_insert ON public.memory_comments FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);
CREATE POLICY aliens_memory_comment_delete ON public.memory_comments FOR DELETE TO authenticated
USING (auth.uid() = user_id OR public.aliens_is_leader());
CREATE POLICY aliens_memory_like_insert ON public.memory_likes FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);
CREATE POLICY aliens_memory_like_delete ON public.memory_likes FOR DELETE TO authenticated
USING (auth.uid() = user_id OR public.aliens_is_leader());
CREATE POLICY aliens_notification_read_own ON public.notification_reads FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY aliens_notifications_read_own ON public.notifications FOR SELECT TO authenticated
USING (audience_role is null or lower(coalesce(audience_role,'')) = lower(coalesce(public.current_profile_role(),'guest')) or public.aliens_is_leader());
CREATE POLICY aliens_analytics_insert ON public.analytics_events FOR INSERT TO public WITH CHECK (true);
CREATE POLICY aliens_analytics_leader_read ON public.analytics_events FOR SELECT TO authenticated USING (public.aliens_is_leader());

-- Leadership write policies for CMS tables.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['committees','committee_questions','dynamic_questions','events','gallery_images','internships','cultural_resources','member_projects','site_settings'] LOOP
    EXECUTE format('create policy %I on public.%I for all to authenticated using (public.aliens_is_leader()) with check (public.aliens_is_leader())', 'aliens_' || t || '_leader_write', t);
  END LOOP;
END $$;

-- Members may create their own memories/projects; leadership controls moderation/deletion.
CREATE POLICY aliens_memories_member_insert ON public.memories FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);
CREATE POLICY aliens_memories_owner_delete ON public.memories FOR DELETE TO authenticated
USING (auth.uid() = user_id OR public.aliens_is_leader());
CREATE POLICY aliens_projects_member_insert ON public.member_projects FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);
CREATE POLICY aliens_projects_owner_manage ON public.member_projects FOR UPDATE TO authenticated
USING (auth.uid() = user_id OR public.aliens_is_leader())
WITH CHECK (auth.uid() = user_id OR public.aliens_is_leader());
CREATE POLICY aliens_projects_owner_delete ON public.member_projects FOR DELETE TO authenticated
USING (auth.uid() = user_id OR public.aliens_is_leader());

-- Event registration.
CREATE POLICY aliens_event_participation_insert ON public.event_participations FOR INSERT TO public WITH CHECK (true);
CREATE POLICY aliens_event_participation_read_own ON public.event_participations FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.aliens_is_leader());
CREATE POLICY aliens_event_participation_leader_update ON public.event_participations FOR UPDATE TO authenticated
USING (public.aliens_is_leader()) WITH CHECK (public.aliens_is_leader());

-- Compatibility for older role names while the profiles are migrated.
-- admins/moderators remain valid for existing operational accounts but do not gain public writes.
CREATE OR REPLACE FUNCTION public.aliens_is_leader()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  select lower(coalesce((select p.role from public.profiles p where p.id = auth.uid()), 'guest'))
    in ('og','head','sub_head','team_head','team_sub_head','admin','moderator');
$$;

-- Application assignment visibility/management.
CREATE POLICY aliens_assignment_read ON public.application_assignments FOR SELECT TO authenticated
USING (
  reviewer_id = auth.uid()
  OR assigned_by = auth.uid()
  OR public.aliens_is_leader()
  OR lower(coalesce(public.current_profile_role(),'guest')) = 'ir'
);
CREATE POLICY aliens_assignment_leader_write ON public.application_assignments FOR ALL TO authenticated
USING (public.aliens_is_leader())
WITH CHECK (public.aliens_is_leader());

-- Members can read their own evaluation; leadership controls writes.
CREATE POLICY aliens_evaluation_member_read ON public.performance_evaluations FOR SELECT TO authenticated
USING (member_id = auth.uid() OR evaluator_id = auth.uid() OR public.aliens_is_leader());

-- Members can see their own warnings; leadership manages them.
CREATE POLICY aliens_warning_member_read ON public.member_warnings FOR SELECT TO authenticated
USING (member_id = auth.uid() OR public.aliens_is_leader());

-- Legacy gallery table retained as a read-only compatibility source.
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY aliens_gallery_legacy_read ON public.gallery FOR SELECT TO public USING (true);

-- Auto-create a least-privilege guest profile after Supabase Auth signup.
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, username, full_name, avatar_url, role, position,
    committee_key, committee, committee_position, is_active, created_at, updated_at
  ) VALUES (
    new.id,
    coalesce(new.email, ''),
    lower(coalesce(new.raw_user_meta_data->>'username', split_part(coalesce(new.email,''),'@',1), 'member_' || left(new.id::text,8))),
    coalesce(new.raw_user_meta_data->>'full_name', 'Aliens Member'),
    new.raw_user_meta_data->>'avatar_url',
    'guest', 'Guest Student', '', '', 'Guest Student', true, now(), now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_aliens_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_aliens_profile
after insert on auth.users
for each row execute function public.handle_new_auth_user();
