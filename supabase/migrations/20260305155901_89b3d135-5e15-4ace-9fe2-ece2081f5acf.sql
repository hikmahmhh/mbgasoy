
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_org_id uuid;
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), COALESCE(NEW.raw_user_meta_data->>'phone', ''));
  
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
