module.exports = {
    routes: [
        {
            method: "POST",
            path: "/user-app/login",
            handler: "user-app.login",
            config: {
                auth: false
            }
        }
    ]
};
