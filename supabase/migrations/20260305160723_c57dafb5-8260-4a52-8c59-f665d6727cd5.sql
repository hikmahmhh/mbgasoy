
-- Delete ALL remaining data from all tables
DELETE FROM public.distribution_records;
DELETE FROM public.daily_menus;
DELETE FROM public.menu_item_ingredients;
DELETE FROM public.menu_items;
DELETE FROM public.inventory_items;
DELETE FROM public.schools;
DELETE FROM public.activity_logs;
DELETE FROM public.notifications;
DELETE FROM public.org_invitations;
DELETE FROM public.payment_history;
DELETE FROM public.subscriptions;
DELETE FROM public.user_dashboard_preferences;
DELETE FROM public.org_members;
DELETE FROM public.profiles WHERE user_id != 'ed634a3e-c1c8-4f65-ad45-a021fb406638';
DELETE FROM public.organizations;
