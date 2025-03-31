const fs = require('fs');

async function getExercisesByBodyPart(bodyPart, outputFileName) {
    const url = `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${encodeURIComponent(bodyPart)}?limit=1300&offset=0`;
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': '002e9eeff7msh94fe3ba3c69eb11p1809a1jsnd6873efe76cc',
            'x-rapidapi-host': 'exercisedb.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();

        console.log(`Ejercicios de ${bodyPart}:`);
        result.forEach((ej, i) => {
            console.log(`${i + 1}. ${ej.name} - ${ej.target} (${ej.equipment})`);
        });

        fs.writeFileSync(outputFileName, JSON.stringify(result, null, 2));
        console.log(`Guardado en ${outputFileName}`);
    } catch (error) {
        console.error(`Error al obtener o guardar ejercicios de ${bodyPart}:`, error);
    }
}

(async () => {
    await getExercisesByBodyPart('back', 'exercises_back.json');
    await getExercisesByBodyPart('cardio', 'exercises_cardio.json');
    await getExercisesByBodyPart('chest', 'exercises_chest.json');
    await getExercisesByBodyPart('lower arms', 'exercises_lower_arms.json');
    await getExercisesByBodyPart('lower legs', 'exercises_lower_legs.json');
    await getExercisesByBodyPart('neck', 'exercises_neck.json');
    await getExercisesByBodyPart('shoulders', 'exercises_shoulders.json');
    await getExercisesByBodyPart('upper arms', 'exercises_upper_arms.json');
    await getExercisesByBodyPart('upper legs', 'exercises_upper_legs.json');
    await getExercisesByBodyPart('waist', 'exercises_waist.json');
})();
