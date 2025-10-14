import { Body, Container, Head, Heading, Html, Link, Preview, Section, Text } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface ClinicSetupEmailProps {
  ownerName: string;
  clinicName: string;
  clinicCode: string;
  dashboardUrl: string;
}

export const ClinicSetupEmail = ({
  ownerName,
  clinicName,
  clinicCode,
  dashboardUrl
}: ClinicSetupEmailProps) => (
  <Html>
    <Head />
    <Preview>Your clinic {clinicName} is ready!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🎉 Your Clinic is Set Up!</Heading>
        
        <Text style={text}>Hi {ownerName},</Text>
        
        <Text style={text}>
          Congratulations! Your clinic <strong>{clinicName}</strong> has been successfully created on DentaLeague.
        </Text>

        <Section style={infoBox}>
          <Heading style={h2}>Clinic Details</Heading>
          <Text style={infoText}>
            <strong>Clinic Name:</strong> {clinicName}
          </Text>
          <Text style={infoText}>
            <strong>Your Clinic Code:</strong>
          </Text>
          <Section style={codeContainer}>
            <Text style={codeText}>{clinicCode}</Text>
          </Section>
          <Text style={helpText}>
            Share this code with your team members so they can join your clinic.
          </Text>
        </Section>

        <Section style={nextStepsBox}>
          <Heading style={h2}>Next Steps</Heading>
          <Text style={listItem}>✓ Invite your team members</Text>
          <Text style={listItem}>✓ Create task templates</Text>
          <Text style={listItem}>✓ Set up your schedule</Text>
          <Text style={listItem}>✓ Explore the learning hub</Text>
        </Section>

        <Section style={buttonContainer}>
          <Link href={dashboardUrl} style={button}>
            Go to Dashboard
          </Link>
        </Section>

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

const infoBox = {
  backgroundColor: '#eff6ff',
  padding: '24px',
  borderRadius: '8px',
  marginBottom: '24px',
  marginTop: '24px',
  border: '2px solid #3b82f6',
};

const nextStepsBox = {
  backgroundColor: '#f3f4f6',
  padding: '24px',
  borderRadius: '8px',
  marginBottom: '24px',
};

const infoText = {
  color: '#1f2937',
  fontSize: '14px',
  margin: '8px 0',
};

const helpText = {
  color: '#6b7280',
  fontSize: '12px',
  fontStyle: 'italic' as const,
  marginTop: '12px',
};

const codeContainer = {
  backgroundColor: '#e5e7eb',
  padding: '16px',
  borderRadius: '6px',
  textAlign: 'center' as const,
  marginTop: '12px',
  marginBottom: '12px',
};

const codeText = {
  fontSize: '28px',
  fontWeight: 'bold',
  letterSpacing: '6px',
  color: '#1f2937',
  fontFamily: 'monospace',
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

export default ClinicSetupEmail;
