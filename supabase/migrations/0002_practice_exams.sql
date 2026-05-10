-- =============================================================================
-- 0002_practice_exams.sql
-- Adds the question bank, practice exam blueprints, attempts, and readiness
-- snapshot tables. Layered on top of 0001_init.sql.
-- =============================================================================

-- New enums --------------------------------------------------------------------
do $$ begin
  create type question_bank_type as enum (
    'multiple_choice','multiple_select','scenario','troubleshooting',
    'command_selection','ordering','matching','pbq_sim',
    'architecture_decision','subnetting','cli_output_interpretation'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type question_difficulty as enum ('easy','medium','hard','exam_level');
exception when duplicate_object then null; end $$;

do $$ begin
  create type practice_exam_mode as enum (
    'full','mini','core1','core2','domain','weak_area','final_simulation'
  );
exception when duplicate_object then null; end $$;

-- Cert exam codes (A+ has Core 1 + Core 2; others are single-exam) ------------
create table if not exists cert_exam_codes (
  cert_id text not null references certs(id) on delete cascade,
  exam_code text not null,
  exam_name text not null,
  scaled_score_min int not null default 100,
  scaled_score_max int not null,
  passing_scaled_score int not null,
  question_count int not null,
  time_limit_minutes int not null,
  primary key (cert_id, exam_code)
);

-- Question bank (replaces the older quiz_questions for new content) -----------
create table if not exists question_bank_items (
  id text primary key,
  cert_id text not null references certs(id) on delete cascade,
  exam_code text,
  domain_id text not null references domains(id) on delete cascade,
  objective_id text not null references objectives(id) on delete cascade,
  type question_bank_type not null,
  difficulty question_difficulty not null default 'medium',
  question_text text not null,
  choices jsonb not null,
  correct_answers jsonb not null,
  explanation text not null,
  wrong_answer_explanations jsonb not null default '{}'::jsonb,
  exam_trap text,
  hint text,
  tags text[] not null default '{}',
  time_estimate_seconds int not null default 60,
  readiness_weight numeric not null default 1.0,
  source_type text not null default 'original',
  is_practice_exam_eligible boolean not null default true,
  is_pbq_style boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_qbi_cert on question_bank_items(cert_id);
create index if not exists idx_qbi_objective on question_bank_items(objective_id);
create index if not exists idx_qbi_difficulty on question_bank_items(difficulty);

-- Practice exam blueprints ----------------------------------------------------
create table if not exists practice_exam_blueprints (
  id text primary key,
  cert_id text not null references certs(id) on delete cascade,
  exam_code text not null,
  title text not null,
  mode practice_exam_mode not null,
  question_count int not null,
  time_limit_seconds int not null,
  passing_scaled_score int not null,
  scaled_score_max int not null,
  scaled_score_min int not null default 100,
  domain_targets jsonb not null,          -- [{domainId, questionCount}]
  difficulty_mix jsonb not null,          -- {easy, medium, hard, exam_level}
  unlock_requirements jsonb not null,
  allow_manual_override boolean not null default true,
  display_order int not null default 0
);

-- Practice exam attempts ------------------------------------------------------
create table if not exists practice_exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  blueprint_id text not null references practice_exam_blueprints(id),
  cert_id text not null references certs(id),
  exam_code text not null,
  mode practice_exam_mode not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  time_limit_seconds int not null,
  time_used_seconds int,
  raw_correct int,
  raw_total int,
  raw_percent numeric,
  estimated_scaled_score int,
  passing_scaled_score int not null,
  pass_estimate boolean,
  domain_breakdown jsonb,
  objective_breakdown jsonb,
  missed_question_ids text[] default '{}',
  flagged_question_ids text[] default '{}',
  readiness_before int,
  readiness_after int,
  manual_override_used boolean not null default false,
  remediation_plan jsonb
);
create index if not exists idx_pea_user_cert on practice_exam_attempts(user_id, cert_id);
create index if not exists idx_pea_completed on practice_exam_attempts(completed_at desc);

-- Per-question records on each attempt (for review mode) ----------------------
create table if not exists practice_exam_question_attempts (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references practice_exam_attempts(id) on delete cascade,
  question_id text not null references question_bank_items(id),
  selected_answer_ids text[] not null default '{}',
  is_correct boolean not null,
  time_spent_seconds int not null default 0,
  flagged boolean not null default false,
  display_order int not null
);
create index if not exists idx_peqa_attempt on practice_exam_question_attempts(attempt_id);

-- Readiness snapshots ---------------------------------------------------------
create table if not exists readiness_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cert_id text not null references certs(id),
  overall int not null,
  domain_scores jsonb not null,
  components jsonb not null,
  ceiling_applied boolean not null,
  taken_at timestamptz not null default now()
);
create index if not exists idx_rs_user_cert_taken on readiness_snapshots(user_id, cert_id, taken_at desc);

-- Remediation plans (stored alongside attempts but also queryable on their own)
create table if not exists remediation_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cert_id text not null references certs(id),
  source_attempt_id uuid references practice_exam_attempts(id) on delete set null,
  plan jsonb not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- User exam goals -------------------------------------------------------------
create table if not exists user_exam_goals (
  user_id uuid not null references auth.users(id) on delete cascade,
  cert_id text not null references certs(id),
  exam_code text,
  target_date date,
  daily_minutes_target int default 20,
  intensity text default 'normal',
  primary key (user_id, cert_id)
);

-- RLS policies ----------------------------------------------------------------
alter table cert_exam_codes enable row level security;
alter table question_bank_items enable row level security;
alter table practice_exam_blueprints enable row level security;
alter table practice_exam_attempts enable row level security;
alter table practice_exam_question_attempts enable row level security;
alter table readiness_snapshots enable row level security;
alter table remediation_plans enable row level security;
alter table user_exam_goals enable row level security;

-- Static content readable by any authenticated user
do $$ begin
  create policy "static read cert_exam_codes" on cert_exam_codes for select to authenticated using (true);
  create policy "static read question_bank_items" on question_bank_items for select to authenticated using (true);
  create policy "static read practice_exam_blueprints" on practice_exam_blueprints for select to authenticated using (true);
exception when duplicate_object then null; end $$;

-- User progress tables: owner only
do $$ begin
  create policy "owner all practice_exam_attempts" on practice_exam_attempts
    for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
  create policy "owner all practice_exam_question_attempts" on practice_exam_question_attempts
    for all to authenticated using (
      exists (select 1 from practice_exam_attempts a where a.id = attempt_id and a.user_id = auth.uid())
    );
  create policy "owner all readiness_snapshots" on readiness_snapshots
    for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
  create policy "owner all remediation_plans" on remediation_plans
    for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
  create policy "owner all user_exam_goals" on user_exam_goals
    for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;
