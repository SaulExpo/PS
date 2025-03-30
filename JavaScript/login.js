document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('login-form').addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const loginData = {
            data: {
                email: email,
                password: password
            }
        };

        try {
            const response = await fetch("http://localhost:1337/api/user-app/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(loginData)
            });

            const result = await response.json();

            if (response.ok) {
                alert("Login exitoso");
                console.log(result);

                // Guardar token en localStorage para futuras peticiones
                localStorage.setItem("jwt", result.token);
            } else {
                alert("Error en login: " + result.error.message);
                console.error("Error de respuesta:", result);
            }
        } catch (error) {
            console.error("Error en la solicitud de login:", error);
        }
    });
});