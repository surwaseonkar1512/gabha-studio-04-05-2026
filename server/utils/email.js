const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: process.env.MAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_USER || process.env.SMTP_EMAIL,
      pass: process.env.MAIL_PASS || process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Gabha Studio" <${process.env.MAIL_USER || process.env.SMTP_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html, // Optional HTML content
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
