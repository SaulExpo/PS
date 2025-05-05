import {getFirestore, collection, getDocs, addDoc, updateDoc, doc as docRef, getDoc} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import {db} from "../firebase_config.js";
import {auth} from "../firebase_config.js";

const select         = document.getElementById("bodypart-select");
const searchInput    = document.getElementById("exercise-search");
const exerciseList   = document.getElementById("exercise-list");
const nameInput      = document.getElementById("routine-name");
const descInput      = document.getElementById("routine-description");
const durationInput  = document.getElementById("routine-duration");
const restInput      = document.getElementById("routine-rest");
const noteInput      = document.getElementById("routine-note"); // Nuevo textarea para notas
const saveBtn        = document.getElementById("save-export-routine");

const collectionNames = [
    "exercises_cardio",
    "exercises_chest",
    "exercises_lower_arms",
    "exercises_lower_legs",
    "exercises_neck",
    "exercises_shoulders",
    "exercises_upper_arms",
    "exercises_upper_legs",
    "exercises_waist",
    "exercises_back"
];

const allExercises = {};
let currentList    = [];
let selected       = [];
let editId         = null;

const userRoutinesCol = collection(db, "user_routines");

function render(list) {
    exerciseList.innerHTML = "";
    if (!list.length) {
        exerciseList.innerHTML = `<p>No hay ejercicios que coincidan.</p>`;
        return;
    }
    list.forEach(ex => {
        const card = document.createElement("div");
        card.className = "exercise-card";
        // Checkbox
        const cb = document.createElement("input");
        cb.type    = "checkbox";
        cb.checked = selected.some(e => e.id === ex.id);
        // Nombre, target, equip
        const name      = document.createElement("div");
        name.innerHTML  = `<strong>${ex.name}</strong>`;
        const target    = document.createElement("div");
        target.textContent = `Target: ${ex.target}`;
        const equip     = document.createElement("div");
        equip.textContent  = `Equip: ${ex.equipment}`;
        // Selector de repeticiones
        const repsSelect = document.createElement("select");
        repsSelect.innerHTML = `
      <option value="3x10">3x10</option>
      <option value="4x12">4x12</option>
      <option value="5x15">5x15</option>`;
        repsSelect.value = selected.find(e => e.id === ex.id)?.reps || "5x15";
        // Handlers
        cb.addEventListener("change", () => {
            if (cb.checked) selected.push({ ...ex, reps: repsSelect.value });
            else selected = selected.filter(e => e.id !== ex.id);
        });
        repsSelect.addEventListener("change", () => {
            const i = selected.findIndex(e => e.id === ex.id);
            if (i >= 0) selected[i].reps = repsSelect.value;
        });
        // Montamos la card
        [cb, name, target, equip, repsSelect].forEach(n => card.appendChild(n));
        exerciseList.appendChild(card);
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    await Promise.all(collectionNames.map(async colName => {
        const snap = await getDocs(collection(db, colName));
        const part = colName.replace("exercises_", "");
        allExercises[part] = snap.docs.map(d => ({ id: d.id, ...d.data(), bodyPart: part }));
    }));

    Object.keys(allExercises).sort().forEach(part => {
        const label = part.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase());
        select.appendChild(new Option(label, part));
    });

    const params = new URLSearchParams(location.search);
    editId = params.get("editId");
    if (editId) {
        const rutSnap = await getDoc(docRef(db, "user_routines", editId));
        if (rutSnap.exists()) {
            const r = rutSnap.data();
            nameInput.value     = r.name;
            descInput.value     = r.description;
            durationInput.value = r.duration;
            restInput.value     = r.rest || "";
            noteInput.value     = r.note || ""; // Cargar nota existente
            selected            = r.exercises.slice();
            const first = selected[0]?.bodyPart;
            if (first) {
                select.value    = first;
                currentList     = allExercises[first];
                render(currentList);
            }
        }
    }

    exerciseList.innerHTML = `<p>Selecciona un grupo muscular…</p>`;
});

select.addEventListener("change", () => {
    currentList    = allExercises[select.value] || [];
    searchInput.value = "";
    selected       = [];
    render(currentList);
});

searchInput.addEventListener("input", () => {
    const term = searchInput.value.trim().toLowerCase();
    render(!term
        ? currentList
        : currentList.filter(ex =>
            ex.name.toLowerCase().includes(term) ||
            ex.target.toLowerCase().includes(term) ||
            (ex.equipment||"").toLowerCase().includes(term)
        )
    );
});

saveBtn.addEventListener("click", async () => {
    const name        = nameInput.value.trim();
    const description = descInput.value.trim();
    const duration    = durationInput.value.trim();
    const rest        = restInput.value.trim();
    const note        = noteInput.value.trim(); // Obtener la nota
    if (!name || !description || !duration) {
        return alert("Completa nombre, descripción y duración.");
    }
    if (!selected.length) {
        return alert("Selecciona al menos un ejercicio.");
    }

    // 1) Obtener el usuario actual
    const user = auth.currentUser;
    if (!user) {
        return alert("Debes iniciar sesión para guardar una rutina.");
    }

    // 2) Incluir UID y nota en el payload
    const payload = {
        uid: user.uid,
        name,
        description,
        duration,
        rest,
        note,
        exercises: selected.map(e =>({
            bodyPart: e.bodyPart,
            name:     e.name,
            reps:     e.reps
        }))
    };

    try {
        if (editId) {
            await updateDoc(docRef(db, "user_routines", editId), payload);
            alert("Rutina actualizada ✔");
        } else {
            await addDoc(userRoutinesCol, payload);
            alert("Rutina guardada ✔");
        }
        location.href = "my_routines.html";
    } catch (err) {
        console.error(err);
        alert("Error guardando rutina: " + err.message);
    }
});
