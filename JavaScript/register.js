document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('register-form').addEventListener('submit', async function(e) {
        e.preventDefault();  // Evitar que el formulario se envíe de forma tradicional

        // Obtener los valores del formulario
        const name = document.getElementById('name').value;
        const surname = document.getElementById('surname').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        console.log(name, surname, email, password);

        // Crear el objeto que se enviará a Strapi
        const formData = {
            data: {
                name: name,
                surname: surname,
                email: email,
                password: password
            }
        };
        console.log(formData)

        try {
            // Enviar los datos a Strapi usando fetch (puedes usar axios también)
            const response = await fetch("http://localhost:1337/api/user-app/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                // Procesar la respuesta de Strapi
                alert('Formulario enviado correctamente');
                console.log(result); // Ver la respuesta de Strapi
            } else {
                alert('Hubo un error al enviar el formulario');
                console.error('Error de respuesta:', result);
            }
        } catch (error) {
            console.error('Error al enviar los datos a Strapi:', error);
        }
    });

});