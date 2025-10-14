import { Body, Container, Head, Heading, Html, Link, Preview, Section, Text } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface InvitationEmailProps {
  inviteeName: string;
  inviterName: string;
  clinicName: string;
  role: string;
  invitationUrl: string;
  expiresIn: string;
}

export const InvitationEmail = ({
  inviteeName,
  inviterName,
  clinicName,
  role,
  invitationUrl,
  expiresIn
}: InvitationEmailProps) => (
  <Html>
    <Head />
    <Preview>Join {clinicName} on DentaLeague! 🎉</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>You've Been Invited! 🎉</Heading>
        
        <Text style={text}>Hi {inviteeName},</Text>
        
        <Text style={text}>
          <strong>{inviterName}</strong> has invited you to join <strong>{clinicName}</strong> on DentaLeague 
          as a <strong>{role}</strong>. We're excited to have you join the team!
        </Text>

        <Section style={infoBox}>
          <Text style={infoText}>
            <strong>Clinic:</strong> {clinicName}
          </Text>
          <Text style={infoText}>
            <strong>Role:</strong> {role}
          </Text>
          <Text style={infoText}>
            <strong>Invited by:</strong> {inviterName}
          </Text>
        </Section>

        <Text style={text}>
          DentaLeague is a comprehensive dental practice management platform that helps teams:
        </Text>

        <Text style={listItem}>✓ Manage tasks efficiently</Text>
        <Text style={listItem}>✓ Track patient visits</Text>
        <Text style={listItem}>✓ Access learning resources</Text>
        <Text style={listItem}>✓ Coordinate schedules</Text>

        <Section style={buttonContainer}>
          <Link href={invitationUrl} style={button}>
            Accept Invitation
          </Link>
        </Section>

        <Text style={warningText}>
          This invitation expires in {expiresIn}. Click the button above to get started!
        </Text>

        <Text style={footer}>
          Best regards,<br />
          The DentaLeague Team
        </Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  marginBottom: '64px',
  borderRadius: '8px',
  maxWidth: '600px',
};

const h1 = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: 'bold',
  marginBottom: '24px',
  textAlign: 'center' as const,
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '16px',
};

const infoBox = {
  backgroundColor: '#f0fdf4',
  padding: '20px',
  borderRadius: '8px',
  marginBottom: '24px',
  marginTop: '24px',
  border: '2px solid #10b981',
};

const infoText = {
  color: '#1f2937',
  fontSize: '14px',
  margin: '8px 0',
};

const listItem = {
  color: '#374151',
  fontSize: '15px',
  margin: '8px 0',
  paddingLeft: '8px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  marginTop: '32px',
  marginBottom: '32px',
};

const button = {
  backgroundColor: '#10b981',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const warningText = {
  color: '#f59e0b',
  fontSize: '14px',
  marginTop: '24px',
  padding: '16px',
  backgroundColor: '#fffbeb',
  borderRadius: '6px',
  borderLeft: '4px solid #f59e0b',
};

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  marginTop: '32px',
  borderTop: '1px solid #e5e7eb',
  paddingTop: '20px',
};

export default InvitationEmail;
