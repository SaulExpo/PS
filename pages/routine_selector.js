document.addEventListener('DOMContentLoaded', () => {
    const parts = [
        'back', 'cardio', 'chest', 'lower_arms', 'lower_legs',
        'neck', 'shoulders', 'upper_arms', 'upper_legs', 'waist'
    ];

    const $ = id => document.getElementById(id);
    const exerciseList = $('exercise-list');
    const output = $('output');
    const exportBtn = $('export-btn');
    const select = $('bodypart-select');
    const nameInput = $('routine-name');
    const saveBtn = $('save-routine');

    const selected = [];
    const allExercises = {};
    let ready = false;

    const fetchExercises = async () => {
        exerciseList.innerHTML = '<p style="color:gray">⏳ Cargando ejercicios...</p>';
        await Promise.all(parts.map(async part => {
            try {
                const res = await fetch(`https://raw.githubusercontent.com/SaulExpo/PS/main/exercises_${part}.json`);
                allExercises[part] = await res.json();
                console.log(`✅ ${part}: ${allExercises[part].length}`);
            } catch (err) {
                console.error(`❌ Error en ${part}`, err);
                allExercises[part] = [];
            }
        }));
        ready = true;
        exerciseList.innerHTML = '<p style="color:green">✅ Listo. Selecciona una parte del cuerpo.</p>';

        // Cargar rutina en edición
        const editIndex = localStorage.getItem('editIndex');
        if (editIndex !== null) {
            const routines = JSON.parse(localStorage.getItem('routines')) || [];
            const routine = routines[editIndex];
            if (routine) {
                nameInput.value = routine.name;
                selected.length = 0;
                selected.push(...routine.exercises);
                const defaultPart = routine.exercises[0]?.bodyPart?.toLowerCase();
                if (defaultPart && allExercises[defaultPart]) {
                    select.value = defaultPart;
                    render(allExercises[defaultPart]);
                }
            }
        }
    };

    const render = (data = []) => {
        exerciseList.innerHTML = '';
        if (!data.length) {
            exerciseList.innerHTML = '<p>No hay ejercicios disponibles.</p>';
            return;
        }

        data.forEach(ex => {
            const card = document.createElement('div');
            card.className = 'exercise-card';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = selected.some(e => e.id === ex.id);
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) selected.push(ex);
                else selected.splice(selected.findIndex(e => e.id === ex.id), 1);
            });

            const name = document.createElement('div');
            name.innerHTML = `<strong>${ex.name}</strong>`;
            const target = document.createElement('div');
            target.innerHTML = `🎯 ${ex.target}`;
            const equipment = document.createElement('div');
            equipment.innerHTML = `🛠️ ${ex.equipment}`;

            card.appendChild(checkbox);
            card.appendChild(name);
            card.appendChild(target);
            card.appendChild(equipment);

            exerciseList.appendChild(card);
        });
    };

    select.onchange = () => {
        const part = select.value;
        if (!ready) {
            alert("⏳ Aún se están cargando los datos...");
            return;
        }
        render(allExercises[part] || []);
    };

    exportBtn.onclick = () => {
        if (!selected.length) return alert("⚠️ No hay ejercicios seleccionados.");

        // Limpiar datos antes de exportar
        const cleanData = selected.map(ex => ({
            name: ex.name,
            bodyPart: ex.bodyPart,
            target: ex.target,
            equipment: ex.equipment
        }));

        const data = JSON.stringify(cleanData, null, 2);
        output.textContent = data;

        const blob = new Blob([data], { type: "application/json" });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = "mis_ejercicios.json";
        link.click();
        URL.revokeObjectURL(link.href);
    };

    saveBtn.onclick = () => {
        const name = nameInput.value.trim();
        if (!name) return alert("⚠️ Escribe un nombre para la rutina.");
        if (!selected.length) return alert("⚠️ No hay ejercicios seleccionados.");

        const newRoutine = { name, exercises: selected };
        const routines = JSON.parse(localStorage.getItem("routines")) || [];
        const editIndex = localStorage.getItem("editIndex");

        if (editIndex !== null) {
            routines[parseInt(editIndex)] = newRoutine;
        } else {
            routines.push(newRoutine);
        }

        localStorage.setItem("routines", JSON.stringify(routines));
        localStorage.removeItem("editIndex");

        alert("✅ Rutina guardada correctamente.");
        window.location.href = "my_routines.html";
    };

    fetchExercises();
});
