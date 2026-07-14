/*
 # Update profiles table: add defaults and updated_at trigger
 #
 # Changes:
 # 1. Set default '{}'::jsonb on ai_preferences column
 # 2. Create updated_at auto-update trigger
 #
 # No data is dropped or modified — only defaults and a trigger are added.
*/

-- Ensure ai_preferences has a default value
ALTER TABLE profiles
  ALTER COLUMN ai_preferences SET DEFAULT '{}'::jsonb;

-- Update any existing NULL ai_preferences to empty jsonb
UPDATE profiles SET ai_preferences = '{}'::jsonb WHERE ai_preferences IS NULL;

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if any, then create
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
