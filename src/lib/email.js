'use server';

/**
 * Send an email with a beautiful, mobile-responsive template
 */
export async function sendEmail({ to, subject, text, html }) {
  // Check for email configuration
  const useRealEmail = process.env.EMAIL_SERVICE && 
                       process.env.EMAIL_USER && 
                       process.env.EMAIL_PASSWORD;
  
  try {
    // If we have email configuration, send a real email
    if (useRealEmail) {
      // Dynamically import nodemailer only on the server
      const nodemailer = await import('nodemailer');
      
      const transporter = nodemailer.createTransport({
        service: "gmail", // e.g., 'gmail'
        auth: {
          user: "ninjab330@gmail.com",
          pass: "rzaw fthj jlhq zqyx"
        }
      });
      
      await transporter.sendMail({
        from: "ninjab330@gmail.com",
        to,
        subject,
        text,
        html
      });
      
      return true;
    } else {
      // Development mode - log the email details
      console.log(`Sending email to: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Text: ${text}`);
      console.log(`HTML email would display: ${html}`);
      
      return true;
    }
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw here - email failure shouldn't break the application flow
    return false;
  }
}

/**
 * Generate a responsive HTML email template with a button
 */
export async function generateInviteEmailTemplate({
  recipientName,
  organizationName,
  inviteLink,
  expiryDays = 7
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invitation to join ${organizationName}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          background: linear-gradient(to right, #6366f1, #8b5cf6);
          color: white;
          width: 60px;
          height: 60px;
          line-height: 60px;
          text-align: center;
          border-radius: 12px;
          margin: 0 auto;
          font-weight: bold;
          font-size: 24px;
        }
        h1 {
          color: #333;
          margin-top: 20px;
        }
        .content {
          background-color: #f9fafb;
          border-radius: 8px;
          padding: 25px;
          margin-bottom: 30px;
        }
        .button {
          display: inline-block;
          background: linear-gradient(to right, #6366f1, #8b5cf6);
          color: white;
          text-decoration: none;
          padding: 12px 30px;
          border-radius: 5px;
          font-weight: bold;
          margin: 20px 0;
          text-align: center;
        }
        .footer {
          font-size: 12px;
          color: #6b7280;
          text-align: center;
        }
        .highlight {
          font-weight: bold;
          color: #6366f1;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">TP</div>
        <h1>Welcome to TrackPro!</h1>
      </div>
      
      <div class="content">
        <p>Hello ${recipientName},</p>
        <p>You have been invited to join <span class="highlight">${organizationName}</span> on TrackPro.</p>
        <p>Please click the button below to accept your invitation:</p>
        
        <div style="text-align: center;">
          <a href="${inviteLink}" class="button">Accept Invitation</a>
        </div>
        
        <p style="margin-top: 25px;">This invitation will expire in ${expiryDays} days.</p>
      </div>
      
      <div class="footer">
        <p>If you did not expect this invitation, please ignore this email.</p>
        <p>&copy; ${new Date().getFullYear()} TrackPro. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
} 