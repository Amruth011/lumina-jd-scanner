-- 20260516_update_master_vault_types.sql
-- Drop the existing constraint
ALTER TABLE public.master_vault DROP CONSTRAINT IF EXISTS master_vault_type_check;

-- Add the new constraint with 'product', 'leadership', and 'award'
ALTER TABLE public.master_vault ADD CONSTRAINT master_vault_type_check CHECK (type IN ('professional', 'project', 'education', 'certification', 'product', 'leadership', 'award'));

-- Add new columns for project links
ALTER TABLE public.master_vault ADD COLUMN IF NOT EXISTS github_link TEXT;
ALTER TABLE public.master_vault ADD COLUMN IF NOT EXISTS live_link TEXT;
