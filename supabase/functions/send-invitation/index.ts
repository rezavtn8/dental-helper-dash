import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvitationEmailRequest {
  invitationToken: string;
  recipientEmail: string;
  recipientName: string;
  clinicName: string;
  invitationId: string;
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
    console.log('Starting invitation email process...');
    requestBody = await req.json();
    
    const { invitationToken, recipientEmail, recipientName, clinicName, invitationId } = requestBody;
    
    console.log('Invitation details:', { 
      invitationId, 
      recipientEmail, 
      recipientName, 
      clinicName,
      hasToken: !!invitationToken 
    });
    
    // Use PUBLIC_APP_URL environment variable, fallback to localhost for development
    const publicAppUrl = Deno.env.get('PUBLIC_APP_URL') || 'http://localhost:5173';
    const acceptUrl = `${publicAppUrl}/accept-invitation?token=${invitationToken}`;
    console.log('Accept URL created:', acceptUrl);

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

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "Clinic Team <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `Join ${clinicName} as an Assistant - Setup Your Account`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
          <div style="background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #0f766e; font-size: 28px; margin-bottom: 8px;">Assistant Invitation</h1>
              <p style="color: #64748b; font-size: 16px; margin: 0;">Join ${clinicName} as an Assistant</p>
            </div>
            
            <div style="margin-bottom: 32px;">
              <p style="color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
                Hi ${recipientName},
              </p>
              <p style="color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                You've been invited to join <strong>${clinicName}</strong> as an <strong>Assistant</strong>. Click the button below to create your assistant account and get started.
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${acceptUrl}" style="display: inline-block; background-color: #0f766e; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Create Assistant Account
                </a>
              </div>
              
              <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="color: #0f766e; font-size: 14px; word-break: break-all; background-color: #f1f5f9; padding: 12px; border-radius: 6px;">
                ${acceptUrl}
              </p>
            </div>
            
            <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; text-align: center;">
              <p style="color: #64748b; font-size: 14px; margin: 0;">
                This invitation will expire in 7 days. If you have any questions, please contact your team administrator.
              </p>
            </div>
          </div>
        </div>
      `,
    });

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