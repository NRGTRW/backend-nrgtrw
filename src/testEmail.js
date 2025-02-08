import transporter from "./utils/smtpConfig.js";

const sendTestEmail = async () => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER, // Sender email
      to: "recipient@example.com", // Replace with the recipient's email address
      subject: "Test Email from Nodemailer", // Subject line
      text: "This is a test email sent using Gmail SMTP.", // Plain text body
      html: "<p>This is a <b>test email</b> sent using Gmail SMTP.</p>" // HTML body
    });

    console.log("Test email sent successfully:", info.response);
  } catch (error) {
    console.error("Error sending test email:", error.message);
  }
};

sendTestEmail();
