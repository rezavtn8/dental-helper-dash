import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Email configuration
const getFromAddress = () => {
  const fromEmail = Deno.env.get("FROM_EMAIL");
  const fromName = Deno.env.get("FROM_NAME") || "Team Invitation";
  
  if (fromEmail && fromEmail.includes('@') && !fromEmail.includes('resend.dev')) {
    return `${fromName} <${fromEmail}>`;
  }
  
  return "Team Invitation <onboarding@resend.dev>";
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TeamInvitationRequest {
  invitationId: string;
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  clinicName: string;
  role: 'assistant' | 'admin';
  joinUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed. Use POST to send invitations." }),
      {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  try {
    const {
      invitationId,
      recipientEmail,
      recipientName,
      senderName,
      clinicName,
      role,
      joinUrl
    }: TeamInvitationRequest = await req.json();

    console.log('Team invitation request:', { 
      invitationId, 
      recipientEmail, 
      recipientName,
      clinicName,
      role,
      joinUrl
    });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify invitation exists and is valid
    const { data: invitation, error: checkError } = await supabase
      .from('invitations')
      .select('id, status, expires_at, email')
      .eq('id', invitationId)
      .single();

    if (checkError || !invitation) {
      throw new Error(`Invalid invitation: ${checkError?.message || 'Not found'}`);
    }

    if (invitation.status !== 'pending') {
      throw new Error(`Invitation is ${invitation.status}, cannot send email`);
    }

    if (invitation.email !== recipientEmail) {
      throw new Error('Email mismatch');
    }

    console.log('Invitation verified, sending email...');

    // Send professional team invitation email
    const emailResponse = await resend.emails.send({
      from: getFromAddress(),
      to: [recipientEmail],
      subject: `Join ${clinicName} as ${role === 'assistant' ? 'a Dental Assistant' : 'an Admin'}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Join ${clinicName} Team</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f6f8fa; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1); overflow: hidden;">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 48px 32px; text-align: center;">
                <div style="width: 64px; height: 64px; background: rgba(255, 255, 255, 0.2); border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style="color: white;">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="m19 8 2 2-2 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="m17 10 2-2-2-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.02em;">
                  You're Invited!
                </h1>
                <p style="margin: 12px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 18px; font-weight: 500;">
                  Join ${clinicName}
                </p>
              </div>
              
              <!-- Content -->
              <div style="padding: 48px 32px;">
                <div style="text-align: center; margin-bottom: 32px;">
                  <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 24px; font-weight: 600;">
                    Welcome to the Team!
                  </h2>
                  <p style="margin: 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                    ${senderName} has invited you to join <strong>${clinicName}</strong> as ${role === 'assistant' ? 'a dental assistant' : 'an admin'}. 
                    Click below to accept your invitation and get started.
                  </p>
                </div>
                
                <!-- CTA Button -->
                <div style="text-align: center; margin: 40px 0;">
                  <a href="${joinUrl}" 
                     style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 16px rgba(79, 70, 229, 0.3); transition: all 0.2s;">
                    Accept Invitation & Join Team
                  </a>
                </div>
                
                <!-- Info Cards -->
                <div style="display: grid; gap: 16px; margin: 40px 0;">
                  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
                    <h3 style="margin: 0 0 12px 0; color: #1e293b; font-size: 16px; font-weight: 600; display: flex; align-items: center;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="margin-right: 8px; color: #3b82f6;">
                        <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M9 7 v6 a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      Your Role: ${role === 'assistant' ? 'Dental Assistant' : 'Team Admin'}
                    </h3>
                    <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.5;">
                      ${role === 'assistant' 
                        ? 'Manage patient logs, complete daily tasks, and support clinic operations'
                        : 'Assist with team management, task oversight, and administrative functions'
                      }
                    </p>
                  </div>
                  
                  <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px;">
                    <h3 style="margin: 0 0 12px 0; color: #166534; font-size: 16px; font-weight: 600; display: flex; align-items: center;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="margin-right: 8px; color: #10b981;">
                        <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      What Happens Next
                    </h3>
                    <ul style="margin: 0; padding-left: 0; list-style: none; color: #166534; font-size: 14px; line-height: 1.6;">
                      <li style="margin-bottom: 6px; padding-left: 20px; position: relative;">
                        <span style="position: absolute; left: 0; top: 0;">•</span>
                        Sign in with your Google account or create new credentials
                      </li>
                      <li style="margin-bottom: 6px; padding-left: 20px; position: relative;">
                        <span style="position: absolute; left: 0; top: 0;">•</span>
                        You'll be automatically added to the ${clinicName} team
                      </li>
                      <li style="margin-bottom: 6px; padding-left: 20px; position: relative;">
                        <span style="position: absolute; left: 0; top: 0;">•</span>
                        Access your personalized dashboard immediately
                      </li>
                      <li style="margin-bottom: 0; padding-left: 20px; position: relative;">
                        <span style="position: absolute; left: 0; top: 0;">•</span>
                        Start collaborating with your team right away
                      </li>
                    </ul>
                  </div>
                </div>
                
                <!-- Fallback Link -->
                <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-top: 32px;">
                  <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b;">
                    Having trouble with the button? Copy and paste this link:
                  </p>
                  <p style="margin: 0; font-size: 13px; word-break: break-all; color: #4f46e5; font-family: monospace;">
                    ${joinUrl}
                  </p>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="background: #f8fafc; padding: 24px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
                <div style="margin-bottom: 16px;">
                  <p style="margin: 0; font-size: 14px; color: #64748b; font-weight: 500;">
                    Invited by ${senderName} at ${clinicName}
                  </p>
                </div>
                <p style="margin: 0; font-size: 12px; color: #9ca3af; line-height: 1.5;">
                  This invitation will expire in 7 days for security. If you didn't expect this invitation 
                  or have concerns, please contact ${clinicName} directly.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (emailResponse.error) {
      throw emailResponse.error;
    }

    console.log("Email sent successfully:", emailResponse);

    // Update invitation record
    const { error: updateError } = await supabase
      .from('invitations')
      .update({
        email_sent_at: new Date().toISOString(),
        last_email_sent_at: new Date().toISOString(),
        email_status: 'sent',
        message_id: emailResponse.data?.id
      })
      .eq('id', invitationId);

    if (updateError) {
      console.error("Failed to update invitation:", updateError);
    }

    return new Response(JSON.stringify({
      success: true,
      messageId: emailResponse.data?.id
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error sending team invitation:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to send invitation'
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);