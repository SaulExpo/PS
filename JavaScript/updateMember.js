// Función para actualizar el tipo de usuario a "member"
async function updateUserType() {
    // Obtener el token desde localStorage
    const token = localStorage.getItem("jwt");

    // Si no hay token, alertar al usuario
    if (!token) {
        alert("No se encontró el token. Por favor, inicia sesión.");
        return;
    }

    try {
        // Hacer la solicitud GET al backend, pasando el token como parámetro en la URL
        const response = await fetch(`http://localhost:1337/api/user-apps/updateUserType?token=${token}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        // Verificar si la respuesta es exitosa
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }

        // Parsear la respuesta JSON
        const data = await response.json();
        console.log("Respuesta del backend:", data);

        // Aquí podrías agregar lógica para mostrar un mensaje en la UI si lo deseas
        alert(` ${data.message}`);
    } catch (error) {
        console.error("Error al realizar la solicitud:", error);
        alert("Hubo un error al actualizar el tipo de usuario.");
    }
}

