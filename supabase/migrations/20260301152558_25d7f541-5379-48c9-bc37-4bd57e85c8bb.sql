
-- Create org_invitations table for pending invites
CREATE TABLE public.org_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'operator',
  status text NOT NULL DEFAULT 'pending',
  invited_by uuid NOT NULL,
  token uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamp with time zone,
  UNIQUE(org_id, email)
);

-- Enable RLS
ALTER TABLE public.org_invitations ENABLE ROW LEVEL SECURITY;

-- Org admins can manage invitations
CREATE POLICY "Org admins can manage invitations"
  ON public.org_invitations FOR ALL
  USING (is_org_admin(auth.uid(), org_id) OR is_super_admin(auth.uid()));

-- Org members can view invitations
CREATE POLICY "Org members can view invitations"
  ON public.org_invitations FOR SELECT
  USING (is_org_member(auth.uid(), org_id) OR is_super_admin(auth.uid()));

-- Function to accept invitation by token
CREATE OR REPLACE FUNCTION public.accept_invitation(_token uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  inv record;
BEGIN
  SELECT * INTO inv FROM public.org_invitations
  WHERE token = _token AND status = 'pending' AND expires_at > now();
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Undangan tidak ditemukan atau sudah kadaluarsa');
  END IF;

  -- Check if already a member
  IF EXISTS (SELECT 1 FROM public.org_members WHERE org_id = inv.org_id AND user_id = auth.uid()) THEN
    UPDATE public.org_invitations SET status = 'accepted', accepted_at = now() WHERE id = inv.id;
    RETURN jsonb_build_object('success', true, 'message', 'Anda sudah menjadi anggota organisasi ini');
  END IF;

  -- Add as member
  INSERT INTO public.org_members (org_id, user_id, role) VALUES (inv.org_id, auth.uid(), inv.role);
  
  -- Update invitation status
  UPDATE public.org_invitations SET status = 'accepted', accepted_at = now() WHERE id = inv.id;
  
  RETURN jsonb_build_object('success', true, 'message', 'Berhasil bergabung ke organisasi');
END;
$$;
