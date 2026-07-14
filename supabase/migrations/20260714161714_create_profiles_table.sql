/*
# Create profiles table

## Summary
Creates the `profiles` table that the Settings page reads from and writes to
via `supabase.from("profiles").upsert(...)`. The table did not exist in the
database, so every upsert/select/update call from the frontend was failing
silently.

## New Tables
- `profiles`
  - `id` (uuid, primary key, references auth.users) — matches the upsert key `id: session.user.id`
  - `full_name` (text) — user's display name
  - `education` (text) — education level / institution
  - `experience` (text) — bio / experience summary
  - `current_role` (text, quoted — reserved keyword) — current job title
  - `github_url` (text) — GitHub profile URL
  - `linkedin_url` (text) — LinkedIn profile URL
  - `theme` (text, default 'dark') — UI theme preference ('dark' | 'high-contrast')
  - `motion_pref` (text, default 'smooth') — animation preference ('smooth' | 'reduced')
  - `notifications` (boolean, default true) — notification opt-in
  - `demo_mode` (boolean, default false) — loads sample data instead of real data
  - `avatar_url` (text) — public URL of avatar image in storage
  - `ai_preferences` (jsonb) — nested object: { aiMemory, dailyBriefing, autoRec, careerCopilot }
  - `created_at` (timestamptz, default now()) — audit timestamp
  - `updated_at` (timestamptz, default now()) — audit timestamp

## Security
- RLS enabled on `profiles`.
- Four owner-scoped policies (SELECT, INSERT, UPDATE, DELETE) scoped to
  `TO authenticated` using `auth.uid() = id`. Each authenticated user can
  only read and modify their own profile row.

## Important Notes
1. The `id` column is the primary key and directly references `auth.users(id)`.
   The Settings page upserts with `id: session.user.id`, so this is the join key.
2. `ai_preferences` is a jsonb column storing a nested object with four boolean
   fields: `aiMemory`, `dailyBriefing`, `autoRec`, `careerCopilot`.
3. The `current_role` column name is a PostgreSQL reserved keyword, so it must
   be double-quoted in DDL. The Supabase JS client does not require quoting.
4. The app has a sign-in screen (Supabase email/password auth), so policies are
   scoped to `authenticated` only — `anon` is intentionally excluded.
5. This migration is idempotent: `CREATE TABLE IF NOT EXISTS` and policies are
   dropped before creation.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  education text,
  experience text,
  "current_role" text,
  github_url text,
  linkedin_url text,
  theme text DEFAULT 'dark',
  motion_pref text DEFAULT 'smooth',
  notifications boolean DEFAULT true,
  demo_mode boolean DEFAULT false,
  avatar_url text,
  ai_preferences jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);
