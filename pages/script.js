console.log("✅ script.js cargado correctamente");

// Cargar templates (header, footer)
function loadTemplate(templatePath, elementId) {
    fetch(templatePath)
        .then(resp => resp.text())
        .then(data => {
            document.getElementById(elementId).innerHTML = data;
        })
        .catch(error => console.error(`Error cargando ${templatePath}:`, error));
}

// Diccionario de tipos y archivos
const routineFiles = {
    core: "../routines_core.json",
    push: "../routines_push.json",
    pull: "../routines_pull.json",
    legs: "../routines_legs.json",
    full_body: "../routines_full_body.json"
};

const typeSelector = document.getElementById("typeSelector");
const routineSelector = document.getElementById("routineSelector");

// Cargar tipos en el primer <select>
function loadRoutineTypes() {
    Object.keys(routineFiles).forEach(type => {
        const option = document.createElement("option");
        option.value = type;
        option.textContent = type.replace("_", " ").toUpperCase();
        typeSelector.appendChild(option);
    });
}

// Cargar nombres de rutinas del tipo seleccionado
function loadRoutineNames(type) {
    fetch(routineFiles[type])
        .then(resp => resp.json())
        .then(data => {
            routineSelector.innerHTML = '<option disabled selected>Selecciona rutina</option>';
            data.forEach((routine, index) => {
                const option = document.createElement("option");
                option.value = index;
                option.textContent = routine.name;
                routineSelector.appendChild(option);
            });
            routineSelector.disabled = false;
        })
        .catch(err => console.error("Error cargando rutinas del tipo:", type, err));
}

// Cargar rutina completa con ejercicios
function loadRoutine(type, index = 0) {
    fetch(routineFiles[type])
        .then(resp => resp.json())
        .then(data => {
            const routine = data[index];
            if (!routine || !routine.exercises) {
                console.error("Rutina inválida");
                return;
            }

            document.getElementById("title").innerText = routine.name;
            document.getElementById("info").innerText = routine.description;
            document.getElementById("duration").innerText = routine.duration || "No especificada";


            const exercisesContainer = document.getElementById("exercises");
            exercisesContainer.innerHTML = "";

            routine.exercises.forEach((exercise, i) => {
                const wrapper = document.createElement("div");
                wrapper.id = `exercise_${i}`;
                exercisesContainer.appendChild(wrapper);

                fetch("./info_exercise.html")
                    .then(resp => resp.text())
                    .then(template => {
                        wrapper.innerHTML = template;
                        wrapper.querySelector("#name_exercise").innerText = exercise.name;
                        wrapper.querySelector("#reps").innerText = exercise.reps;
                    })
                    .catch(error => console.error("Error cargando info_exercise.html:", error));
            });
        })
        .catch(error => console.error("Error cargando JSON de rutina:", error));
}

// Eventos de los <select>
typeSelector.addEventListener("change", () => {
    const type = typeSelector.value;
    loadRoutineNames(type);
});

routineSelector.addEventListener("change", () => {
    const type = typeSelector.value;
    const index = parseInt(routineSelector.value);
    loadRoutine(type, index);
});

// Iniciar al cargar la página
loadTemplate("./header.html", "main_header");
loadTemplate("./footer.html", "main_footer");
loadRoutineTypes();
