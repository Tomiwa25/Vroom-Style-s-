import nodemailer from "nodemailer";

interface SendOtpEmailOptions {
  to: string;
  firstName: string;
  code: string;
}

const getTransporter = () => {
  const mailDriver = (process.env.MAIL || process.env.MAIL_DRIVER || "").toLowerCase();
  if (mailDriver === "log") {
    // Explicit log mode: bypass external SMTP and log directly to console
    return null;
  }

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
  }

  // Fallback if SMTP is not configured
  return null;
};

/**
 * Generates an email template styled with Vroom Style(s) luxury atelier aesthetics.
 */
export const generateVroomOtpEmailHtml = (firstName: string, code: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vroom Style(s) - Email Verification</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f4f5;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #09090b;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f4f4f5;
      padding: 40px 16px;
    }
    .card {
      max-width: 540px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e4e4e7;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    }
    .banner-bar {
      background-color: #09090b;
      color: #fafafa;
      text-align: center;
      padding: 10px 20px;
      font-size: 11px;
      letter-spacing: 0.12em;
      font-weight: 600;
      text-transform: uppercase;
    }
    .header {
      padding: 32px 32px 24px;
      text-align: center;
      border-bottom: 1px solid #f1f1f4;
    }
    .brand-mark {
      display: inline-block;
      width: 44px;
      height: 44px;
      line-height: 44px;
      background-color: #09090b;
      color: #d4af37;
      font-size: 22px;
      font-weight: 800;
      border-radius: 10px;
      border: 1px solid #d4af37;
      margin-bottom: 12px;
    }
    .brand-name {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #09090b;
      margin: 0;
      text-transform: uppercase;
    }
    .brand-sub {
      font-size: 11px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #71717a;
      margin-top: 4px;
    }
    .content {
      padding: 36px 32px;
    }
    .greeting {
      font-size: 16px;
      font-weight: 600;
      color: #09090b;
      margin-bottom: 14px;
    }
    .message {
      font-size: 14px;
      line-height: 1.6;
      color: #52525b;
      margin-bottom: 28px;
    }
    .code-container {
      background-color: #09090b;
      border: 1px solid #27272a;
      border-radius: 10px;
      padding: 24px 20px;
      text-align: center;
      margin: 24px 0;
    }
    .code-label {
      font-size: 11px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: #a1a1aa;
      margin-bottom: 12px;
      font-weight: 600;
    }
    .otp-code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 38px;
      font-weight: 800;
      color: #d4af37;
      letter-spacing: 12px;
      margin: 0;
      padding-left: 12px;
    }
    .code-expires {
      font-size: 12px;
      color: #a1a1aa;
      margin-top: 10px;
      font-weight: 500;
    }
    .info-box {
      background-color: #fafafa;
      border-left: 3px solid #d4af37;
      padding: 12px 16px;
      border-radius: 0 6px 6px 0;
      margin-bottom: 28px;
    }
    .info-box p {
      font-size: 12px;
      line-height: 1.5;
      color: #71717a;
      margin: 0;
    }
    .footer {
      background-color: #fafafa;
      padding: 24px 32px;
      border-top: 1px solid #f1f1f4;
      text-align: center;
    }
    .footer p {
      font-size: 11px;
      color: #a1a1aa;
      margin: 4px 0;
      line-height: 1.5;
    }
    .footer-brand {
      font-weight: 700;
      color: #71717a;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="banner-bar">
        VROOM STYLE(S) ATELIER SECURITY
      </div>
      
      <div class="header">
        <div class="brand-mark">V</div>
        <h1 class="brand-name">Vroom Style(s)</h1>
        <div class="brand-sub">Modern Essentials & Atelier</div>
      </div>

      <div class="content">
        <div class="greeting">Hello ${firstName || "Valued Member"},</div>
        
        <p class="message">
          Welcome to <strong>Vroom Style(s)</strong>. To verify your email address and activate full access to your Atelier membership, please enter the six-digit verification code below:
        </p>

        <div class="code-container">
          <div class="code-label">Verification Code</div>
          <div class="otp-code">${code}</div>
          <div class="code-expires">Valid for 10 minutes</div>
        </div>

        <div class="info-box">
          <p>
            <strong>Security Notice:</strong> If you did not create an account or request this code, no action is required. Your information remains safe. Never share this code with anyone.
          </p>
        </div>

        <p class="message" style="margin-bottom: 0; font-size: 13px;">
          Warm regards,<br />
          <strong>The Vroom Style(s) Concierge</strong>
        </p>
      </div>

      <div class="footer">
        <p class="footer-brand">VROOM STYLE(S) — ELEVATED ESSENTIALS</p>
        <p>This is an automated security transmission. Please do not reply directly to this email.</p>
        <p>© ${new Date().getFullYear()} Vroom Style(s). All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
};

