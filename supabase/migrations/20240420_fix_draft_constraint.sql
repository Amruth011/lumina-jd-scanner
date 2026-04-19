-- ── FIX DRAFT CONSTRAINT ──
-- Ensures that Upsert works correctly and prevents duplicate resumes for the same JD.

ALTER TABLE public.generated_resumes 
ADD CONSTRAINT generated_resumes_user_id_job_title_key UNIQUE (user_id, job_title);

-- Optional: Ensure status is handled correctly if we ever want multiple versions (but for now simple overwrite)
