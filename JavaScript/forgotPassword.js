document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('forgot-password-form').addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        console.log(email);
        const forgotPasswordData = {
            email: email
        };

        try {
            const response = await fetch("http://localhost:1337/api/user-app/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(forgotPasswordData)
            });

            const result = await response.json();

            if (response.ok) {
                alert("Si el correo existe, recibirás un enlace para restablecer tu contraseña.");
                console.log(result);
            } else {
                alert("Error: " + result.error.message);
                console.error("Error de respuesta:", result);
            }
        } catch (error) {
            console.error("Error al solicitar el restablecimiento de la contraseña:", error);
        }
    });
});