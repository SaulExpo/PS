async function asignacion_prof(email) {
    console.log("hola")
    const response = await fetch("http://localhost:1337/api/profesional-user-app/getProfesional", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({email})
    });

    return await response.json()
}