import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'npm:resend@4.0.0';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { WelcomeEmail } from '../_shared/email-templates/welcome.tsx';

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);
const BASE_APP_URL = 'https://dentaleague.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, userName, userEmail, userRole, clinicName, clinicCode } = await req.json();

    console.log('Sending welcome email to:', userEmail);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const dashboardUrl = userRole === 'owner' ? `${BASE_APP_URL}/owner` : `${BASE_APP_URL}/${userRole}`;

    // Render email template
    const emailHtml = await renderAsync(
      React.createElement(WelcomeEmail, {
        userName,
        userRole,
        clinicName,
        clinicCode,
        dashboardUrl,
      })
    );

    // Send email
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'DentaLeague <admin@dentaleague.com>',
      to: [userEmail],
      subject: '🦷 Welcome to DentaLeague!',
      html: emailHtml,
    });

    if (emailError) {
      console.error('Error sending welcome email:', emailError);
      
      // Log failed email
      await supabase.from('email_logs').insert({
        user_id: userId,
        email_type: 'welcome',
        recipient_email: userEmail,
        subject: '🦷 Welcome to DentaLeague!',
        status: 'failed',
        error_message: emailError.message || JSON.stringify(emailError),
        metadata: { userName, userRole, clinicName, clinicCode },
      });
      
      throw emailError;
    }

    // Log successful email
    await supabase.from('email_logs').insert({
      user_id: userId,
      email_type: 'welcome',
      recipient_email: userEmail,
      subject: '🦷 Welcome to DentaLeague!',
      status: 'sent',
      resend_id: emailData?.id,
      sent_at: new Date().toISOString(),
      metadata: { userName, userRole, clinicName, clinicCode },
    });

    console.log('Welcome email sent successfully:', emailData);

    return new Response(
      JSON.stringify({ success: true, emailId: emailData?.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-welcome-email function:', error);
    
    // Try to log the error if we have user info
    try {
      const { userId, userEmail } = await req.json();
      if (userId && userEmail) {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          }
        );
        
        await supabase.from('email_logs').insert({
          user_id: userId,
          email_type: 'welcome',
          recipient_email: userEmail,
          subject: '🦷 Welcome to DentaLeague!',
          status: 'failed',
          error_message: error.message || JSON.stringify(error),
        });
      }
    } catch (logError) {
      console.error('Error logging failed email:', logError);
    }
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
