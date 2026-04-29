import nodemailer from "nodemailer";
import { welcomeEmailTemplate } from "../html/welcome.js";
import { transporter } from "../config/mailservice.js";
import dotenv from "dotenv";
dotenv.config();
export const sendWelcomeEmail = async (userEmail, firstName) => {
  try {
    const mailOptions = {
      from: `"IZI Bank" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "Welcome to IZI Bank",
      html: welcomeEmailTemplate(firstName),
    };
    await transporter.sendMail(mailOptions);
    console.log({
      success: true,
      message: `Welcome email successfully sent to ${firstName}`,
    });
  } catch (error) {
    console.log({ success: false, message: error.message });
  }
};
