import nodemailer from "nodemailer";
import { EventEmitter } from "node:events";

const SendEmailServices = async ({ to, subject, html, attachments = [] }) => {
        const transport = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const info = await transport.sendMail({
            from: `Cure <${process.env.EMAIL}>`,
            to,
            subject,
            html,
            attachments,
        });
        return info;
};

const sendEmail = new EventEmitter();
sendEmail.on("SendEmail", (...arg) => {
    const { to, subject, html, attachments } = arg[0];
    SendEmailServices({
        to,
        subject,
        html,
        attachments,
    })
});

export default sendEmail;