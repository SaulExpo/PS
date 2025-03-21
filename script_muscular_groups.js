const fs = require('fs');

// Si estás en Node.js < v18, descomenta esta línea e instala node-fetch:
// const fetch = require('node-fetch');

async function getBodyPartList() {
    const url = 'https://exercisedb.p.rapidapi.com/exercises/bodyPartList';
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': '002e9eeff7msh94fe3ba3c69eb11p1809a1jsnd6873efe76cc',
            'x-rapidapi-host': 'exercisedb.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json(); // Es un array de strings

        // Mostrar por consola
        console.log('Lista de partes del cuerpo:');
        result.forEach((parte, i) => {
            console.log(`${i + 1}. ${parte}`);
        });

        // Guardar en archivo JSON
        fs.writeFileSync('partes_del_cuerpo.json', JSON.stringify(result, null, 2));
        console.log('Guardado en partes_del_cuerpo.json');
    } catch (error) {
        console.error('Error al obtener o guardar partes del cuerpo:', error);
    }
}

// Ejecutar la función
getBodyPartList();
