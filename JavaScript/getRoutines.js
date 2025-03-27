async function getRoutines(email){
    const url = 'http://localhost:1337/api/user-routines?populate=*';
    try {
        // Hacemos una solicitud GET a la API
        const response = await fetch(url);

        // Verificamos si la solicitud fue exitosa
        if (!response.ok) {
            throw new Error('No se pudo obtener los datos de los reviews');
        }

        // Parseamos la respuesta a JSON
        const routines = await response.json()
        // Filtramos los films para que solo contengan la categoría "Animation"
        const userRoutines = routines.data.filter(routine =>
            routine.user_app.email === email
        );
        return userRoutines;


    } catch (error) {
        console.error('Error:', error);
    }
}

async function addUserRoutine(user, rutine, date){


    const formData = {
        data: {
            user_app: { connect: [user] }, // Relación con el usuario
            rutine: { connect: [rutine] },
            date: date
        }
    };

    console.log(formData);

    try {
        // Enviar los datos a Strapi usando fetch (puedes usar axios también)
        const response = await fetch('http://localhost:1337/api/user-routines?populate=*', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (response.ok) {
            // Procesar la respuesta de Strapi
            location.reload();
        } else {
            alert('Hubo un error al enviar el formulario');
            console.error('Error de respuesta:', result);
        }
    } catch (error) {
        console.error('Error al enviar los datos a Strapi:', error);
    }
}

async function editUserRoutine(user, userRutine, date, rutineId){

    let rutine = userRutine.rutine
    console.log(rutineId)

    const formData = {
        data: {
            user_app: { connect: [user] }, // Relación con el usuario
            rutine: { connect: [rutine] },
            date: date
        }
    };

    console.log(formData);

    try {
        // Enviar los datos a Strapi usando fetch (puedes usar axios también)
        const response = await fetch(`http://localhost:1337/api/user-routines/${rutineId}?populate=*`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (response.ok) {
            // Procesar la respuesta de Strapi
            location.reload();
        } else {
            alert('Hubo un error al enviar el formulario');
            console.error('Error de respuesta:', result);
        }
    } catch (error) {
        console.error('Error al enviar los datos a Strapi:', error);
    }
}

async function deleteUserRoutine(rutineId) {
    try {
        // Enviar la solicitud DELETE a Strapi
        const response = await fetch(`http://localhost:1337/api/user-routines/${rutineId}`, {
            method: 'DELETE',  // Usamos el método DELETE para eliminar el recurso
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            location.reload();  // Recargar la página para reflejar los cambios
        } else {
            const result = await response.json();
            console.error('Error de respuesta:', result);
        }
    } catch (error) {
        console.error('Error al eliminar la rutina:', error);
    }
}