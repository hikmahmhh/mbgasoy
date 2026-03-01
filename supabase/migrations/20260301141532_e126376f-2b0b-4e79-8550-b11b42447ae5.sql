
-- Subscriptions table for tracking plans, trials, and payments
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'starter', -- starter, professional, enterprise
  status text NOT NULL DEFAULT 'trial', -- trial, active, expired, cancelled
  trial_ends_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  payment_method text, -- va, qris, ewallet
  payment_reference text, -- Duitku reference
  amount numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(org_id)
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Members can view their org subscription
CREATE POLICY "Org members can view subscription"
ON public.subscriptions FOR SELECT
TO authenticated
USING (is_org_member(auth.uid(), org_id) OR is_super_admin(auth.uid()));

-- Only org admins can manage subscription
CREATE POLICY "Org admins can manage subscription"
ON public.subscriptions FOR ALL
TO authenticated
USING (is_org_admin(auth.uid(), org_id) OR is_super_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Payment history table
CREATE TABLE public.payment_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending, success, failed, expired
  payment_method text,
  duitku_reference text,
  duitku_merchant_order_id text,
  payment_url text,
  va_number text,
  qr_string text,
  expired_at timestamp with time zone,
  paid_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view payment history"
ON public.payment_history FOR SELECT
TO authenticated
USING (is_org_member(auth.uid(), org_id) OR is_super_admin(auth.uid()));

CREATE POLICY "Org admins can manage payment history"
ON public.payment_history FOR ALL
TO authenticated
USING (is_org_admin(auth.uid(), org_id) OR is_super_admin(auth.uid()));

CREATE TRIGGER update_payment_history_updated_at
BEFORE UPDATE ON public.payment_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update handle_new_user to also create a trial subscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_org_id uuid;
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  
  new_org_id := gen_random_uuid();
  INSERT INTO public.organizations (id, name, slug, status, plan)
  VALUES (new_org_id, 
    COALESCE(NEW.raw_user_meta_data->>'kitchen_name', 'Dapur ' || COALESCE(NEW.raw_user_meta_data->>'full_name', 'Baru')),
    'org-' || replace(new_org_id::text, '-', ''), 'active', 'starter');
  
  INSERT INTO public.org_members (org_id, user_id, role) VALUES (new_org_id, NEW.id, 'admin');
  UPDATE public.profiles SET current_org_id = new_org_id WHERE user_id = NEW.id;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'operator');
  
  -- Create trial subscription
  INSERT INTO public.subscriptions (org_id, plan, status, trial_ends_at, amount)
  VALUES (new_org_id, 'starter', 'trial', now() + interval '7 days', 0);
  
  RETURN NEW;
END;
$function$;

-- Function to deactivate expired trials (called by cron)
CREATE OR REPLACE FUNCTION public.deactivate_expired_trials()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update subscription status
  UPDATE public.subscriptions
  SET status = 'expired', updated_at = now()
  WHERE status = 'trial' AND trial_ends_at < now();
  
  -- Suspend the corresponding organizations
  UPDATE public.organizations
  SET status = 'suspended', updated_at = now()
  WHERE id IN (
    SELECT org_id FROM public.subscriptions
    WHERE status = 'expired'
  ) AND status = 'active';
END;
$function$;
