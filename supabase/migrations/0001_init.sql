-- CertQuest OS — Initial Schema
-- Separates static content (certs/lessons/etc) from user progress (attempts/mastery/etc).
-- All user tables enforce Row Level Security so users only see their own data.

-- =============================================================================
-- EXTENSIONS
-- =============================================================================
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- =============================================================================
-- ENUMS
-- =============================================================================
create type cert_provider as enum ('comptia', 'aws', 'cisco');
create type difficulty as enum ('beginner', 'intermediate', 'advanced');
create type mastery_state as enum ('locked', 'unlocked', 'seen', 'practiced', 'battle_tested', 'mastered', 'rusty');
create type lesson_block_kind as enum ('concept', 'why_it_matters', 'beginner_explanation', 'analogy', 'technical', 'exam_angle', 'trap', 'memory_hook', 'quick_check', 'related_flashcards', 'side_quest_link', 'mastery_challenge');
create type quiz_question_kind as enum ('multiple_choice', 'multiple_select', 'scenario', 'troubleshooting_sequence', 'command_select', 'architecture_select', 'cli_interpret');
create type flashcard_kind as enum ('basic', 'cloze', 'scenario', 'command', 'port_protocol', 'acronym', 'reverse', 'image');
create type review_rating as enum ('again', 'hard', 'good', 'easy');
create type study_intensity as enum ('chill', 'normal', 'aggressive');
create type xp_event_kind as enum ('flashcard_correct', 'quiz_passed', 'lesson_completed', 'side_quest_completed', 'lab_completed', 'boss_battle_passed', 'weak_concept_improved', 'daily_plan_completed', 'practice_exam_improved');

-- =============================================================================
-- AUTH / PROFILE
-- =============================================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Recruit',
  avatar_url text,
  rank text not null default 'Recruit',
  total_xp integer not null default 0,
  level integer not null default 1,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_active_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- STATIC CONTENT (seeded from content packs; not user-specific)
-- =============================================================================
create table certs (
  id text primary key,                       -- e.g. 'a-plus'
  provider cert_provider not null,
  exam_name text not null,
  exam_code text not null,
  exam_version text not null,
  official_source_url text not null,
  last_verified_date date,
  theme_name text not null,                  -- e.g. 'Help Desk Guild'
  theme_blurb text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table cert_versions (
  id uuid primary key default uuid_generate_v4(),
  cert_id text not null references certs(id) on delete cascade,
  version_label text not null,
  effective_date date,
  notes text,
  created_at timestamptz not null default now()
);

create table domains (
  id text primary key,                       -- e.g. 'a-plus-hardware'
  cert_id text not null references certs(id) on delete cascade,
  title text not null,
  blurb text,
  weight numeric,                            -- official weight if published
  display_order integer not null default 0
);

create table objectives (
  id text primary key,                       -- e.g. 'a-plus-hardware-001'
  cert_id text not null references certs(id) on delete cascade,
  domain_id text not null references domains(id) on delete cascade,
  title text not null,
  difficulty difficulty not null default 'beginner',
  estimated_minutes integer not null default 15,
  prerequisites text[] not null default '{}',
  concepts text[] not null default '{}',
  mastery_min_quiz_score integer not null default 80,
  mastery_required_reviews integer not null default 3,
  mastery_required_boss_battles integer not null default 1,
  mastery_requires_self_explanation boolean not null default false,
  display_order integer not null default 0
);

create table lessons (
  id text primary key,
  cert_id text not null references certs(id) on delete cascade,
  objective_id text not null references objectives(id) on delete cascade,
  title text not null,
  estimated_minutes integer not null default 8,
  display_order integer not null default 0
);

create table lesson_blocks (
  id uuid primary key default uuid_generate_v4(),
  lesson_id text not null references lessons(id) on delete cascade,
  kind lesson_block_kind not null,
  body text not null,                        -- markdown
  display_order integer not null
);

create table quizzes (
  id text primary key,
  cert_id text not null references certs(id) on delete cascade,
  objective_id text not null references objectives(id) on delete cascade,
  title text not null,
  pass_threshold integer not null default 80
);

create table quiz_questions (
  id text primary key,
  quiz_id text not null references quizzes(id) on delete cascade,
  cert_id text not null references certs(id) on delete cascade,
  objective_id text not null references objectives(id) on delete cascade,
  kind quiz_question_kind not null,
  prompt text not null,
  choices jsonb not null,                    -- [{id,text}]
  correct_answer_ids text[] not null,
  explanation_correct text not null,
  explanation_incorrect jsonb not null default '{}'::jsonb, -- {choiceId: text}
  difficulty difficulty not null default 'beginner',
  concept_tags text[] not null default '{}',
  exam_trap text,
  hint text
);

create table flashcards (
  id text primary key,
  cert_id text not null references certs(id) on delete cascade,
  domain_id text references domains(id) on delete set null,
  objective_id text references objectives(id) on delete set null,
  kind flashcard_kind not null default 'basic',
  front text not null,
  back text not null,
  concept_tags text[] not null default '{}'
);

create table side_quests (
  id text primary key,
  cert_id text not null references certs(id) on delete cascade,
  objective_id text references objectives(id) on delete set null,
  template text not null,                    -- 'port_lockpick' | 'osi_tower' | etc
  title text not null,
  story text not null,
  payload jsonb not null                     -- shape depends on template
);

create table labs (
  id text primary key,
  cert_id text not null references certs(id) on delete cascade,
  objective_id text references objectives(id) on delete set null,
  title text not null,
  story text not null,
  steps jsonb not null
);

create table boss_battles (
  id text primary key,
  cert_id text not null references certs(id) on delete cascade,
  objective_ids text[] not null default '{}',
  title text not null,
  story_setup text not null,
  scenario text not null,
  constraints jsonb,
  rubric jsonb not null,
  remediation jsonb
);

create table glossary_terms (
  id uuid primary key default uuid_generate_v4(),
  cert_id text not null references certs(id) on delete cascade,
  term text not null,
  definition text not null,
  unique (cert_id, term)
);

create table acronyms (
  id uuid primary key default uuid_generate_v4(),
  cert_id text not null references certs(id) on delete cascade,
  acronym text not null,
  expansion text not null,
  meaning text not null,
  unique (cert_id, acronym)
);

create table exam_traps (
  id uuid primary key default uuid_generate_v4(),
  cert_id text not null references certs(id) on delete cascade,
  title text not null,
  description text not null,
  related_objective_ids text[] not null default '{}'
);

-- =============================================================================
-- USER PROGRESS
-- =============================================================================
create table user_cert_enrollments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cert_id text not null references certs(id) on delete cascade,
  is_active boolean not null default true,
  exam_date date,
  intensity study_intensity not null default 'normal',
  daily_minutes_target integer not null default 20,
  enrolled_at timestamptz not null default now(),
  unique (user_id, cert_id)
);

