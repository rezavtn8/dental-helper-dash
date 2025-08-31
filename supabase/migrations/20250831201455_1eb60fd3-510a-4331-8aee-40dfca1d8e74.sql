-- Create join_requests table for clinic code-based joining
CREATE TABLE public.join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  denial_reason TEXT,
  UNIQUE(user_id, clinic_id, status) -- Prevent duplicate pending requests
);

-- Create clinic_memberships table for multi-clinic support
CREATE TABLE public.clinic_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'assistant' CHECK (role IN ('owner', 'assistant', 'admin')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(user_id, clinic_id)
);

-- Enable RLS on new tables
ALTER TABLE public.join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_memberships ENABLE ROW LEVEL SECURITY;

-- RLS policies for join_requests
CREATE POLICY "Users can view their own join requests" 
ON public.join_requests 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own join requests" 
ON public.join_requests 
FOR INSERT 
WITH CHECK (user_id = auth.uid() AND status = 'pending');

CREATE POLICY "Owners can view join requests for their clinics" 
ON public.join_requests 
FOR SELECT 
USING (clinic_id IN (
  SELECT c.id FROM public.clinics c 
  JOIN public.users u ON u.clinic_id = c.id 
  WHERE u.id = auth.uid() AND u.role = 'owner'
));

CREATE POLICY "Owners can update join requests for their clinics" 
ON public.join_requests 
FOR UPDATE 
USING (clinic_id IN (
  SELECT c.id FROM public.clinics c 
  JOIN public.users u ON u.clinic_id = c.id 
  WHERE u.id = auth.uid() AND u.role = 'owner'
))
WITH CHECK (clinic_id IN (
  SELECT c.id FROM public.clinics c 
  JOIN public.users u ON u.clinic_id = c.id 
  WHERE u.id = auth.uid() AND u.role = 'owner'
));

-- RLS policies for clinic_memberships
CREATE POLICY "Users can view their own memberships" 
ON public.clinic_memberships 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Owners can view memberships in their clinics" 
ON public.clinic_memberships 
FOR SELECT 
USING (clinic_id IN (
  SELECT c.id FROM public.clinics c 
  JOIN public.users u ON u.clinic_id = c.id 
  WHERE u.id = auth.uid() AND u.role = 'owner'
));

CREATE POLICY "Owners can manage memberships in their clinics" 
ON public.clinic_memberships 
FOR ALL 
USING (clinic_id IN (
  SELECT c.id FROM public.clinics c 
  JOIN public.users u ON u.clinic_id = c.id 
  WHERE u.id = auth.uid() AND u.role = 'owner'
))
WITH CHECK (clinic_id IN (
  SELECT c.id FROM public.clinics c 
  JOIN public.users u ON u.clinic_id = c.id 
  WHERE u.id = auth.uid() AND u.role = 'owner'
));

-- Create functions for join request management
CREATE OR REPLACE FUNCTION public.submit_join_request(p_clinic_code TEXT)
RETURNS TABLE(success BOOLEAN, message TEXT, request_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_clinic_id UUID;
  v_user_id UUID;
  v_request_id UUID;
  existing_membership BOOLEAN;
  pending_request BOOLEAN;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT false, 'Not authenticated'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Find clinic by code
  SELECT id INTO v_clinic_id 
  FROM public.clinics 
  WHERE clinic_code = upper(trim(p_clinic_code)) AND is_active = true;
  
  IF v_clinic_id IS NULL THEN
    RETURN QUERY SELECT false, 'Invalid clinic code'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Check if user is already a member
  SELECT EXISTS(
    SELECT 1 FROM public.clinic_memberships 
    WHERE user_id = v_user_id AND clinic_id = v_clinic_id AND is_active = true
  ) INTO existing_membership;
  
  IF existing_membership THEN
    RETURN QUERY SELECT false, 'You are already a member of this clinic'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Check for existing pending request
  SELECT EXISTS(
    SELECT 1 FROM public.join_requests 
    WHERE user_id = v_user_id AND clinic_id = v_clinic_id AND status = 'pending'
  ) INTO pending_request;
  
  IF pending_request THEN
    RETURN QUERY SELECT false, 'You already have a pending request for this clinic'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Create join request
  INSERT INTO public.join_requests (user_id, clinic_id)
  VALUES (v_user_id, v_clinic_id)
  RETURNING id INTO v_request_id;
  
  RETURN QUERY SELECT true, 'Join request submitted successfully'::TEXT, v_request_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.process_join_request(p_request_id UUID, p_action TEXT, p_denial_reason TEXT DEFAULT NULL)
RETURNS TABLE(success BOOLEAN, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_request_record public.join_requests%ROWTYPE;
  v_user_id UUID;
  v_clinic_id UUID;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  -- Get request details
  SELECT * INTO v_request_record
  FROM public.join_requests
  WHERE id = p_request_id AND status = 'pending';
  
  IF v_request_record.id IS NULL THEN
    RETURN QUERY SELECT false, 'Join request not found or already processed'::TEXT;
    RETURN;
  END IF;
  
  -- Verify user is owner of the clinic
  IF NOT EXISTS(
    SELECT 1 FROM public.users u 
    WHERE u.id = v_user_id 
    AND u.clinic_id = v_request_record.clinic_id 
    AND u.role = 'owner'
  ) THEN
    RETURN QUERY SELECT false, 'Unauthorized to process this request'::TEXT;
    RETURN;
  END IF;
  
  -- Process the request
  IF p_action = 'approve' THEN
    -- Add user to clinic_memberships
    INSERT INTO public.clinic_memberships (user_id, clinic_id, role)
    VALUES (v_request_record.user_id, v_request_record.clinic_id, 'assistant')
    ON CONFLICT (user_id, clinic_id) DO UPDATE SET
      is_active = true,
      joined_at = now();
    
    -- Update request status
    UPDATE public.join_requests
    SET status = 'approved',
        reviewed_at = now(),
        reviewed_by = v_user_id
    WHERE id = p_request_id;
    
    RETURN QUERY SELECT true, 'Join request approved successfully'::TEXT;
    
  ELSIF p_action = 'deny' THEN
    -- Update request status
    UPDATE public.join_requests
    SET status = 'denied',
        reviewed_at = now(),
        reviewed_by = v_user_id,
        denial_reason = p_denial_reason
    WHERE id = p_request_id;
    
    RETURN QUERY SELECT true, 'Join request denied'::TEXT;
    
  ELSE
    RETURN QUERY SELECT false, 'Invalid action'::TEXT;
  END IF;
END;
$$;

-- Add rate limiting for join requests
CREATE OR REPLACE FUNCTION public.submit_join_request_with_rate_limit(p_clinic_code TEXT)
RETURNS TABLE(success BOOLEAN, message TEXT, request_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check rate limit (5 attempts per hour)
  IF NOT check_rate_limit('join_request', 5, 60) THEN
    RETURN QUERY SELECT false, 'Too many join requests. Please try again later.'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Delegate to main function
  RETURN QUERY SELECT * FROM public.submit_join_request(p_clinic_code);
END;
$$;