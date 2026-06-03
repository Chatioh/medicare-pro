const transporter = require('../config/email');

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"MediCare Pro" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html
    });
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
};

module.exports = { sendEmail };
