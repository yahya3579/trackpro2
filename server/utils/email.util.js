// You would need to install a package like nodemailer
// npm install nodemailer

// For demonstration purposes, this is a mock implementation
// In production, you would use nodemailer or a service like SendGrid

const nodemailer = require('nodemailer');

/**
 * Sends an email using nodemailer
 * @param {Object} options Email options
 * @param {string} options.to Recipient email
 * @param {string} options.subject Email subject
 * @param {string} options.text Plain text content
 * @param {string} options.html HTML content
 * @returns {Promise} Promise resolving to the send result
 */
exports.sendEmail = async ({ to, subject, text, html }) => {
  try {
    // Log the attempt for debugging
    console.log(`Attempting to send email to: ${to}`);
    
    // Create a transporter using SMTP
    // You should store these credentials in environment variables for security
    const transporter = nodemailer.createTransport({
      // Gmail example - make sure to enable "Less secure app access" or use App Password
      service: 'gmail',
      auth: {
        user: 'ninjab330@gmail.com', // Replace with your email
        pass: 'xkst sbys lzyb ozot'         // Replace with your password or app password
      }
      
      // Outlook/Office 365 example
      // host: 'smtp.office365.com',
      // port: 587,
      // secure: false,
      // auth: {
      //   user: process.env.EMAIL_USER || 'your-email@outlook.com',
      //   pass: process.env.EMAIL_PASS || 'your-password'
      // }
      
      // Mailtrap example (for testing/development)
      // host: 'smtp.mailtrap.io',
      // port: 2525,
      // auth: {
      //   user: process.env.MAILTRAP_USER || 'your-mailtrap-username',
      //   pass: process.env.MAILTRAP_PASS || 'your-mailtrap-password'
      // }
    });

    // Set up email data
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"TrackPro" <your-email@gmail.com>',
      to, 
      subject,
      text,
      html
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('Error sending email:', error);
    
    // For development/testing fallback - log the email content
    console.log('=================== EMAIL CONTENT (NOT SENT) ===================');
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`TEXT: ${text}`);
    console.log('================================================================');
    
    throw new Error(`Failed to send email: ${error.message}`);
  }
}; 