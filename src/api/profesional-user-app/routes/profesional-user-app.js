"use strict";

module.exports = {
    routes: [
        {
            method: "POST",
            path: "/profesional-user-app/getProfesional",
            handler: "profesional-user-app.getProfesional",
            config: {
                auth: false,
            },
        },]
}