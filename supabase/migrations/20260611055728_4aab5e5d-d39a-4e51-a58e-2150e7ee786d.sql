CREATE TABLE public.scan_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scan_type TEXT NOT NULL CHECK (scan_type IN ('url','text','pdf')),
  target TEXT NOT NULL,
  score INTEGER NOT NULL,
  risk TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scan_history TO authenticated;
GRANT ALL ON public.scan_history TO service_role;
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own scan history" ON public.scan_history FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own scan history" ON public.scan_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own scan history" ON public.scan_history FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX scan_history_user_created_idx ON public.scan_history (user_id, created_at DESC);