import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface JoinRequestNotificationProps {
  ownerName: string;
  userName: string;
  userEmail: string;
  clinicName: string;
  dashboardUrl: string;
}

export const JoinRequestNotification = ({
  ownerName,
  userName,
  userEmail,
  clinicName,
  dashboardUrl,
}: JoinRequestNotificationProps) => (
  <Html>
    <Head />
    <Preview>New join request for {clinicName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New Join Request</Heading>
        <Text style={text}>Hi {ownerName},</Text>
        <Text style={text}>
          <strong>{userName}</strong> ({userEmail}) has requested to join <strong>{clinicName}</strong>.
        </Text>
        <Section style={buttonContainer}>
          <Link href={dashboardUrl} style={button}>
            Review Request
          </Link>
        </Section>
        <Text style={text}>
          You can review and approve or deny this request from your dashboard's Pending Requests section.
        </Text>
        <Text style={footer}>
          This is an automated email from your clinic management system.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default JoinRequestNotification;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 40px',
};

const buttonContainer = {
  padding: '27px 0 27px',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#5469d4',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 40px',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 40px',
  marginTop: '32px',
};
