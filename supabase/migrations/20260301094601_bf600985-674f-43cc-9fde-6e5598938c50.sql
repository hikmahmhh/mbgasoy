
-- 1. Create organizations table
CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'active',
  plan text NOT NULL DEFAULT 'free',
  address text DEFAULT '',
  phone text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- 2. Create org_members table
CREATE TABLE public.org_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'operator',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(org_id, user_id)
);
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

-- 3. Add org_id to data tables
ALTER TABLE public.menu_items ADD COLUMN org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.daily_menus ADD COLUMN org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.inventory_items ADD COLUMN org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.schools ADD COLUMN org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.distribution_records ADD COLUMN org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.profiles ADD COLUMN current_org_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL;

-- 4. Default org + migrate data
INSERT INTO public.organizations (id, name, slug, status, plan)
VALUES ('00000000-0000-0000-0000-000000000001', 'Dapur Default', 'dapur-default', 'active', 'free');

UPDATE public.menu_items SET org_id = '00000000-0000-0000-0000-000000000001';
UPDATE public.daily_menus SET org_id = '00000000-0000-0000-0000-000000000001';
UPDATE public.inventory_items SET org_id = '00000000-0000-0000-0000-000000000001';
UPDATE public.schools SET org_id = '00000000-0000-0000-0000-000000000001';
UPDATE public.distribution_records SET org_id = '00000000-0000-0000-0000-000000000001';

ALTER TABLE public.menu_items ALTER COLUMN org_id SET NOT NULL;
ALTER TABLE public.daily_menus ALTER COLUMN org_id SET NOT NULL;
ALTER TABLE public.inventory_items ALTER COLUMN org_id SET NOT NULL;
ALTER TABLE public.schools ALTER COLUMN org_id SET NOT NULL;
ALTER TABLE public.distribution_records ALTER COLUMN org_id SET NOT NULL;

-- 5. Migrate existing roles to org_members
INSERT INTO public.org_members (org_id, user_id, role)
SELECT '00000000-0000-0000-0000-000000000001', user_id, role::text
FROM public.user_roles
WHERE role IN ('admin', 'operator')
ON CONFLICT (org_id, user_id) DO NOTHING;

-- 6. Helper functions
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'super_admin')
$$;

CREATE OR REPLACE FUNCTION public.is_org_member(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.org_members WHERE user_id = _user_id AND org_id = _org_id)
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.org_members WHERE user_id = _user_id AND org_id = _org_id AND role = 'admin')
$$;

CREATE OR REPLACE FUNCTION public.get_user_org_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT org_id FROM public.org_members WHERE user_id = _user_id
$$;

-- 7. Drop old RLS policies
DROP POLICY IF EXISTS "Admins can manage menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Authenticated can view menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Admins and operators can manage daily menus" ON public.daily_menus;
DROP POLICY IF EXISTS "Authenticated can view daily menus" ON public.daily_menus;
DROP POLICY IF EXISTS "Admins and operators can manage inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "Authenticated can view inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "Admins can manage schools" ON public.schools;
DROP POLICY IF EXISTS "Authenticated can view schools" ON public.schools;
DROP POLICY IF EXISTS "Admins and operators can manage distributions" ON public.distribution_records;
DROP POLICY IF EXISTS "Authenticated can view distributions" ON public.distribution_records;

-- 8. New org-aware RLS policies

-- organizations
CREATE POLICY "Super admins can manage all orgs" ON public.organizations FOR ALL USING (is_super_admin(auth.uid()));
CREATE POLICY "Members can view their org" ON public.organizations FOR SELECT USING (id IN (SELECT get_user_org_ids(auth.uid())));
CREATE POLICY "Anyone can insert org" ON public.organizations FOR INSERT WITH CHECK (true);

-- org_members
CREATE POLICY "Super admins can manage all members" ON public.org_members FOR ALL USING (is_super_admin(auth.uid()));
CREATE POLICY "Org admins can manage their org members" ON public.org_members FOR ALL USING (is_org_admin(auth.uid(), org_id));
CREATE POLICY "Members can view their org members" ON public.org_members FOR SELECT USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "Users can insert themselves" ON public.org_members FOR INSERT WITH CHECK (auth.uid() = user_id);

-- menu_items
CREATE POLICY "Org admins can manage menu items" ON public.menu_items FOR ALL USING (is_org_admin(auth.uid(), org_id) OR is_super_admin(auth.uid()));
CREATE POLICY "Org members can view menu items" ON public.menu_items FOR SELECT USING (is_org_member(auth.uid(), org_id));

-- daily_menus
CREATE POLICY "Org members can manage daily menus" ON public.daily_menus FOR ALL USING (is_org_member(auth.uid(), org_id) OR is_super_admin(auth.uid()));
CREATE POLICY "Org members can view daily menus" ON public.daily_menus FOR SELECT USING (is_org_member(auth.uid(), org_id));

-- inventory_items
CREATE POLICY "Org members can manage inventory" ON public.inventory_items FOR ALL USING (is_org_member(auth.uid(), org_id) OR is_super_admin(auth.uid()));
CREATE POLICY "Org members can view inventory" ON public.inventory_items FOR SELECT USING (is_org_member(auth.uid(), org_id));

-- schools
CREATE POLICY "Org admins can manage schools" ON public.schools FOR ALL USING (is_org_admin(auth.uid(), org_id) OR is_super_admin(auth.uid()));
CREATE POLICY "Org members can view schools" ON public.schools FOR SELECT USING (is_org_member(auth.uid(), org_id));

-- distribution_records
CREATE POLICY "Org members can manage distributions" ON public.distribution_records FOR ALL USING (is_org_member(auth.uid(), org_id) OR is_super_admin(auth.uid()));
CREATE POLICY "Org members can view distributions" ON public.distribution_records FOR SELECT USING (is_org_member(auth.uid(), org_id));

-- profiles update
DROP POLICY IF EXISTS "Users can view own profile or admin can view all" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile or super admin can view all" ON public.profiles;
CREATE POLICY "Users can view own profile or super admin" ON public.profiles FOR SELECT USING (auth.uid() = user_id OR is_super_admin(auth.uid()));

-- 9. Update handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_org_id uuid;
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  
  new_org_id := gen_random_uuid();
  INSERT INTO public.organizations (id, name, slug, status, plan)
  VALUES (new_org_id, 
    COALESCE(NEW.raw_user_meta_data->>'kitchen_name', 'Dapur ' || COALESCE(NEW.raw_user_meta_data->>'full_name', 'Baru')),
    'org-' || replace(new_org_id::text, '-', ''), 'active', 'free');
  
  INSERT INTO public.org_members (org_id, user_id, role) VALUES (new_org_id, NEW.id, 'admin');
  UPDATE public.profiles SET current_org_id = new_org_id WHERE user_id = NEW.id;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'operator');
  
  RETURN NEW;
END;
$$;

-- 10. Indexes
CREATE INDEX idx_org_members_user_id ON public.org_members(user_id);
CREATE INDEX idx_org_members_org_id ON public.org_members(org_id);
CREATE INDEX idx_menu_items_org_id ON public.menu_items(org_id);
CREATE INDEX idx_daily_menus_org_id ON public.daily_menus(org_id);
CREATE INDEX idx_inventory_items_org_id ON public.inventory_items(org_id);
CREATE INDEX idx_schools_org_id ON public.schools(org_id);
CREATE INDEX idx_distribution_records_org_id ON public.distribution_records(org_id);

-- 11. Trigger for updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