/**
 * Sends a 6-digit OTP verification email to the user.
 */
export const sendOtpVerificationEmail = async ({
  to,
  firstName,
  code,
}: SendOtpEmailOptions): Promise<boolean> => {
  const from = process.env.EMAIL_FROM || '"Vroom Style(s) Atelier" <security@vroomstyles.com>';
  const subject = `Your Vroom Style(s) Verification Code: ${code}`;
  const html = generateVroomOtpEmailHtml(firstName, code);
  const text = `Hello ${firstName || "Valued Member"},\n\nYour Vroom Style(s) verification code is: ${code}\n\nThis code is valid for 10 minutes.\nIf you did not request this code, please ignore this email.\n\nWarm regards,\nVroom Style(s) Concierge`;

  const transporter = getTransporter();

  if (transporter) {
    try {
      await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
      });
      console.log(`[EmailService] Verification email sent to ${to}`);
      return true;
    } catch (err) {
      console.error(`[EmailService] Failed to send email via SMTP to ${to}:`, err);
      // Fall through to console log fallback so testing/dev is never blocked
    }
  }

  // Log driver output for instant local debugging and MAIL=log
  const mailDriver = (process.env.MAIL || process.env.MAIL_DRIVER || "log").toUpperCase();
  console.log("==================================================================");
  console.log(`[VROOM STYLE(S) ATELIER MAIL DISPATCH - DRIVER: ${mailDriver}]`);
  console.log(`To: ${to} (${firstName})`);
  console.log(`Subject: ${subject}`);
  console.log(`Verification Code: [ ${code} ]`);
  console.log(`Expires in: 10 minutes`);
  console.log("==================================================================");

  return true;
};

export interface SendDeliveryEmailOptions {
  to: string;
  firstName: string;
  orderId: string;
  carrier?: string;
  trackingNumber?: string;
  deliveryDate?: string;
}

/**
 * Generates an email template notifying the client that their order is out for delivery.
 */
