import nodemailer from 'nodemailer';

export const sendRecoveryEmail = async (to: string, url: string) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmx.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        tls: {
        rejectUnauthorized: false
    }
    });

    const html = `
    <div>
        <h1>Recuperación de contraseña</h1>
        <p>Se ha solicitado una recuperación de contraseña a una cuenta relacionada a este correo.</p>
        <p>Da click en el siguiente enlace para continuar con el proceso de recuperación de contraseña:</p>
        <a href="${url}">${url}</a>
        <p>Si tú no solicitaste este proceso, solo ignora este correo.</p>
    </div>
    `;

    await transporter.sendMail({
        from: `Remix ERP <${process.env.EMAIL_USER}>`,
        to: to,
        subject: 'Restablecimiento de contraseña',
        html: html
    });
}