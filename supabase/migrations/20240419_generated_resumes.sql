-- ── GENERATED RESUMES TABLE ──
-- This stores the edited/draft resumes for users to re-utilize later.

CREATE TABLE IF NOT EXISTS public.generated_resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    jd_id TEXT, -- Optional link to a specific JD scan
    job_title TEXT NOT NULL,
    content JSONB NOT NULL, -- The GeneratedResume object
    header_data JSONB NOT NULL, -- Custom name, email, phone, location, linkedin, portfolio, github
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'final')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.generated_resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own generated resumes"
    ON public.generated_resumes FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Updated at trigger
DROP TRIGGER IF EXISTS update_generated_resumes_updated_at ON public.generated_resumes;
CREATE TRIGGER update_generated_resumes_updated_at
    BEFORE UPDATE ON public.generated_resumes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
