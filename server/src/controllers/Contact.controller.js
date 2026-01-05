import nodemailer from "nodemailer";

export const handleContactForm = async (req, res) => {
  const { name, email, message } = req.body;

  // 1. Create a transporter (Use Gmail, SendGrid, or Mailtrap)
  const transporter = nodemailer.createTransport({
    service: "gmail", 
    auth: {
      user: process.env.EMAIL_USER, // Your company email
      pass: process.env.EMAIL_PASS, // App-specific password
    },
  });

  const mailOptions = {
    from: email,
    to: process.env.EMAIL_USER,
    subject: `New Contact Request from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    html: `<h3>New Inquiry from MG Finance Contact Page</h3>
           <p><strong>Name:</strong> ${name}</p>
           <p><strong>Email:</strong> ${email}</p>
           <p><strong>Message:</strong> ${message}</p>`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: "Message sent successfully!" });
  } catch (error) {
    console.error("Email Error:", error);
    res.status(500).json({ error: "Failed to send message. Try again later." });
  }
};