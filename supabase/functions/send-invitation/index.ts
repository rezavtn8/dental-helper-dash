import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Production email configuration
const getFromAddress = () => {
  const fromEmail = Deno.env.get("FROM_EMAIL");
  const fromName = Deno.env.get("FROM_NAME") || "Clinic Team";
  
  // For production, use verified domain. For testing, fallback to resend test address
  if (fromEmail && fromEmail.includes('@') && !fromEmail.includes('resend.dev')) {
    return `${fromName} <${fromEmail}>`;
  }
  
  // Fallback to Resend test address (only works for verified email)
  return "Clinic Team <onboarding@resend.dev>";
};

// Retry configuration for transient failures
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvitationEmailRequest {
  invitationId: string;
  email: string;
  magicLinkUrl: string;
  clinicName?: string;
  isResend?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle GET requests with service info
  if (req.method === "GET") {
    return new Response(
      JSON.stringify({
        service: "send-invitation",
        status: "active",
        description: "Clinic invitation email service",
        version: "1.0.0"
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST for actual email sending
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed. Use POST to send invitations." }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }

  let requestBody: InvitationEmailRequest;
  
  try {
    const {
      invitationId,
      email: recipientEmail,
      magicLinkUrl,
      clinicName,
      isResend = false
    }: InvitationEmailRequest = await req.json();
    
    console.log('Invitation details:', { 
      invitationId, 
      recipientEmail, 
      clinicName,
      magicLinkUrl,
      isResend
    });

    console.log('Using provided magic link URL:', magicLinkUrl);

    // Initialize Supabase client with service role key for updating invitations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration');
      throw new Error('Missing Supabase configuration');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('Supabase client initialized');

    // Verify invitation exists and is valid before sending email
    const { data: invitationCheck, error: checkError } = await supabase
      .from('invitations')
      .select('id, status, expires_at')
      .eq('id', invitationId)
      .single();

    if (checkError) {
      console.error('Error checking invitation:', checkError);
      throw new Error(`Failed to verify invitation: ${checkError.message}`);
    }

    if (!invitationCheck) {
      console.error('Invitation not found:', invitationId);
      throw new Error('Invitation not found');
    }

    if (invitationCheck.status !== 'pending') {
      console.error('Invitation is not pending:', invitationCheck.status);
      throw new Error(`Invitation is ${invitationCheck.status}, cannot send email`);
    }

    console.log('Invitation verified, sending email...');

    // Production-ready email sending with retry logic
    const fromAddress = getFromAddress();
    console.log('Using from address:', fromAddress);
    
    let emailResponse: any;
    let lastError: any;
    
    // Retry logic for transient failures
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`Email attempt ${attempt}/${MAX_RETRIES}`);
        
        emailResponse = await resend.emails.send({
          from: fromAddress,
          to: [recipientEmail],
          subject: isResend 
            ? `Reminder: Join ${clinicName || 'our team'} as a Dental Assistant`
            : `Join ${clinicName || 'our team'} as a Dental Assistant`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${isResend ? 'Reminder: ' : ''}Invitation to join ${clinicName || 'our team'}</title>
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f8f9fa; margin: 0; padding: 0;">
                <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); overflow: hidden;">
                  <!-- Header -->
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                      ${isResend ? 'Reminder: ' : ''}You're Invited!
                    </h1>
                    <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                      Join ${clinicName || 'our dental practice'} team
                    </p>
                  </div>
                  
                  <!-- Content -->
                  <div style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #374151;">
                      Hello,
                    </p>
                    
                    <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #374151;">
                      ${isResend 
                        ? `This is a reminder that you have been invited to join <strong>${clinicName || 'our dental practice'}</strong> as a dental assistant.` 
                        : `You have been invited to join <strong>${clinicName || 'our dental practice'}</strong> as a dental assistant.`
                      } Click the button below to accept your invitation and access your account.
                    </p>
                    
                    <!-- Call-to-Action Button -->
                    <div style="text-align: center; margin: 32px 0;">
                      <a href="${magicLinkUrl}" 
                         style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); transition: transform 0.2s;">
                        Accept Invitation & Sign In
                      </a>
                    </div>
                    
                    <div style="margin: 32px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6;">
                      <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
                        What happens next?
                      </h3>
                      <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        <li style="margin-bottom: 6px;">Click the button to sign in or create your account</li>
                        <li style="margin-bottom: 6px;">You'll be automatically added to the clinic team</li>
                        <li style="margin-bottom: 6px;">Access your assistant dashboard immediately</li>
                        <li style="margin-bottom: 6px;">Start managing your daily tasks and patient logs</li>
                      </ul>
                    </div>
                    
                    <p style="margin: 24px 0 0 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
                      If you're having trouble with the button above, copy and paste this link into your browser:
                    </p>
                    <p style="margin: 8px 0 0 0; font-size: 14px; word-break: break-all; color: #3b82f6;">
                      ${magicLinkUrl}
                    </p>
                  </div>
                  
                  <!-- Footer -->
                  <div style="background-color: #f8fafc; padding: 20px 30px; border-top: 1px solid #e5e7eb; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                      This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
                    </p>
                  </div>
                </div>
              </body>
            </html>
          `,
        });
        
        // If we get here, the email was sent successfully
        break;
        
      } catch (error: any) {
        lastError = error;
        console.error(`Email attempt ${attempt} failed:`, error);
        
        // Check if this is a retryable error
        const isRetryable = error.message?.includes('rate limit') || 
                           error.message?.includes('timeout') ||
                           error.message?.includes('network') ||
                           (error.statusCode >= 500 && error.statusCode < 600);
        
        if (attempt === MAX_RETRIES || !isRetryable) {
          // Final attempt or non-retryable error
          emailResponse = { error: lastError };
          break;
        }
        
        // Wait before retry (exponential backoff)
        const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // Update invitation record with email status
    const updateData: any = {
      email_sent_at: new Date().toISOString(),
    };

    if (emailResponse.error) {
      // Email failed to send
      updateData.email_status = 'failed';
      updateData.failure_reason = emailResponse.error.message || 'Unknown error';
      console.error("Email sending failed:", emailResponse.error);
    } else {
      // Email sent successfully
      updateData.email_status = 'sent';
      updateData.message_id = emailResponse.data?.id;
      console.log("Email sent successfully:", emailResponse);
    }

    console.log('Updating invitation record with:', updateData);

    // Update invitation in database
    const { error: updateError } = await supabase
      .from('invitations')
      .update(updateData)
      .eq('id', invitationId);

    if (updateError) {
      console.error("Failed to update invitation:", updateError);
      // Don't fail the request if email was sent but update failed
      if (!emailResponse.error) {
        console.warn("Email sent but failed to update database status");
      }
    } else {
      console.log("Invitation record updated successfully");
    }

    const responseData = {
      success: !emailResponse.error,
      data: emailResponse.data,
      error: emailResponse.error,
      invitation_updated: !updateError
    };

    console.log('Sending response:', responseData);

    return new Response(JSON.stringify(responseData), {
      status: emailResponse.error ? 500 : 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-invitation function:", error);
    
    // Try to update invitation status to failed if we have the invitation ID
    let invitationId: string | undefined;
    try {
      const body = await req.clone().json();
      invitationId = body.invitationId;
    } catch {
      // Ignore parsing errors for already consumed request
    }
    
    if (invitationId) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        await supabase
          .from('invitations')
          .update({ 
            email_status: 'failed',
            failure_reason: error.message || 'Unknown error'
          })
          .eq('id', invitationId);
        
        console.log('Updated invitation status to failed for ID:', invitationId);
      } catch (updateError) {
        console.error("Failed to update invitation status after error:", updateError);
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Unknown error occurred',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);