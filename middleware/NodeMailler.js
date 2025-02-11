const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  pool: true, // Enable connection pooling
  maxConnections: 10, // Adjust based on your server's capacity
});

const sendEmailMessage = async (sendTo, subject, message, isHtml = false) => {
  try {
    const emailMessage = {
      from: {
        name: process.env.EMAIL_FRIENDLY_NAME,
        address: process.env.SMTP_USER,
      },
      to: sendTo,
      subject: subject,
      [isHtml ? 'html' : 'text']: message, // ใช้ html หรือ text ขึ้นอยู่กับค่า isHtml
    };

    transporter.sendMail(emailMessage);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = { sendEmailMessage };
