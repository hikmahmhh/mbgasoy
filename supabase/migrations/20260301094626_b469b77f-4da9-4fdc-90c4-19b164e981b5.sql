
-- Fix: Replace permissive insert policy with proper check
DROP POLICY IF EXISTS "Anyone can insert org" ON public.organizations;
CREATE POLICY "Authenticated users can create org" ON public.organizations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
