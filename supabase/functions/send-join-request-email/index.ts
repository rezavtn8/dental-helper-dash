import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';
import { Resend } from 'npm:resend@4.0.0';
import React from 'npm:react@18.3.1';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { JoinRequestNotification } from '../_shared/email-templates/join-request-notification.tsx';
import { JoinRequestResponse } from '../_shared/email-templates/join-request-response.tsx';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  type: 'new_request' | 'approved' | 'denied';
  userName: string;
  userEmail: string;
  clinicName: string;
  ownerName?: string;
  ownerEmail?: string;
  denialReason?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, userName, userEmail, clinicName, ownerName, ownerEmail, denialReason }: EmailRequest = await req.json();
    
    console.log(`Processing join request email: type=${type}, user=${userEmail}`);

    const dashboardUrl = `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovableproject.com') || 'https://app.lovable.dev'}/owner`;

    let emailResponse;

    if (type === 'new_request') {
      // Send to clinic owner
      if (!ownerEmail || !ownerName) {
        throw new Error('Owner email and name are required for new request notification');
      }

      const html = await renderAsync(
        React.createElement(JoinRequestNotification, {
          ownerName,
          userName,
          userEmail,
          clinicName,
          dashboardUrl,
        })
      );

      emailResponse = await resend.emails.send({
        from: 'Clinic Management <onboarding@resend.dev>',
        to: [ownerEmail],
        subject: `New Join Request for ${clinicName}`,
        html,
      });

      console.log('Owner notification email sent:', emailResponse);
    } else {
      // Send to user (approved or denied)
      const html = await renderAsync(
        React.createElement(JoinRequestResponse, {
          userName,
          clinicName,
          status: type as 'approved' | 'denied',
          denialReason,
          dashboardUrl: dashboardUrl.replace('/owner', '/assistant'),
        })
      );

      emailResponse = await resend.emails.send({
        from: 'Clinic Management <onboarding@resend.dev>',
        to: [userEmail],
        subject: `Join Request ${type === 'approved' ? 'Approved' : 'Denied'} - ${clinicName}`,
        html,
      });

      console.log(`User ${type} email sent:`, emailResponse);
    }

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: any) {
    console.error('Error sending join request email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
