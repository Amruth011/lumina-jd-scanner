ALTER TABLE public.user_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own applications" ON public.user_applications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications" ON public.user_applications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications" ON public.user_applications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own applications" ON public.user_applications
  FOR DELETE TO authenticated USING (auth.uid() = user_id);