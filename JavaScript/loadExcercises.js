// Tu JSON con los datos de los ejercicios
const exercises =

// URL de tu API de Strapi (asegúrate de reemplazar con la URL de tu servidor)
const strapiUrl = 'http://localhost:1337/api/rutines'; // Cambia la URL de Strapi

// Función para hacer las solicitudes de inserción de datos
const loadExercises = async () => {
    for (const exercise of exercises) {
        const response = await fetch(strapiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Si necesitas un token de autenticación, añade el encabezado 'Authorization' con tu token JWT
                // 'Authorization': 'Bearer <tu-token-aqui>',
            },
            body: JSON.stringify({
                data: {
                    name: exercise.name,
                    description: exercise.description
                },
            }),
        });

        if (response.ok) {
            console.log(`Ejercicio ${exercise.name} cargado correctamente.`);
        } else {
            console.error(`Error al cargar el ejercicio ${exercise.name}:`, await response.json());
        }
    }
};

// Llamar a la función
loadExercises();