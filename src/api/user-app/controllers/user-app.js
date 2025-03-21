const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

module.exports = {
    async login(ctx) {
        const { email, password } = ctx.request.body;
        // Buscar usuario en la base de datos
        const user = await strapi.db.query("api::user-app.user-app").findOne({
            where: { email }
        });

        if (!user) {
            return ctx.badRequest("Usuario no encontrado");
        }

        // Verificar la contraseña
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return ctx.badRequest("Contraseña incorrecta");
        }

        // Generar el token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        return ctx.send({
            message: "Login exitoso",
            user: {
                id: user.id,
                email: user.email
            },
            token
        });
    }
};
