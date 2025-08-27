import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationEmailRequest {
  email: string;
  name: string;
  invitationToken: string;
  clinicName: string;
  inviterName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, invitationToken, clinicName, inviterName }: InvitationEmailRequest = await req.json();

    const acceptUrl = `${req.headers.get('origin')}/accept-invitation?token=${invitationToken}`;

    const emailResponse = await resend.emails.send({
      from: "ClinicFlow <onboarding@resend.dev>",
      to: [email],
      subject: `You're invited to join ${clinicName} on ClinicFlow`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">ClinicFlow</h1>
            <p style="color: #6b7280; margin: 5px 0;">Professional Clinic Management</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
            <h2 style="color: #1e293b; margin-top: 0;">You're Invited!</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              Hi ${name},<br><br>
              ${inviterName} has invited you to join <strong>${clinicName}</strong> as a team member on ClinicFlow.
            </p>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              ClinicFlow helps clinical teams manage tasks, track patient care, and collaborate effectively.
            </p>
          </div>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${acceptUrl}" 
               style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Accept Invitation & Create Account
            </a>
          </div>
          
          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin-top: 30px;">
            <h3 style="color: #1e293b; margin-top: 0; font-size: 16px;">What's Next?</h3>
            <ol style="color: #475569; margin: 10px 0; padding-left: 20px;">
              <li>Click the button above to accept your invitation</li>
              <li>Create your secure password</li>
              <li>Access your personalized dashboard</li>
              <li>Start collaborating with your team</li>
            </ol>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; text-align: center;">
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">
              This invitation will expire in 7 days.<br>
              If you have any questions, please contact your clinic administrator.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Invitation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending invitation email:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);