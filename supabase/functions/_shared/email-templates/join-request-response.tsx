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

interface JoinRequestResponseProps {
  userName: string;
  clinicName: string;
  status: 'approved' | 'denied';
  denialReason?: string;
  dashboardUrl: string;
}

export const JoinRequestResponse = ({
  userName,
  clinicName,
  status,
  denialReason,
  dashboardUrl,
}: JoinRequestResponseProps) => (
  <Html>
    <Head />
    <Preview>
      Your join request for {clinicName} has been {status}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          Join Request {status === 'approved' ? 'Approved' : 'Denied'}
        </Heading>
        <Text style={text}>Hi {userName},</Text>
        {status === 'approved' ? (
          <>
            <Text style={text}>
              Great news! Your request to join <strong>{clinicName}</strong> has been approved.
            </Text>
            <Section style={buttonContainer}>
              <Link href={dashboardUrl} style={button}>
                Go to Dashboard
              </Link>
            </Section>
            <Text style={text}>
              You can now access the clinic dashboard and start managing your tasks.
            </Text>
          </>
        ) : (
          <>
            <Text style={text}>
              Your request to join <strong>{clinicName}</strong> has been denied.
            </Text>
            {denialReason && (
              <Text style={{...text, backgroundColor: '#f4f4f4', padding: '16px', borderRadius: '4px', margin: '20px 40px'}}>
                <strong>Reason:</strong> {denialReason}
              </Text>
            )}
            <Text style={text}>
              If you have any questions, please contact the clinic directly.
            </Text>
          </>
        )}
        <Text style={footer}>
          This is an automated email from your clinic management system.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default JoinRequestResponse;

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
