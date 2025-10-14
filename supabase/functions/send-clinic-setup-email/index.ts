import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'npm:resend@4.0.0';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { ClinicSetupEmail } from '../_shared/email-templates/clinic-setup.tsx';

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
    const { userId, clinicId } = await req.json();

    console.log('Sending clinic setup email for userId:', userId, 'clinicId:', clinicId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user and clinic details
    const { data: user } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', userId)
      .single();

    const { data: clinic } = await supabase
      .from('clinics')
      .select('name, clinic_code')
      .eq('id', clinicId)
      .single();

    if (!user || !clinic) {
      throw new Error('User or clinic not found');
    }

    const appUrl = 'https://jnbdhtlmdxtanwlubyis.supabase.co';
    const dashboardUrl = `${appUrl}/owner`;

    // Render email template
    const emailHtml = await renderAsync(
      React.createElement(ClinicSetupEmail, {
        ownerName: user.name,
        clinicName: clinic.name,
        clinicCode: clinic.clinic_code,
        dashboardUrl,
      })
    );

    // Send email
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'DentaLeague <setup@resend.dev>',
      to: [user.email],
      subject: `🎉 ${clinic.name} is ready on DentaLeague!`,
      html: emailHtml,
    });

    if (emailError) {
      console.error('Error sending clinic setup email:', emailError);
      throw emailError;
    }

    // Log email
    await supabase.from('email_logs').insert({
      user_id: userId,
      clinic_id: clinicId,
      email_type: 'clinic_setup',
      recipient_email: user.email,
      subject: `🎉 ${clinic.name} is ready on DentaLeague!`,
      status: 'sent',
      resend_id: emailData?.id,
      sent_at: new Date().toISOString(),
      metadata: { clinicName: clinic.name, clinicCode: clinic.clinic_code },
    });

    console.log('Clinic setup email sent successfully:', emailData);

    return new Response(
      JSON.stringify({ success: true, emailId: emailData?.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-clinic-setup-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
