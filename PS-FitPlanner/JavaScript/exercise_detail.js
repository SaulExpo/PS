const exerciseFiles = [
    "../JSON/exercises_back.json",
    "../JSON/exercises_cardio.json",
    "../JSON/exercises_chest.json",
    "../JSON/exercises_lower_arms.json",
    "../JSON/exercises_lower_legs.json",
    "../JSON/exercises_neck.json",
    "../JSON/exercises_shoulders.json",
    "../JSON/exercises_upper_arms.json",
    "../JSON/exercises_upper_legs.json",
    "../JSON/exercises_waist.json",
];

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

async function loadExerciseDetail() {
    const nameParam = getQueryParam("name");
    if (!nameParam) {
        document.getElementById("exercise-name").textContent = "Nombre no especificado.";
        return;
    }

    let foundExercise = null;

    for (const file of exerciseFiles) {
        try {
            const response = await fetch(file);
            const exercises = await response.json();
            foundExercise = exercises.find(
                (ex) => ex.name.toLowerCase() === nameParam.toLowerCase()
            );
            if (foundExercise) break;
        } catch (error) {
            console.error(`Error cargando ${file}:`, error);
        }
    }

    if (!foundExercise) {
        document.getElementById("exercise-name").textContent = "Ejercicio no encontrado.";
        return;
    }

    const ex = foundExercise;
    document.getElementById("exercise-name").textContent = ex.name;
    //document.getElementById("exercise-gif").src = ex.gifUrl;
    //document.getElementById("exercise-gif").alt = ex.name;
    document.getElementById("body-part").innerHTML = `<strong>Body Part:</strong> ${ex.bodyPart}`;
    document.getElementById("equipment").innerHTML = `<strong>Equipment:</strong> ${ex.equipment}`;
    document.getElementById("target").innerHTML = `<strong>Primary Muscle:</strong> ${ex.target}`;
    document.getElementById("secondary-muscles").innerHTML = `<strong>Secondary Muscles:</strong> ${ex.secondaryMuscles.join(", ")}`;


    const instructionsList = document.getElementById("instructions");
    instructionsList.innerHTML = "";
    ex.instructions.forEach((step) => {
        const li = document.createElement("li");
        li.textContent = step;
        instructionsList.appendChild(li);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadExerciseDetail();
    loadHeader();
    loadFooter();
});
