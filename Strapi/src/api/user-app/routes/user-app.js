"use strict";

module.exports = {
    routes: [
        {
            method: "GET",
            path: "/user-app",
            handler: "user-app.find",
            config: {
                auth: false,
            },
        },
        {
            method: "GET",
            path: "/user-app/:id",
            handler: "user-app.findOne",
            config: {
                auth: false,
            },
        },
        {
            method: "POST",
            path: "/user-app",
            handler: "user-app.create",
            config: {
                auth: false,
            },
        },
        {
            method: "PUT",
            path: "/user-app/:id",
            handler: "user-app.update",
            config: {
                auth: false,
            },
        },
        {
            method: "DELETE",
            path: "/user-app/:id",
            handler: "user-app.delete",
            config: {
                auth: false,
            },
        },
        {
            method: "POST",
            path: "/user-app/login",
            handler: "user-app.login",
            config: {
                auth: false
            }
        },
        {
            method: "POST",
            path: "/user-app/register",
            handler: "user-app.register",
            config: {
                auth: false
            }
        },
        {
            "method": "GET",
            "path": "/user-apps",
            "handler": "user-app.find",
            config: {
                auth: false
            }
        },
        {
            "method": "GET",
            "path": "/user-apps/profile",
            "handler": "user-app.profile",
            "config": { "policies": [] }
        },
        {
            "method": "GET",
            "path": "/user-apps/updateUserType",
            "handler": "user-app.updateUserType",
            "config": { "policies": [] }
        },
        {
            "method": "POST",
            "path": "/user-app/forgot-password",
            "handler": "user-app.forgotPassword",
            "config": {
                "policies": []
            }
        },
        {
            "method": "POST",
            "path": "/user-app/reset-password",
            "handler": "user-app.resetPassword",
            "config": {
                "policies": []
            }
        },
    ],
};
