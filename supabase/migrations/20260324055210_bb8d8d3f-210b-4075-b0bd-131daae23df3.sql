CREATE TABLE public.jd_vault (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  skills_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  raw_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.jd_vault ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read jd_vault" ON public.jd_vault FOR SELECT USING (true);
CREATE POLICY "Anyone can insert jd_vault" ON public.jd_vault FOR INSERT WITH CHECK (true);