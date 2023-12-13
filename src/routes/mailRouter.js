const dotenv = require('dotenv');
const express = require("express");
const nodemailer = require("nodemailer")
const router = express.Router();

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "Gmail",  
    auth: {
        user: process.env.EMAIL_USER, // Usar la variable de entorno para el usuario
        pass: process.env.EMAIL_PASS // Usar la variable de entorno para la contraseña
    }
});


router.post("/enviar-correo", (req, res) => {
    const { email, mensaje } = req.body; // Cambia 'correo' a 'email' para mantener la consistencia
    const messageToSend = mensaje; // Utiliza el mensaje del cuerpo de la solicitud

    const mailOptions = {
        from: "tucorreo@gmail.com",
        to: email, // Utiliza el correo ingresado en el formulario como destinatario
        subject: "Mensaje después del login",
        text: messageToSend // Mensaje personalizado para el usuario
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("Error enviando email:", error.message);
            res.status(500).json({ error: "Error al enviar el correo" });
        } else {
            console.log("Email enviado");
            res.status(200).json({ message: "Correo enviado con éxito" });
        }
    });
});


module.exports = router;