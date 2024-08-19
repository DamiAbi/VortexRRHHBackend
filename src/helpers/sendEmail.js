import nodemailer from 'nodemailer';
import crypto from 'crypto';
import User from '../model/user'; 

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    const message = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    await transporter.sendMail(message);
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Generar y hashear el token de restablecimiento
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutos

        await user.save();

        // Crear la URL de restablecimiento
        const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

        // Mensaje del correo
        const message = `Hola ${user.name},\n\nHas solicitado restablecer tu contraseña. Por favor, haz clic en el siguiente enlace para restablecerla:\n\n${resetUrl}\n\nSi no solicitaste este cambio, simplemente ignora este correo.`;

        // Enviar el correo
        await sendEmail({
            email: user.email,
            subject: 'Recuperación de contraseña',
            message,
        });

        res.status(200).json({ message: 'Correo enviado con éxito.' });

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(500).json({ message: 'No se pudo enviar el correo. Intenta de nuevo más tarde.' });
    }
};

export const resetPassword = async (req, res) => {
    const resetToken = req.params.token;

    try {
        // Hashear el token recibido y buscar al usuario
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }, // Verificar si el token no ha expirado
        });

        if (!user) {
            return res.status(400).json({ message: 'Token inválido o expirado' });
        }

        // Actualizar la contraseña
        const salt = bcrypt.genSaltSync(10);
        user.password = bcrypt.hashSync(req.body.password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ message: 'Contraseña restablecida con éxito.' });

    } catch (error) {
        res.status(500).json({ message: 'Error al restablecer la contraseña. Intenta de nuevo más tarde.' });
    }
};
