document.addEventListener('DOMContentLoaded', () => {
    const parts = [
        'back', 'cardio', 'chest', 'lower_arms', 'lower_legs',
        'neck', 'shoulders', 'upper_arms', 'upper_legs', 'waist'
    ];

    const $ = id => document.getElementById(id);
    const exerciseList = $('exercise-list');
    const select = $('bodypart-select');
    const nameInput = $('routine-name');
    const descInput = $('routine-description');
    const durationInput = $('routine-duration');
    const saveExportBtn = $('save-export-routine');

    let selected = [];
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

        const editIndex = localStorage.getItem('editIndex');

        if (editIndex === null) {
            selected = [];
            nameInput.value = '';
            descInput.value = '';
            durationInput.value = '';
        } else {
            const routines = JSON.parse(localStorage.getItem('routines')) || [];
            const routine = routines[editIndex];
            if (routine) {
                nameInput.value = routine.name;
                descInput.value = routine.description || '';
                durationInput.value = routine.duration || '';
                selected = [...routine.exercises];
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

            const name = document.createElement('div');
            name.innerHTML = `<strong>${ex.name}</strong>`;

            const target = document.createElement('div');
            target.textContent = `Target: ${ex.target}`;

            const equipment = document.createElement('div');
            equipment.textContent = `Equipment: ${ex.equipment}`;

            const repsSelect = document.createElement('select');
            repsSelect.innerHTML = `
                <option value="3x10">3x10</option>
                <option value="4x12">4x12</option>
                <option value="5x15" selected>5x15</option>
            `;
            repsSelect.style.padding = '0.3rem';
            repsSelect.style.borderRadius = '6px';
            repsSelect.style.marginTop = '0.5rem';

            const alreadySelected = selected.find(e => e.id === ex.id);
            if (alreadySelected && alreadySelected.reps) {
                repsSelect.value = alreadySelected.reps;
            }

            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    selected.push({ ...ex, reps: repsSelect.value });
                } else {
                    selected = selected.filter(e => e.id !== ex.id);
                }
            });

            repsSelect.addEventListener('change', () => {
                const i = selected.findIndex(e => e.id === ex.id);
                if (i !== -1) selected[i].reps = repsSelect.value;
            });

            card.appendChild(checkbox);
            card.appendChild(name);
            card.appendChild(target);
            card.appendChild(equipment);
            card.appendChild(repsSelect);

            exerciseList.appendChild(card);
        });
    };

    select.onchange = () => {
        const part = select.value;

        if (!ready) {
            alert("⏳ Aún se están cargando los datos...");
            return;
        }

        selected = [];
        render(allExercises[part] || []);
    };

    saveExportBtn.onclick = () => {
        const name = nameInput.value.trim();
        const description = descInput.value.trim();
        const duration = durationInput.value.trim();

        if (!name || !description || !duration) {
            return alert("⚠️ Completa todos los campos: nombre, descripción y duración.");
        }

        if (!selected.length) {
            return alert("⚠️ No hay ejercicios seleccionados.");
        }

        const newRoutine = {
            name,
            description,
            duration,
            exercises: selected.map(ex => ({
                name: ex.name,
                reps: ex.reps || "5x15"
            }))
        };

        const routines = JSON.parse(localStorage.getItem("routines")) || [];
        const editIndex = localStorage.getItem("editIndex");

        if (editIndex !== null) {
            routines[parseInt(editIndex)] = newRoutine;
        } else {
            routines.push(newRoutine);
        }

        localStorage.setItem("routines", JSON.stringify(routines));
        localStorage.removeItem("editIndex");

        const blob = new Blob([JSON.stringify(newRoutine, null, 2)], { type: "application/json" });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${name.replace(/\s+/g, '_').toLowerCase()}.json`;
        link.click();
        URL.revokeObjectURL(link.href);

        alert("✅ Rutina guardada y exportada correctamente.");
        window.location.href = 'my_routines.html';


        selected = [];
        nameInput.value = '';
        descInput.value = '';
        durationInput.value = '';
        select.value = '';
        exerciseList.innerHTML = '<p style="color:gray">✅ Rutina guardada. Selecciona otra parte del cuerpo para continuar.</p>';
    };

    fetchExercises();
});
