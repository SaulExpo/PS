'use strict';

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::profesional-user-app.profesional-user-app", ({ strapi }) => ({
    async getProfesional(ctx) {
        try {

            const {email} = ctx.request.body;
            const user = await strapi.db.query("api::user-app.user-app").findOne({
                where: { email },
                populate: true, // Esto trae todas las relaciones
            });

            console.log(user);
            const profesional = user.profesional_user_app
            return ctx.send({
                profesional: {name: profesional.name }
            });

        } catch (error) {
            console.error("Error", error);
            return ctx.internalServerError("Error");
        }
    }}))