
-- Fix overly permissive RLS policies

-- Fix tickets: replace WITH CHECK (true) with proper auth check
DROP POLICY "Service can insert tickets" ON public.tickets;
CREATE POLICY "Authenticated users can insert tickets" ON public.tickets FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Fix subscriptions: replace USING (true) with admin-only management
DROP POLICY "Service can manage subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can manage subscriptions" ON public.subscriptions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Fix media_passes: replace USING (true) with proper policies
DROP POLICY "Service can manage media passes" ON public.media_passes;
CREATE POLICY "Admins can manage media passes" ON public.media_passes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Authenticated users can insert media passes" ON public.media_passes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
