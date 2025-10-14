import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'npm:resend@4.0.0';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { InvitationEmail } from '../_shared/email-templates/invitation.tsx';

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invitationId } = await req.json();

    console.log('Sending invitation email for invitationId:', invitationId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get invitation details
    const { data: invitation, error: inviteError } = await supabase
      .from('invitations')
      .select(`
        id,
        email,
        role,
        token,
        clinic_id,
        invited_by,
        clinics (
          name
        )
      `)
      .eq('id', invitationId)
      .single();

    if (inviteError || !invitation) {
      throw new Error('Invitation not found');
    }

    // Get inviter details
    const { data: inviter } = await supabase
      .from('users')
      .select('name')
      .eq('id', invitation.invited_by)
      .single();

    const appUrl = 'https://jnbdhtlmdxtanwlubyis.supabase.co';
    const invitationUrl = `${appUrl}/join?token=${invitation.token}`;
    
    const inviteeName = invitation.email.split('@')[0];
    const inviterName = inviter?.name || 'Your colleague';
    const clinicName = (invitation.clinics as any)?.name || 'the clinic';

    // Render email template
    const emailHtml = await renderAsync(
      React.createElement(InvitationEmail, {
        inviteeName,
        inviterName,
        clinicName,
        role: invitation.role,
        invitationUrl,
        expiresIn: '7 days',
      })
    );

    // Send email
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'DentaLeague <invitations@resend.dev>',
      to: [invitation.email],
      subject: `You've been invited to join ${clinicName} on DentaLeague`,
      html: emailHtml,
    });

    if (emailError) {
      console.error('Error sending invitation email:', emailError);
      throw emailError;
    }

    // Update invitation with email status
    await supabase
      .from('invitations')
      .update({
        email_status: 'sent',
        email_sent_at: new Date().toISOString(),
        last_email_sent_at: new Date().toISOString(),
        message_id: emailData?.id,
      })
      .eq('id', invitationId);

    // Log email
    await supabase.from('email_logs').insert({
      clinic_id: invitation.clinic_id,
      email_type: 'invitation',
      recipient_email: invitation.email,
      subject: `You've been invited to join ${clinicName} on DentaLeague`,
      status: 'sent',
      resend_id: emailData?.id,
      sent_at: new Date().toISOString(),
      metadata: { invitationId, role: invitation.role, clinicName },
    });

    console.log('Invitation email sent successfully:', emailData);

    return new Response(
      JSON.stringify({ success: true, emailId: emailData?.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-invitation-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
