import dotenv from 'dotenv';

dotenv.config();

import { sendEmail } from "./send-email.js";



sendEmail.emit("SendEmail", {

    to: process.env.TEST_EMAIL_RECIPENT, // Replace with a test recipient email

    subject: "Test Email from Nodemailer",

    html: "<h1>Hello from Nodemailer!</h1><p>This is a test email sent from the Cure backend.</p>",

    attachments: []

});



console.log("Emitted SendEmail event.");