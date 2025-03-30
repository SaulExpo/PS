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
};