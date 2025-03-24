const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'produccionsoftware5@gmail.com',
        pass: 'tzzs ebro ogxe urow',
    },
});

const sendEmail = async (to, subject, text) => {
    const mailOptions = {
        from: 'produccionsoftware5@gmail.com',
        to,
        subject,
        text,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Correo enviado');
    } catch (error) {
        console.error('Error al enviar el correo:', error);
    }
};

module.exports = { sendEmail };