-- Fix the process_join_request function to properly update user's clinic_id
CREATE OR REPLACE FUNCTION process_join_request(
    p_request_id UUID,
    p_action TEXT,
    p_denial_reason TEXT DEFAULT NULL
) RETURNS TABLE(success BOOLEAN, message TEXT, user_id UUID) 
LANGUAGE plpgsql 
SECURITY DEFINER
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
        RETURN QUERY SELECT false, 'Join request not found or already processed'::TEXT, NULL::UUID;
        RETURN;
    END IF;
    
    -- Get clinic and user info for response messages
    SELECT c.name INTO v_clinic_name
    FROM clinics c
    WHERE c.id = v_request_record.clinic_id;
    
    SELECT u.name, u.email INTO v_user_name, v_user_email
    FROM users u
    WHERE u.id = v_request_record.user_id;
    
    IF p_action = 'approve' THEN
        -- Update the request status
        UPDATE join_requests 
        SET 
            status = 'approved',
            reviewed_at = NOW(),
            reviewed_by = auth.uid()
        WHERE id = p_request_id;
        
        -- Add user to the clinic by updating their clinic_id
        UPDATE users 
        SET 
            clinic_id = v_request_record.clinic_id,
            is_active = true
        WHERE id = v_request_record.user_id;
        
        RETURN QUERY SELECT 
            true, 
            format('%s has been approved and added to %s', COALESCE(v_user_name, v_user_email), COALESCE(v_clinic_name, 'the clinic'))::TEXT,
            v_request_record.user_id;
            
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
            format('Request from %s has been denied', COALESCE(v_user_name, v_user_email))::TEXT,
            v_request_record.user_id;
    ELSE
        RETURN QUERY SELECT false, 'Invalid action. Use "approve" or "deny"'::TEXT, NULL::UUID;
    END IF;
    
END;
$$;