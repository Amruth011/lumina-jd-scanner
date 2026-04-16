-- ── MASTER VAULT SCHEMA ──
-- This creates the tables required for the "Master Vault" (Three-Layer Resume process)

-- 1. Create the Master Vault table
CREATE TABLE IF NOT EXISTS public.master_vault (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('professional', 'project', 'education', 'certification')),
    title TEXT NOT NULL,
    organization TEXT NOT NULL,
    period TEXT NOT NULL,
    description TEXT NOT NULL,
    bullets TEXT[] DEFAULT '{}',
    skills TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.master_vault ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies
DROP POLICY IF EXISTS "Users can manage their own master vault" ON public.master_vault;
CREATE POLICY "Users can manage their own master vault"
    ON public.master_vault FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Update Profiles table to include Personal Info if not exists
-- (This assumes the profiles table exists as per previous migrations)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS summary_master TEXT; -- For the "Master" professional summary

-- 6. Add is_quantified to master_vault if not exists
ALTER TABLE public.master_vault ADD COLUMN IF NOT EXISTS is_quantified BOOLEAN DEFAULT FALSE;

-- 5. Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_master_vault_updated_at ON public.master_vault;
CREATE TRIGGER update_master_vault_updated_at
    BEFORE UPDATE ON public.master_vault
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
