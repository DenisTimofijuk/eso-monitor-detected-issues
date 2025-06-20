import nodemailer from "nodemailer";
import { saveLog } from "../utils/logger";

const logger = saveLog();

export default class EmailService {
    transporter: nodemailer.Transporter;

    constructor(
        private user: string,
        password: string,
        private recipient: string
    ) {
        // Create transporter using Gmail SMTP
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: user,
                pass: password,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });
    }

    async send(
        subject: string,
        htmlMessage: string
    ) {
        const mailOptions = {
            from: this.user,
            to: this.recipient,
            subject: subject, //`[${eventType}] ${subject}`,
            html: htmlMessage,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            logger.info(`✅ Email sent successfully: ${info.messageId}`);
            return { success: true, messageId: info.messageId };
        } catch (error: any) {
            logger.error("❌ Failed to send email:", error.message);
            return { success: false, error: error.message };
        }
    }
}