create table user_objective_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cert_id text not null references certs(id) on delete cascade,
  objective_id text not null references objectives(id) on delete cascade,
  state mastery_state not null default 'locked',
  score integer not null default 0,            -- 0-100
  last_evidence_at timestamptz,
  rusty_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, objective_id)
);

create table user_lesson_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null references lessons(id) on delete cascade,
  completed_at timestamptz,
  quick_check_passed boolean not null default false,
  unique (user_id, lesson_id)
);

create table flashcard_reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  flashcard_id text not null references flashcards(id) on delete cascade,
  rating review_rating not null,
  ease_factor numeric not null default 2.5,
  interval_days integer not null default 0,
  due_at timestamptz not null,
  reviewed_at timestamptz not null default now(),
  correct_count integer not null default 0,
  incorrect_count integer not null default 0
);

-- Latest SRS state per (user, flashcard) — kept in sync from flashcard_reviews
create table flashcard_srs_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  flashcard_id text not null references flashcards(id) on delete cascade,
  ease_factor numeric not null default 2.5,
  interval_days integer not null default 0,
  due_at timestamptz not null default now(),
  review_count integer not null default 0,
  last_reviewed_at timestamptz,
  primary key (user_id, flashcard_id)
);

create table quiz_attempts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quiz_id text not null references quizzes(id) on delete cascade,
  score integer not null,
  passed boolean not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table quiz_question_attempts (
  id uuid primary key default uuid_generate_v4(),
  attempt_id uuid not null references quiz_attempts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  quiz_question_id text not null references quiz_questions(id) on delete cascade,
  selected_answer_ids text[] not null,
  is_correct boolean not null,
  time_ms integer
);

create table side_quest_attempts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  side_quest_id text not null references side_quests(id) on delete cascade,
  score integer not null,
  passed boolean not null,
  payload jsonb,                                -- raw mini-game result
  completed_at timestamptz not null default now()
);

create table lab_attempts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lab_id text not null references labs(id) on delete cascade,
  passed boolean not null,
  notes text,
  completed_at timestamptz not null default now()
);

create table boss_battle_attempts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  boss_battle_id text not null references boss_battles(id) on delete cascade,
  score integer not null,
  passed boolean not null,
  rubric_breakdown jsonb,
  self_explanation text,
  completed_at timestamptz not null default now()
);

create table notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cert_id text references certs(id) on delete set null,
  objective_id text references objectives(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table study_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cert_id text references certs(id) on delete set null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  focused_minutes integer not null default 0
);

create table scheduled_reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  flashcard_id text not null references flashcards(id) on delete cascade,
  due_at timestamptz not null,
  unique (user_id, flashcard_id)
);

create table notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preferred_study_time time not null default '18:00',
  quiet_hours_start time not null default '22:00',
  quiet_hours_end time not null default '07:00',
  days_of_week integer[] not null default '{1,2,3,4,5,6,0}', -- 0=Sun
  intensity study_intensity not null default 'normal',
  daily_reminder boolean not null default true,
  due_reviews boolean not null default true,
  weak_area boolean not null default true,
  streak_rescue boolean not null default true,
  boss_battle_unlocked boolean not null default true,
  exam_countdown boolean not null default true,
  rusty_warning boolean not null default true,
  expo_push_token text
);

