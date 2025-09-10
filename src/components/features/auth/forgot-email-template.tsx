import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type ForgotPasswordEmailProps = {
  userFirstname?: string;
  resetPasswordLink?: string;
};

export const ForgotPasswordEmail = ({
  userFirstname,
  resetPasswordLink,
}: ForgotPasswordEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>Forgot your password</Preview>
        <Container style={container}>
          {/* <Img
            alt="Acme"
            height="33"
            src={`${baseUrl}/static/acme-logo.png`}
            width="40"
          /> */}
          <Section>
            <Text style={text}>Hi {userFirstname},</Text>
            <Text style={text}>
              Someone recently requested a password change for your Agri-Lms
              account. If this was you, you can set a new password here:
            </Text>
            <Button href={resetPasswordLink} style={button}>
              Reset password
            </Button>
            <Text style={text}>
              If you don&apos;t want to change your password or didn&apos;t
              request this, just ignore and delete this message.
            </Text>
            <Text style={text}>
              To keep your account secure, please don&apos;t forward this email
              to anyone. See our Help Center for{" "}
              <Link href={resetPasswordLink} style={anchor}>
                more security tips.
              </Link>
            </Text>
            <Text style={text}>Happy Learning!</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

ForgotPasswordEmail.PreviewProps = {
  userFirstname: "Alan",
  resetPasswordLink: "https://www.dropbox.com",
} as ForgotPasswordEmailProps;

export default ForgotPasswordEmail;

const main = {
  backgroundColor: "#f6f9fc",
  padding: "10px 0",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #f0f0f0",
  padding: "45px",
};

const text = {
  fontSize: "16px",
  fontFamily:
    "'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif",
  fontWeight: "300",
  color: "#404040",
  lineHeight: "26px",
};

const button = {
  backgroundColor: "#2E7D32", // Forest green color
  borderRadius: "4px",
  color: "#fff",
  fontFamily: "'Open Sans', 'Helvetica Neue', Arial",
  fontSize: "15px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "210px",
  padding: "14px 7px",
};

const anchor = {
  textDecoration: "underline",
};
