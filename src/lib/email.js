'use server';

import nodemailer from 'nodemailer';

// Create a reusable transporter object
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ninjab330@gmail.com', // Your Gmail address
    pass: 'rzaw fthj jlhq zqyx'  // Your Gmail app password
  }
});

/**
 * Send an email using nodemailer
 */
export async function sendEmail({ to, subject, text, html }) {
  try {
    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: '"TrackPro" <ninjab330@gmail.com>',
      to,
      subject,
      text,
      html
    });

    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
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