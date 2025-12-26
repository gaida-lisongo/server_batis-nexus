import nodemailer from 'nodemailer';

class Mail {
    transporter: any;

    private getTransporter() {
        if (!this.transporter) {
            console.log('Configuration du transporteur SMTP...');
            console.log('- Host:', process.env.SMTP_HOST);
            console.log('- Port:', process.env.SMTP_PORT);
            console.log('- User:', process.env.SMTP_USER);

            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT),
                secure: process.env.SMTP_PORT === '465',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });
        }
        return this.transporter;
    }

    async sendMail(to: string, subject: string, text: string, html?: string) {
        const mailOptions = {
            from: `"Batis Nexus" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text,
            html
        };

        try {
            const info = await this.getTransporter().sendMail(mailOptions);
            console.log('E-mail envoyé avec succès:', info.messageId);
            return info;
        } catch (error) {
            console.error('Erreur détaillée SMTP:', error);
            throw error;
        }
    }

    async composeMail(textBody: string, to: string, subject: string, onSuccess: () => Promise<void>, htmlBody?: string) {
        // Envoie l'email avec support HTML
        await this.sendMail(to, subject, textBody, htmlBody);

        // Exécution de l'action de succès (ex: sauvegarde en base)
        await onSuccess();
    }
}

export default new Mail();
