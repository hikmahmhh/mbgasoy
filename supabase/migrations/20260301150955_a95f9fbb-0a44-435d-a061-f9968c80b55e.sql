
-- Fix RLS policies: Change restrictive SELECT policies to permissive
-- so super_admin can view data even without being an org member

-- daily_menus
DROP POLICY IF EXISTS "Org members can view daily menus" ON public.daily_menus;
DROP POLICY IF EXISTS "Org members can manage daily menus" ON public.daily_menus;
CREATE POLICY "Org members can view daily menus" ON public.daily_menus
  FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id) OR is_super_admin(auth.uid()));
CREATE POLICY "Org members can manage daily menus" ON public.daily_menus
  FOR ALL TO authenticated USING (is_org_member(auth.uid(), org_id) OR is_super_admin(auth.uid()));

-- distribution_records
DROP POLICY IF EXISTS "Org members can view distributions" ON public.distribution_records;
DROP POLICY IF EXISTS "Org members can manage distributions" ON public.distribution_records;
CREATE POLICY "Org members can view distributions" ON public.distribution_records
  FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id) OR is_super_admin(auth.uid()));
CREATE POLICY "Org members can manage distributions" ON public.distribution_records
  FOR ALL TO authenticated USING (is_org_member(auth.uid(), org_id) OR is_super_admin(auth.uid()));

-- inventory_items
DROP POLICY IF EXISTS "Org members can view inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "Org members can manage inventory" ON public.inventory_items;
CREATE POLICY "Org members can view inventory" ON public.inventory_items
  FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id) OR is_super_admin(auth.uid()));
CREATE POLICY "Org members can manage inventory" ON public.inventory_items
  FOR ALL TO authenticated USING (is_org_member(auth.uid(), org_id) OR is_super_admin(auth.uid()));

-- menu_items
DROP POLICY IF EXISTS "Org members can view menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Org admins can manage menu items" ON public.menu_items;
CREATE POLICY "Org members can view menu items" ON public.menu_items
  FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id) OR is_super_admin(auth.uid()));
CREATE POLICY "Org admins can manage menu items" ON public.menu_items
  FOR ALL TO authenticated USING (is_org_admin(auth.uid(), org_id) OR is_super_admin(auth.uid()));

-- schools
DROP POLICY IF EXISTS "Org members can view schools" ON public.schools;
DROP POLICY IF EXISTS "Org admins can manage schools" ON public.schools;
CREATE POLICY "Org members can view schools" ON public.schools
  FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id) OR is_super_admin(auth.uid()));
CREATE POLICY "Org admins can manage schools" ON public.schools
  FOR ALL TO authenticated USING (is_org_admin(auth.uid(), org_id) OR is_super_admin(auth.uid()));
