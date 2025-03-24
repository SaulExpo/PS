const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sendEmail } = require('../services/emailService.js');
"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::user-app.user-app", ({ strapi }) => ({
    async login(ctx) {
        try {
            const { email, password } = ctx.request.body.data;

            const user = await strapi.db.query("api::user-app.user-app").findOne({
                where: { email }
            });

            if (!user) {
                return ctx.badRequest("Usuario no encontrado");
            }

            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                return ctx.badRequest("Contraseña incorrecta");
            }

            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: "2h" }
            );

            return ctx.send({
                message: "Login exitoso",
                user: { id: user.id, email: user.email },
                token
            });

        } catch (error) {
            console.error("Error en el login:", error);
            return ctx.internalServerError("Error en el login");
        }
    },
    async register(ctx) {
        try {
            const { name, surname, email, password } = ctx.request.body.data;

            console.log(name, surname, email, password);


            // Verificar si el usuario ya existe
            const existingUser = await strapi.db.query("api::user-app.user-app").findOne({
                where: { email }
            });


            if (existingUser) {
                return ctx.badRequest("El usuario ya existe");
            }

            // Hashear la contraseña
            const hashedPassword = await bcrypt.hash(password, 10);

            // Crear nuevo usuario
            const newUser = await strapi.entityService.create("api::user-app.user-app", {
                data: {
                    name,
                    surname,
                    email,
                    password: hashedPassword
                }
            });

            // Generar el token JWT
            const token = jwt.sign(
                { id: newUser.id, email: newUser.email },
                process.env.JWT_SECRET,
                { expiresIn: "2h" }
            );

            return ctx.send({
                message: "Registro exitoso",
                user: {
                    id: newUser.id,
                    email: newUser.email
                },
                token
            });

        } catch (error) {
            console.error("Error en el registro:", error);
            return ctx.internalServerError("Error al registrar el usuario");
        }
    },
    async forgotPassword(ctx) {
        try {
            const { email } = ctx.request.body;

            // Buscar el usuario por su email
            const user = await strapi.db.query("api::user-app.user-app").findOne({
                where: { email }
            });
            console.log(user);

            if (!user) {
                return ctx.badRequest("No se encontró un usuario con ese correo");
            }

            // Generar un token para el restablecimiento de la contraseña
            const resetToken = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: "1h" } // El token expira en 1 hora
            );

            // Crear un enlace con el token
            const resetLink = `http://localhost:63342/PS/PWM-Fitness-App-master/Pages/reset_password.html?token=${resetToken}`;

            // Enviar el correo de recuperación
            await sendEmail(user.email, "Restablecer tu contraseña", `Haz clic en el siguiente enlace para restablecer tu contraseña: ${resetLink}`
            );

            return ctx.send({
                message: "Si el correo existe, recibirás un enlace para restablecer tu contraseña."
            });
        } catch (error) {
            console.error("Error al solicitar el restablecimiento de contraseña:", error);
            return ctx.internalServerError("Hubo un error al intentar restablecer la contraseña.");
        }
    },

    // Endpoint para restablecer la contraseña
    async resetPassword(ctx) {
        try {
            const { token, password, passwordConfirmation } = ctx.request.body;

            if (password !== passwordConfirmation) {
                return ctx.badRequest("Las contraseñas no coinciden.");
            }

            // Verificar el token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await strapi.db.query("api::user-app.user-app").findOne({
                where: { id: decoded.id }
            });

            if (!user) {
                return ctx.badRequest("El usuario no existe.");
            }

            // Hashear la nueva contraseña
            const hashedPassword = await bcrypt.hash(password, 10);

            // Actualizar la contraseña del usuario
            await strapi.db.query("api::user-app.user-app").update({
                where: { id: user.id },
                data: { password: hashedPassword }
            });

            return ctx.send({
                message: "Contraseña actualizada correctamente."
            });
        } catch (error) {
            console.error("Error al restablecer la contraseña:", error);
            return ctx.internalServerError("Hubo un error al restablecer la contraseña.");
        }
    }
}));
