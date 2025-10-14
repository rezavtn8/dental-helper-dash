import { Body, Container, Head, Heading, Html, Link, Preview, Section, Text } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface WelcomeEmailProps {
  userName: string;
  userRole: string;
  clinicName?: string;
  clinicCode?: string;
  dashboardUrl: string;
}

export const WelcomeEmail = ({
  userName,
  userRole,
  clinicName,
  clinicCode,
  dashboardUrl
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to DentaLeague! Let's get you set up 🦷</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to DentaLeague! 🦷</Heading>
        
        <Text style={text}>Hi {userName},</Text>
        
        <Text style={text}>
          Welcome to DentaLeague! We're excited to have you onboard as a <strong>{userRole}</strong>. 
          Your workspace is ready—let's get started!
        </Text>

        {clinicName && (
          <Section style={infoBox}>
            <Text style={infoText}>
              <strong>Your Clinic:</strong> {clinicName}
            </Text>
            {clinicCode && (
              <Text style={infoText}>
                <strong>Clinic Code:</strong> <code style={code}>{clinicCode}</code>
              </Text>
            )}
          </Section>
        )}

        <Section style={nextStepsBox}>
          <Heading style={h2}>What's Next?</Heading>
          <Text style={listItem}>✓ Complete your profile</Text>
          <Text style={listItem}>✓ Explore the dashboard</Text>
          {userRole === 'owner' && <Text style={listItem}>✓ Invite your team members</Text>}
          <Text style={listItem}>✓ Check out the learning hub</Text>
        </Section>

        <Section style={buttonContainer}>
          <Link href={dashboardUrl} style={button}>
            Go to Dashboard
          </Link>
        </Section>

        <Text style={text}>
          If you ever need help, just reply to this email or contact our support team. We're here for you!
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

const h2 = {
  color: '#1f2937',
  fontSize: '20px',
  fontWeight: 'bold',
  marginBottom: '16px',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '16px',
};

const nextStepsBox = {
  backgroundColor: '#f0fdf4',
  padding: '24px',
  borderRadius: '8px',
  marginBottom: '24px',
  marginTop: '24px',
  border: '1px solid #d1fae5',
};

const listItem = {
  color: '#374151',
  fontSize: '15px',
  margin: '8px 0',
  paddingLeft: '8px',
};

const infoBox = {
  backgroundColor: '#f3f4f6',
  padding: '20px',
  borderRadius: '8px',
  marginBottom: '24px',
  marginTop: '24px',
};

const infoText = {
  color: '#1f2937',
  fontSize: '14px',
  margin: '8px 0',
};

const code = {
  backgroundColor: '#e5e7eb',
  padding: '4px 8px',
  borderRadius: '4px',
  fontFamily: 'monospace',
  fontSize: '14px',
  fontWeight: 'bold',
};

const buttonContainer = {
  textAlign: 'center' as const,
  marginTop: '32px',
  marginBottom: '32px',
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  marginTop: '32px',
  borderTop: '1px solid #e5e7eb',
  paddingTop: '20px',
};

export default WelcomeEmail;
