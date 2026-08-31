import nodemailer from "nodemailer";
import { env, isEtherealConfigured } from "../../config/env.js";
import { logger } from "../../config/logger.js";
export class EtherealEmailProvider {
    transporterPromise = null;
    async getTransporter() {
        if (this.transporterPromise) {
            return this.transporterPromise;
        }
        this.transporterPromise = (async () => {
            if (isEtherealConfigured()) {
                return nodemailer.createTransport({
                    host: env.ETHEREAL_HOST,
                    port: env.ETHEREAL_PORT,
                    secure: false,
                    auth: {
                        user: env.ETHEREAL_USER,
                        pass: env.ETHEREAL_PASSWORD
                    }
                });
            }
            // No Ethereal credentials configured: create a throwaway test account
            // automatically. This only works when the process can reach the
            // public internet; it is a convenience for local development, not a
            // substitute for real credentials in shared/deployed environments.
            logger.warn("[email] ETHEREAL_* env vars not set - creating a temporary Ethereal test account");
            const testAccount = await nodemailer.createTestAccount();
            return nodemailer.createTransport({
                host: testAccount.smtp.host,
                port: testAccount.smtp.port,
                secure: testAccount.smtp.secure,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });
        })();
        return this.transporterPromise;
    }
    async send(input) {
        const transporter = await this.getTransporter();
        const info = await transporter.sendMail({
            from: input.fromName ? `"${input.fromName}" <${input.from}>` : input.from,
            to: input.to,
            subject: input.subject,
            html: input.body
        });
        const previewUrl = nodemailer.getTestMessageUrl(info);
        return {
            messageId: info.messageId,
            recipient: input.to,
            previewUrl: previewUrl || null
        };
    }
}
//# sourceMappingURL=EtherealEmailProvider.js.map