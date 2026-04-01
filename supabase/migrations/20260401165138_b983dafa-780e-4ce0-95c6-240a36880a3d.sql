ALTER TABLE public.jd_vault ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "Anyone can insert jd_vault" ON public.jd_vault;
DROP POLICY IF EXISTS "Anyone can read jd_vault" ON public.jd_vault;

CREATE POLICY "Users can insert own jd_vault"
  ON public.jd_vault FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own jd_vault"
  ON public.jd_vault FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own jd_vault"
  ON public.jd_vault FOR DELETE TO authenticated
  USING (auth.uid() = user_id);