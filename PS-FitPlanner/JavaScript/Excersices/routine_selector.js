import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    doc as docRef,
    getDoc,
    query,
    where
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { db, auth } from "../firebase_config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// DOM elements
const select        = document.getElementById("bodypart-select");
const searchInput   = document.getElementById("exercise-search");
const exerciseList  = document.getElementById("exercise-list");
const summaryEl     = document.getElementById("selected-summary");
const nameInput     = document.getElementById("routine-name");
const descInput     = document.getElementById("routine-description");
const durationInput = document.getElementById("routine-duration");
const restInput     = document.getElementById("routine-rest");
const saveBtn       = document.getElementById("save-export-routine");

const FAVORITES_VALUE = "favoritos";
const collectionNames = [
    "exercises_cardio","exercises_chest","exercises_lower_arms",
    "exercises_lower_legs","exercises_neck","exercises_shoulders",
    "exercises_upper_arms","exercises_upper_legs","exercises_waist","exercises_back"
];

let allExercises = {};
let currentList  = [];
let selected     = [];
let editId       = null;
let favorites    = [];

const userRoutinesCol = collection(db, "user_routines");

function updateSummary() {
    summaryEl.innerHTML = "";
    if (!selected.length) {
        summaryEl.innerHTML = "<p>No hay ejercicios seleccionados.</p>";
        return;
    }

    selected.forEach((e, idx) => {
        const container = document.createElement("div");
        container.className = "summary-item";

        const linkEl = document.createElement("a");
        linkEl.textContent = e.name;
        linkEl.href        = `exercise_detail.html?name=${encodeURIComponent(e.name)}`;
        linkEl.target      = "_blank";
        linkEl.className   = "summary-link";

        const repsSelect = document.createElement("select");
        repsSelect.innerHTML = `
      <option value="3x10">3x10</option>
      <option value="4x12">4x12</option>
      <option value="5x15">5x15</option>`;
        repsSelect.value = e.reps;
        repsSelect.addEventListener("change", () => {
            selected[idx].reps = repsSelect.value;
            render(currentList);
        });

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Eliminar";
        removeBtn.addEventListener("click", () => {
            selected = selected.filter((_, i) => i !== idx);
            updateSummary();
            render(currentList);
        });

        container.append(linkEl, repsSelect, removeBtn);
        summaryEl.appendChild(container);
    });
}

/**
 * Renderiza las tarjetas de selección de ejercicios.
 * @param {Array} list Array de ejercicios.
 */
function render(list) {
    exerciseList.innerHTML = "";
    if (!list.length) {
        exerciseList.innerHTML = `<p>No hay ejercicios que coincidan.</p>`;
        return;
    }

    list.forEach(ex => {
        const card = document.createElement("div");
        card.className = "exercise-card";
        card.style.position = "relative";

        // Botón favorito
        const favBtn = document.createElement("button");
        favBtn.className = "fav-btn";
        favBtn.textContent = favorites.includes(ex.id) ? "❤️" : "🤍";
        favBtn.style.position = "absolute";
        favBtn.style.top      = "8px";
        favBtn.style.right    = "8px";
        favBtn.addEventListener("click", async () => {
            const uid = auth.currentUser.uid;
            favorites = favorites.includes(ex.id)
                ? favorites.filter(id => id !== ex.id)
                : [...favorites, ex.id];
            await updateDoc(docRef(db, "user_app", uid), { favorites });
            favBtn.textContent = favorites.includes(ex.id) ? "❤️" : "🤍";
            if (select.value === FAVORITES_VALUE) {
                const favList = Object.values(allExercises)
                    .flat()
                    .filter(e => favorites.includes(e.id));
                render(favList);
            }
        });

        // 1) Crear selector de reps antes del checkbox
        const repsSelect = document.createElement("select");
        repsSelect.innerHTML = `
      <option value="3x10">3x10</option>
      <option value="4x12">4x12</option>
      <option value="5x15">5x15</option>`;
        const prev = selected.find(s => s.id === ex.id);
        repsSelect.value = prev?.reps || "5x15";
        repsSelect.addEventListener("change", () => {
            const i = selected.findIndex(s => s.id === ex.id);
            if (i >= 0) {
                selected[i].reps = repsSelect.value;
                updateSummary();
            }
        });

        // 2) Crear checkbox referenciando repsSelect
        const cb = document.createElement("input");
        cb.type    = "checkbox";
        cb.checked = selected.some(s => s.id === ex.id);
        cb.addEventListener("change", () => {
            if (cb.checked) {
                if (!selected.some(s => s.id === ex.id)) {
                    selected.push({
                        id:       ex.id,
                        bodyPart: ex.bodyPart,
                        name:     ex.name,
                        reps:     repsSelect.value
                    });
                }
            } else {
                selected = selected.filter(s => s.id !== ex.id);
            }
            updateSummary();
            render(list);
        });

        // Detalles del ejercicio
        const nameEl = document.createElement("div");
        nameEl.innerHTML = `<strong>
      <a href="exercise_detail.html?name=${encodeURIComponent(ex.name)}" target="_blank">
        ${ex.name}
      </a>
    </strong>`;

        const targetEl = document.createElement("div");
        targetEl.textContent = `Target: ${ex.target}`;
        const equipEl = document.createElement("div");
        equipEl.textContent  = `Equip: ${ex.equipment}`;

        // Montar tarjeta
        [favBtn, cb, nameEl, targetEl, equipEl, repsSelect]
            .forEach(el => card.appendChild(el));

        exerciseList.appendChild(card);
    });
}