create table xp_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cert_id text references certs(id) on delete set null,
  kind xp_event_kind not null,
  amount integer not null,
  source_id text,                              -- flashcard_id, quiz_id, etc
  created_at timestamptz not null default now()
);

create table badges (
  id text primary key,
  title text not null,
  description text not null,
  icon text,
  criteria jsonb
);

create table user_badges (
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id text not null references badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

create table daily_plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cert_id text not null references certs(id) on delete cascade,
  plan_date date not null,
  payload jsonb not null,                      -- generated plan items
  completed_count integer not null default 0,
  total_count integer not null default 0,
  unique (user_id, cert_id, plan_date)
);

create table user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active_cert_id text references certs(id) on delete set null,
  theme text not null default 'dark',
  reduced_motion boolean not null default false,
  haptics boolean not null default true
);

create table offline_sync_queue (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  table_name text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  synced_at timestamptz
);

-- =============================================================================
-- INDEXES
-- =============================================================================
create index on objectives (cert_id, domain_id);
create index on lessons (objective_id);
create index on lesson_blocks (lesson_id, display_order);
create index on quiz_questions (quiz_id);
create index on flashcards (cert_id, objective_id);
create index on user_objective_progress (user_id, cert_id);
create index on flashcard_srs_state (user_id, due_at);
create index on flashcard_reviews (user_id, reviewed_at desc);
create index on quiz_attempts (user_id, completed_at desc);
create index on xp_events (user_id, created_at desc);
create index on daily_plans (user_id, plan_date desc);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
alter table profiles enable row level security;
alter table user_cert_enrollments enable row level security;
alter table user_objective_progress enable row level security;
alter table user_lesson_progress enable row level security;
alter table flashcard_reviews enable row level security;
alter table flashcard_srs_state enable row level security;
alter table quiz_attempts enable row level security;
alter table quiz_question_attempts enable row level security;
alter table side_quest_attempts enable row level security;
alter table lab_attempts enable row level security;
alter table boss_battle_attempts enable row level security;
alter table notes enable row level security;
alter table study_sessions enable row level security;
alter table scheduled_reviews enable row level security;
alter table notification_preferences enable row level security;
alter table xp_events enable row level security;
alter table user_badges enable row level security;
alter table daily_plans enable row level security;
alter table user_settings enable row level security;
alter table offline_sync_queue enable row level security;

-- Static content tables: readable by any authenticated user, no writes from clients.
alter table certs enable row level security;
alter table cert_versions enable row level security;
alter table domains enable row level security;
alter table objectives enable row level security;
alter table lessons enable row level security;
alter table lesson_blocks enable row level security;
alter table quizzes enable row level security;
alter table quiz_questions enable row level security;
alter table flashcards enable row level security;
alter table side_quests enable row level security;
alter table labs enable row level security;
alter table boss_battles enable row level security;
alter table glossary_terms enable row level security;
alter table acronyms enable row level security;
alter table exam_traps enable row level security;
alter table badges enable row level security;

-- Helper: every user-owned table allows the owner full CRUD.
do $$
declare
  t text;
  user_tables text[] := array[
    'profiles','user_cert_enrollments','user_objective_progress','user_lesson_progress',
    'flashcard_reviews','flashcard_srs_state','quiz_attempts','quiz_question_attempts',
    'side_quest_attempts','lab_attempts','boss_battle_attempts','notes','study_sessions',
    'scheduled_reviews','notification_preferences','xp_events','user_badges','daily_plans',
    'user_settings','offline_sync_queue'
  ];
  uid_col text;
begin
  foreach t in array user_tables loop
    -- profiles uses id as the user pointer; everything else uses user_id.
    if t = 'profiles' then uid_col := 'id'; else uid_col := 'user_id'; end if;
    execute format('create policy "%I_owner_select" on %I for select using (auth.uid() = %I);', t, t, uid_col);
    execute format('create policy "%I_owner_insert" on %I for insert with check (auth.uid() = %I);', t, t, uid_col);
    execute format('create policy "%I_owner_update" on %I for update using (auth.uid() = %I);', t, t, uid_col);
    execute format('create policy "%I_owner_delete" on %I for delete using (auth.uid() = %I);', t, t, uid_col);
  end loop;
end $$;

-- Static content: read-only for all authenticated users.
do $$
declare
  t text;
  static_tables text[] := array[
    'certs','cert_versions','domains','objectives','lessons','lesson_blocks',
    'quizzes','quiz_questions','flashcards','side_quests','labs','boss_battles',
    'glossary_terms','acronyms','exam_traps','badges'
  ];
begin
  foreach t in array static_tables loop
    execute format('create policy "%I_read" on %I for select using (auth.role() = ''authenticated'');', t, t);
  end loop;
end $$;

-- =============================================================================
-- TRIGGERS
-- =============================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name) values (new.id, 'Recruit');
  insert into public.user_settings (user_id) values (new.id);
  insert into public.notification_preferences (user_id) values (new.id);
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

create trigger profiles_touch before update on profiles
  for each row execute function public.touch_updated_at();
create trigger user_objective_progress_touch before update on user_objective_progress
  for each row execute function public.touch_updated_at();
create trigger notes_touch before update on notes
  for each row execute function public.touch_updated_at();
