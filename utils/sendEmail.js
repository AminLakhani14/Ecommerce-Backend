import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  try {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email credentials not configured. Skipping email send.');
      return;
    }

    // 1) Create a transporter
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // or another service like SendGrid, Mailgun
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 2) Define the email options
    const mailOptions = {
      from: 'AG-Store <aminlakhani254@gmail.com>',
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    // 3) Actually send the email
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending email:', error.message);
    // Don't throw the error - just log it so the order process can continue
    // This prevents AggregateError from bubbling up
  }
};

export default sendEmail;