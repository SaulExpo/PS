const fs = require('fs');

async function getCardioExercises() {
    const url = 'https://exercisedb.p.rapidapi.com/exercises/bodyPart/cardio?limit=1300&offset=0';
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': '002e9eeff7msh94fe3ba3c69eb11p1809a1jsnd6873efe76cc',
            'x-rapidapi-host': 'exercisedb.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json(); // Parseamos como JSON

        // Mostrar por consola
        console.log('Ejercicios cardio:');
        result.forEach((ej, i) => {
            console.log(`${i + 1}. ${ej.name} - ${ej.target} (${ej.equipment})`);
        });

        // Guardar en archivo JSON
        fs.writeFileSync('ejercicios_cardio.json', JSON.stringify(result, null, 2));
        console.log('Guardado en ejercicios_cardio.json');
    } catch (error) {
        console.error('Error al obtener o guardar ejercicios:', error);
    }
}

// Ejecutar la función
getCardioExercises();
