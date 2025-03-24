document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');  // Obtener el token de la URL

    document.getElementById('reset-password-form').addEventListener('submit', async function(e) {
        e.preventDefault();

        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword !== confirmPassword) {
            alert("Las contraseñas no coinciden.");
            return;
        }

        const resetPasswordData = {
            password: newPassword,
            passwordConfirmation: confirmPassword,
            token: token  // El token de restablecimiento de contraseña
        };

        try {
            const response = await fetch("http://localhost:1337/api/user-app/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(resetPasswordData)
            });

            const result = await response.json();

            if (response.ok) {
                alert("Contraseña cambiada exitosamente.");
                console.log(result);
                // Redirigir al login u otra página
            } else {
                alert("Error al cambiar la contraseña: " + result.error.message);
                console.error("Error de respuesta:", result);
            }
        } catch (error) {
            console.error("Error al cambiar la contraseña:", error);
        }
    });
});
