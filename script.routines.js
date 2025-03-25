const fs = require('fs');
const path = require('path');

const functionalGroups = {
    "push": ["chest", "shoulders", "triceps", "upper arms"],
    "pull": ["back", "biceps", "lower arms"],
    "legs": ["upper legs", "lower legs"],
    "core": ["waist"],
    "full body": ["chest", "back", "shoulders", "upper arms", "lower arms", "waist", "upper legs", "lower legs"]
};

const levels = ["advanced", "intermediate", "beginner"];

function loadExercises(bodyParts) {
    let allExercises = [];
    bodyParts.forEach(part => {
        const fileName = `exercises_${part.replace(/ /g, "_")}.json`;
        const filePath = path.join(__dirname, fileName);

        if (fs.existsSync(filePath)) {
            const raw = fs.readFileSync(filePath);
            const data = JSON.parse(raw);
            allExercises = allExercises.concat(data);
        } else {
            console.warn(`Archivo no encontrado: ${fileName}`);
        }
    });
    return allExercises;
}

function getRandomExercises(exercises) {
    const count = Math.floor(Math.random() * 3) + 4; // Entre 4 y 6 ejercicios
    const shuffled = [...exercises].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function generateReps(level) {
    switch (level.toLowerCase()) {
        case "beginner": return "3x10";
        case "intermediate": return "4x12";
        case "advanced": return "5x15";
        default: return "3x10";
    }
}

function generateRoutine(functionalGroup, level, allExercises, index) {
    const selected = getRandomExercises(allExercises);
    return {
        name: `Rutina ${functionalGroup.charAt(0).toUpperCase() + functionalGroup.slice(1)} ${level} #${index + 1}`,
        description: `Rutina funcional enfocada en el grupo "${functionalGroup}" para nivel ${level}.`,
        exercises: selected.map(ex => ({
            name: ex.name,
            reps: generateReps(level)
        }))
    };
}

function generateMultipleRoutines(count, functionalGroup, level, allExercises) {
    const routines = [];
    for (let i = 0; i < count; i++) {
        routines.push(generateRoutine(functionalGroup, level, allExercises, i));
    }
    return routines;
}

function saveRoutines(routines, fileName) {
    fs.writeFileSync(fileName, JSON.stringify(routines, null, 2));
    console.log(`✅ Se han guardado ${routines.length} rutinas en ${fileName}`);
}

// ---------------- AUTOMATIZACIÓN ----------------

function generateAll() {
    Object.keys(functionalGroups).forEach(group => {
        const exercises = loadExercises(functionalGroups[group]);

        if (exercises.length === 0) {
            console.warn(`No se generaron rutinas para "${group}" por falta de ejercicios`);
            return;
        }

        let allRoutines = [];

        levels.forEach(level => {
            const generated = generateMultipleRoutines(3, group, level, exercises);
            allRoutines = allRoutines.concat(generated);
        });

        // Orden: advanced → intermediate → beginner
        saveRoutines(allRoutines, `routines_${group.replace(/ /g, "_")}.json`);
    });
}

generateAll();