// Carga inicial tras login
onAuthStateChanged(auth, async (user) => {
    if (!user) return alert("Inicia sesión para acceder.");
    const uid = user.uid;

    // Cargar favoritos
    const userSnap = await getDoc(docRef(db, "user_app", uid));
    favorites = (userSnap.exists() && Array.isArray(userSnap.data().favorites))
        ? userSnap.data().favorites
        : [];

    // Cargar ejercicios por grupo
    await Promise.all(collectionNames.map(async colName => {
        const snap = await getDocs(collection(db, colName));
        const part = colName.replace("exercises_", "");
        allExercises[part] = snap.docs.map(d => ({
            id:       d.id,
            ...d.data(),
            bodyPart: part
        }));
    }));

    // Rellenar selector de grupos
    select.appendChild(new Option("Favorites", FAVORITES_VALUE));
    Object.keys(allExercises).sort().forEach(part => {
        const label = part.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
        select.appendChild(new Option(label, part));
    });

    // Modo edición
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
            selected            = r.exercises.slice();
            updateSummary();

            // Seleccionar automáticamente el grupo y renderizar con checkboxes marcados
            const first = selected[0]?.bodyPart;
            if (first) {
                select.value = first;
                select.dispatchEvent(new Event("change"));
            }
        }
    } else {
        exerciseList.innerHTML = `<p>Select a muscular group…</p>`;
        updateSummary();
    }
});

// Handlers de UI
select.addEventListener("change", () => {
    if (select.value === FAVORITES_VALUE) {
        currentList = Object.values(allExercises)
            .flat()
            .filter(e => favorites.includes(e.id));
    } else {
        currentList = allExercises[select.value] || [];
    }
    searchInput.value = "";
    render(currentList);
    updateSummary();
});

searchInput.addEventListener("input", () => {
    const term = searchInput.value.trim().toLowerCase();
    const sourceList = select.value === FAVORITES_VALUE
        ? Object.values(allExercises)
            .flat()
            .filter(e => favorites.includes(e.id))
        : currentList;
    const filtered = !term
        ? sourceList
        : sourceList.filter(ex =>
            ex.name.toLowerCase().includes(term) ||
            ex.target.toLowerCase().includes(term) ||
            (ex.equipment||"").toLowerCase().includes(term)
        );
    render(filtered);
    updateSummary();
});

// Guardar o actualizar rutina
saveBtn.addEventListener("click", async () => {
    const name        = nameInput.value.trim();
    const description = descInput.value.trim();
    const duration    = durationInput.value.trim();
    const rest        = restInput.value.trim();

    if (!name || !description || !duration) {
        return alert("Complete name, description, duration and rest time.");
    }
    if (!selected.length) {
        return alert("Select at least one exercise.");
    }
    const user = auth.currentUser;
    if (!user) {
        return alert("You should log in first.");
    }

    const payload = {
        uid:         user.uid,
        name,
        description,
        duration,
        rest,
        exercises: selected.map(e => ({
            id:       e.id,
            bodyPart: e.bodyPart,
            name:     e.name,
            reps:     e.reps
        }))
    };

    try {
        if (editId) {
            await updateDoc(docRef(db, "user_routines", editId), payload);
            alert("Routine updated");
        } else {
            await addDoc(userRoutinesCol, payload);
            alert("Routine saved");
        }
        location.href = "my_routines.html";
    } catch (err) {
        console.error(err);
        alert("Error guardando rutina: " + err.message);
    }
});
