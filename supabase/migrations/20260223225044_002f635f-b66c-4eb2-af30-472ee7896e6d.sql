
CREATE OR REPLACE FUNCTION public.process_join_request(p_request_id uuid, p_action text, p_denial_reason text DEFAULT NULL)
RETURNS TABLE(success boolean, message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_request_record join_requests;
    v_clinic_name TEXT;
    v_user_name TEXT;
    v_user_email TEXT;
BEGIN
    -- Get the join request
    SELECT * INTO v_request_record
    FROM join_requests
    WHERE id = p_request_id AND status = 'pending';
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'Join request not found or already processed'::TEXT;
        RETURN;
    END IF;
    
    -- Verify caller is owner of the clinic
    IF get_current_user_clinic_id() != v_request_record.clinic_id OR get_current_user_role() != 'owner' THEN
        RETURN QUERY SELECT false, 'Unauthorized'::TEXT;
        RETURN;
    END IF;
    
    -- Get clinic and user info
    SELECT c.name INTO v_clinic_name
    FROM clinics c
    WHERE c.id = v_request_record.clinic_id;
    
    SELECT u.name, u.email INTO v_user_name, v_user_email
    FROM users u
    WHERE u.id = v_request_record.user_id;
    
    IF p_action = 'approve' THEN
        -- Delete any old approved/denied requests for same user+clinic to avoid unique constraint violation
        DELETE FROM join_requests
        WHERE user_id = v_request_record.user_id
          AND clinic_id = v_request_record.clinic_id
          AND id != p_request_id;
        
        -- Update the request status
        UPDATE join_requests 
        SET 
            status = 'approved',
            reviewed_at = NOW(),
            reviewed_by = auth.uid()
        WHERE id = p_request_id;
        
        -- Add user to the clinic
        UPDATE users 
        SET 
            clinic_id = v_request_record.clinic_id,
            is_active = true,
            clinic_membership_status = 'active'
        WHERE id = v_request_record.user_id;
        
        RETURN QUERY SELECT 
            true, 
            format('%s has been approved and added to %s', COALESCE(v_user_name, v_user_email), COALESCE(v_clinic_name, 'the clinic'))::TEXT;
            
    ELSIF p_action = 'deny' THEN
        -- Update the request status
        UPDATE join_requests 
        SET 
            status = 'denied',
            reviewed_at = NOW(),
            reviewed_by = auth.uid(),
            denial_reason = p_denial_reason
        WHERE id = p_request_id;
        
        RETURN QUERY SELECT 
            true, 
            format('Request from %s has been denied', COALESCE(v_user_name, v_user_email))::TEXT;
    ELSE
        RETURN QUERY SELECT false, 'Invalid action. Use "approve" or "deny"'::TEXT;
    END IF;
END;
$$;
