module.exports = {
    email: {
        provider: 'sendgrid',  // O el proveedor que estés usando
        providerOptions: {
            apiKey: 'YOUR_SENDGRID_API_KEY'
        },
        settings: {
            defaultFrom: 'noreply@tudominio.com',
            defaultReplyTo: 'support@tudominio.com',
        },
    },
    "users-permissions": {
        config: {
            jwtSecret: process.env.JWT_SECRET || "a6c3f1d5b8e9a2f7c4d0e3b1a5f9d8e7c3b2a1f4e6d5c8b7a9d2e1f3b4c6d7e8",
        },
    },
};