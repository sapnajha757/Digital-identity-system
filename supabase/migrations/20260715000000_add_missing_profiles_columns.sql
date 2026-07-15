-- Migration: Add missing columns to profiles table
-- Generated: 2026-07-15
-- Audit: Settings page upsert payload vs actual Supabase profiles schema
--
-- The Settings page (apps/web/app/settings/page.tsx) writes `role` TEXT
-- in its upsert payload, but the remote profiles table does not have
-- that column.  All other columns already exist.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT;
