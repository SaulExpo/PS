async function getUserProfile() {
    const token = localStorage.getItem("jwt"); // Asegúrate de guardar el token en localStorage o cookies
    try {
        const response = await fetch(`http://localhost:1337/api/user-apps/profile?token=${token}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        console.log(response)

        const result = await response.json();

        if (response.ok) {
            console.log("Perfil del usuario:", result);
            return result;
        } else {
            console.error("Error al obtener el perfil:", result);
        }
    } catch (error) {
        console.error("Error en la petición:", error);
    }
}
