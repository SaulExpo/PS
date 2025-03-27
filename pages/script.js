console.log("✅ script.js cargado correctamente");

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

let allRoutines = [];

function loadAllRoutines() {
    const entries = Object.entries(routineFiles);
    let loaded = 0;

    entries.forEach(([type, filePath]) => {
        fetch(filePath)
            .then(resp => resp.json())
            .then(data => {
                data.forEach((routine, index) => {
                    allRoutines.push({
                        ...routine,
                        type: type,
                        index: index
                    });
                });

                loaded++;
                if (loaded === entries.length) {
                    console.log("Todas las rutinas cargadas en memoria");
                }
            })
            .catch(err => console.error("Error cargando:", filePath, err));
    });
}


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

//Buscador
const globalSearch = document.getElementById("globalSearch");
const searchResults = document.getElementById("searchResults");

globalSearch.addEventListener("input", () => {
    const query = globalSearch.value.toLowerCase();
    searchResults.innerHTML = '<option disabled selected>Resultados aparecerán aquí</option>';

    const filtered = allRoutines.filter(routine => {
        const name = routine.name.toLowerCase();
        const type = routine.type.toLowerCase();
        const description = routine.description.toLowerCase();
        return name.includes(query) || type.includes(query) || description.includes(query);
    });

    filtered.forEach(routine => {
        const option = document.createElement("option");
        option.value = JSON.stringify({ type: routine.type, index: routine.index });
        option.textContent = `[${routine.type}] ${routine.name}`;
        searchResults.appendChild(option);
    });

    if (filtered.length === 0) {
        const option = document.createElement("option");
        option.disabled = true;
        option.textContent = "No se encontraron coincidencias";
        searchResults.appendChild(option);
    }
});

searchResults.addEventListener("change", () => {
    const value = JSON.parse(searchResults.value);
    loadRoutine(value.type, value.index);
});

// Iniciar al cargar la página
loadTemplate("./header.html", "main_header");
loadTemplate("./footer.html", "main_footer");
loadAllRoutines();
loadRoutineTypes();
