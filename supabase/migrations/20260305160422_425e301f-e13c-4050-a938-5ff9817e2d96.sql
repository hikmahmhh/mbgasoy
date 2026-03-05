
-- Delete all data except for the super admin user
-- Order matters due to foreign keys

-- Delete distribution records for non-admin orgs
DELETE FROM public.distribution_records WHERE org_id IN (
  SELECT id FROM public.organizations WHERE id NOT IN (
    SELECT org_id FROM public.org_members WHERE user_id = 'ed634a3e-c1c8-4f65-ad45-a021fb406638'
  )
);

-- Delete daily menus
DELETE FROM public.daily_menus WHERE org_id IN (
  SELECT id FROM public.organizations WHERE id NOT IN (
    SELECT org_id FROM public.org_members WHERE user_id = 'ed634a3e-c1c8-4f65-ad45-a021fb406638'
  )
);

-- Delete menu item ingredients
DELETE FROM public.menu_item_ingredients WHERE org_id IN (
  SELECT id FROM public.organizations WHERE id NOT IN (
    SELECT org_id FROM public.org_members WHERE user_id = 'ed634a3e-c1c8-4f65-ad45-a021fb406638'
  )
);

-- Delete menu items
DELETE FROM public.menu_items WHERE org_id IN (
  SELECT id FROM public.organizations WHERE id NOT IN (
    SELECT org_id FROM public.org_members WHERE user_id = 'ed634a3e-c1c8-4f65-ad45-a021fb406638'
  )
);

-- Delete inventory items
DELETE FROM public.inventory_items WHERE org_id IN (
  SELECT id FROM public.organizations WHERE id NOT IN (
    SELECT org_id FROM public.org_members WHERE user_id = 'ed634a3e-c1c8-4f65-ad45-a021fb406638'
  )
);

-- Delete schools
DELETE FROM public.schools WHERE org_id IN (
  SELECT id FROM public.organizations WHERE id NOT IN (
    SELECT org_id FROM public.org_members WHERE user_id = 'ed634a3e-c1c8-4f65-ad45-a021fb406638'
  )
);

-- Delete activity logs
DELETE FROM public.activity_logs WHERE org_id IN (
  SELECT id FROM public.organizations WHERE id NOT IN (
    SELECT org_id FROM public.org_members WHERE user_id = 'ed634a3e-c1c8-4f65-ad45-a021fb406638'
  )
);

-- Delete notifications
DELETE FROM public.notifications WHERE org_id IN (
  SELECT id FROM public.organizations WHERE id NOT IN (
    SELECT org_id FROM public.org_members WHERE user_id = 'ed634a3e-c1c8-4f65-ad45-a021fb406638'
  )
);

-- Delete org invitations
DELETE FROM public.org_invitations WHERE org_id IN (
  SELECT id FROM public.organizations WHERE id NOT IN (
    SELECT org_id FROM public.org_members WHERE user_id = 'ed634a3e-c1c8-4f65-ad45-a021fb406638'
  )
);

-- Delete payment history
DELETE FROM public.payment_history WHERE org_id IN (
  SELECT id FROM public.organizations WHERE id NOT IN (
    SELECT org_id FROM public.org_members WHERE user_id = 'ed634a3e-c1c8-4f65-ad45-a021fb406638'
  )
);

-- Delete subscriptions
DELETE FROM public.subscriptions WHERE org_id IN (
  SELECT id FROM public.organizations WHERE id NOT IN (
    SELECT org_id FROM public.org_members WHERE user_id = 'ed634a3e-c1c8-4f65-ad45-a021fb406638'
  )
);

-- Delete dashboard preferences
DELETE FROM public.user_dashboard_preferences WHERE org_id IN (
  SELECT id FROM public.organizations WHERE id NOT IN (
    SELECT org_id FROM public.org_members WHERE user_id = 'ed634a3e-c1c8-4f65-ad45-a021fb406638'
  )
);

-- Delete non-admin org members
DELETE FROM public.org_members WHERE user_id != 'ed634a3e-c1c8-4f65-ad45-a021fb406638';

-- Delete non-admin profiles
DELETE FROM public.profiles WHERE user_id != 'ed634a3e-c1c8-4f65-ad45-a021fb406638';

-- Delete non-admin user roles
DELETE FROM public.user_roles WHERE user_id != 'ed634a3e-c1c8-4f65-ad45-a021fb406638';

-- Delete non-admin organizations
DELETE FROM public.organizations WHERE id NOT IN (
  SELECT org_id FROM public.org_members WHERE user_id = 'ed634a3e-c1c8-4f65-ad45-a021fb406638'
);
