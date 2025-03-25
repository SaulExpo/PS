async function getUserProfile() {
    const token = localStorage.getItem("jwt"); // Asegúrate de guardar el token en localStorage o cookies
    console.log(token)
    try {
        const response = await fetch("http://localhost:1337/api/user-apps/profile", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        console.log(response)

        const result = await response.json();

        if (response.ok) {
            console.log("Perfil del usuario:", result);
        } else {
            console.error("Error al obtener el perfil:", result);
        }
    } catch (error) {
        console.error("Error en la petición:", error);
    }
}