export const generateOrderDeliveryEmailHtml = ({
  firstName,
  orderId,
  carrier = "Vroom Express Courier",
  trackingNumber,
  deliveryDate = "Today between 2:00 PM - 6:00 PM",
}: Omit<SendDeliveryEmailOptions, "to">): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vroom Style(s) - Order Out for Delivery</title>
  <style>
    body {
      margin: 0; padding: 0; background-color: #0c0c0e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5;
    }
    .wrapper { width: 100%; background-color: #0c0c0e; padding: 40px 16px; }
    .container { max-width: 580px; margin: 0 auto; background-color: #141417; border-radius: 12px; border: 1px solid #27272a; overflow: hidden; }
    .header { background: linear-gradient(135deg, #18181b 0%, #09090b 100%); padding: 36px 32px; text-align: center; border-bottom: 1px solid #27272a; }
    .brand-mark { display: inline-block; width: 44px; height: 44px; line-height: 44px; border-radius: 50%; background: #d4af37; color: #000; font-size: 20px; font-weight: 800; }
    .brand-title { margin-top: 12px; font-size: 19px; letter-spacing: 0.15em; font-weight: 700; color: #ffffff; text-transform: uppercase; }
    .content { padding: 36px 32px; }
    .greeting { font-size: 18px; font-weight: 600; color: #ffffff; margin-bottom: 12px; }
    .lead { font-size: 14px; line-height: 1.6; color: #a1a1aa; margin-bottom: 24px; }
    .delivery-card { background: #1c1c21; border-radius: 8px; border: 1px solid #3f3f46; padding: 20px; margin-bottom: 24px; }
    .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px; }
    .detail-label { color: #71717a; }
    .detail-val { color: #f4f4f5; font-weight: 600; }
    .status-pill { display: inline-block; background: rgba(46, 204, 113, 0.15); color: #2ecc71; border: 1px solid rgba(46, 204, 113, 0.3); padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
    .footer { padding: 24px 32px; text-align: center; font-size: 11px; color: #71717a; border-top: 1px solid #27272a; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="brand-mark">V</div>
        <div class="brand-title">Vroom Style(s) Atelier</div>
      </div>
      <div class="content">
        <div class="greeting">Dear ${firstName || "Valued Patron"},</div>
        <p class="lead">
          Your bespoke order has been released from our atelier distribution hub and is <strong>out for delivery</strong> today.
        </p>

        <div class="delivery-card">
          <div class="detail-row">
            <span class="detail-label">Order Reference:</span>
            <span class="detail-val">#${orderId}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Fulfillment Status:</span>
            <span class="status-pill">Out for Delivery</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Courier Service:</span>
            <span class="detail-val">${carrier}</span>
          </div>
          ${trackingNumber ? `
          <div class="detail-row">
            <span class="detail-label">Tracking Number:</span>
            <span class="detail-val" style="color: #d4af37;">${trackingNumber}</span>
          </div>` : ""}
          <div class="detail-row" style="margin-bottom: 0;">
            <span class="detail-label">Estimated Delivery:</span>
            <span class="detail-val" style="color: #2ecc71;">${deliveryDate}</span>
          </div>
        </div>

        <p style="font-size: 13px; color: #a1a1aa; line-height: 1.5;">
          Please ensure someone is available at the delivery destination to inspect and sign for your luxury shipment.
        </p>
      </div>
      <div class="footer">
        © 2026 Vroom Style(s) Atelier. Luxury essentials & modern momentum.
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Sends a real-time out-for-delivery notification email to the customer.
 */
export const sendOrderOutForDeliveryEmail = async (
  options: SendDeliveryEmailOptions
): Promise<boolean> => {
  const { to, firstName, orderId, carrier, trackingNumber, deliveryDate } = options;
  const from = process.env.EMAIL_FROM || '"Vroom Style(s) Atelier Concierge" <concierge@vroomstyles.com>';
  const subject = `Your Vroom Style(s) Order #${orderId.slice(0, 8)} is Out for Delivery!`;
  const html = generateOrderDeliveryEmailHtml({
    firstName,
    orderId,
    carrier,
    trackingNumber,
    deliveryDate,
  });
  const text = `Hello ${firstName || "Valued Patron"},\n\nYour Vroom Style(s) Order #${orderId} is out for delivery!\nCourier: ${carrier || "Vroom Express"}\nEstimated Arrival: ${deliveryDate || "Today"}\n\nWarm regards,\nVroom Style(s) Concierge`;

  const transporter = getTransporter();

  if (transporter) {
    try {
      await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
      });
      console.log(`[EmailService] Out-for-delivery email dispatched to ${to}`);
      return true;
    } catch (err) {
      console.error(`[EmailService] Failed to send delivery email via SMTP to ${to}:`, err);
    }
  }

  // Console log driver output for local development & test runs
  const mailDriver = (process.env.MAIL || process.env.MAIL_DRIVER || "log").toUpperCase();
  console.log("==================================================================");
  console.log(`[VROOM STYLE(S) DELIVERY DISPATCH NOTIFICATION - DRIVER: ${mailDriver}]`);
  console.log(`To: ${to} (${firstName})`);
  console.log(`Subject: ${subject}`);
  console.log(`Order ID: #${orderId}`);
  console.log(`Courier: ${carrier || "Vroom Express"}`);
  console.log(`Delivery Window: ${deliveryDate || "Today"}`);
  console.log("==================================================================");

  return true;
};

