-- Create subscription records for existing orgs that don't have one
INSERT INTO public.subscriptions (org_id, plan, status, trial_ends_at, amount)
SELECT o.id, 
  CASE WHEN o.plan = 'free' THEN 'starter' ELSE o.plan END,
  'trial',
  now() + interval '7 days',
  0
FROM public.organizations o
LEFT JOIN public.subscriptions s ON s.org_id = o.id
WHERE s.id IS NULL;