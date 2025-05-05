import {getFirestore, collection, getDocs, addDoc, updateDoc, doc as docRef, getDoc} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import {db} from "../firebase_config.js";
import {auth} from "../firebase_config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// Elementos del DOM
const select         = document.getElementById("bodypart-select");
const searchInput    = document.getElementById("exercise-search");
const exerciseList   = document.getElementById("exercise-list");
const nameInput      = document.getElementById("routine-name");
const descInput      = document.getElementById("routine-description");
const durationInput  = document.getElementById("routine-duration");
const restInput      = document.getElementById("routine-rest");
const noteInput      = document.getElementById("routine-note");
const saveBtn        = document.getElementById("save-export-routine");

// Definimos el valor para la categoría "Favoritos"
const FAVORITES_VALUE = "favoritos";

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
let favorites      = [];

const userRoutinesCol = collection(db, "user_routines");

// Función para renderizar tarjetas de ejercicio
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

        // Botón de favorito (corazón)
        const favBtn = document.createElement("button");
        favBtn.className = "fav-btn";
        favBtn.textContent = favorites.includes(ex.id) ? "❤️" : "🤍";
        favBtn.style.position = "absolute";
        favBtn.style.top = "8px";
        favBtn.style.right = "8px";
        favBtn.addEventListener("click", async () => {
            const uid = auth.currentUser.uid;
            if (favorites.includes(ex.id)) {
                favorites = favorites.filter(id => id !== ex.id);
            } else {
                favorites.push(ex.id);
            }
            // Actualizar array de favoritos en user_app
            await updateDoc(docRef(db, "user_app", uid), { favorites });
            // Actualizar icono
            favBtn.textContent = favorites.includes(ex.id) ? "❤️" : "🤍";
            // Si estamos viendo Favoritos, refrescamos la lista
            if (select.value === FAVORITES_VALUE) {
                const favList = Object.values(allExercises)
                    .flat()
                    .filter(e => favorites.includes(e.id));
                render(favList);
            }
        });
        card.appendChild(favBtn);

        // Checkbox y datos del ejercicio
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = selected.some(e => e.id === ex.id);
        cb.addEventListener("change", () => {
            if (cb.checked) selected.push({ ...ex, reps: repsSelect.value });
            else selected = selected.filter(e => e.id !== ex.id);
        });

        const nameEl   = document.createElement("div"); nameEl.innerHTML   = `<strong>${ex.name}</strong>`;
        const targetEl = document.createElement("div"); targetEl.textContent = `Target: ${ex.target}`;
        const equipEl  = document.createElement("div"); equipEl.textContent  = `Equip: ${ex.equipment}`;

        const repsSelect = document.createElement("select");
        repsSelect.innerHTML = `
      <option value="3x10">3x10</option>
      <option value="4x12">4x12</option>
      <option value="5x15">5x15</option>`;
        repsSelect.value = selected.find(e => e.id === ex.id)?.reps || "5x15";
        repsSelect.addEventListener("change", () => {
            const i = selected.findIndex(e => e.id === ex.id);
            if (i >= 0) selected[i].reps = repsSelect.value;
        });

        [cb, nameEl, targetEl, equipEl, repsSelect].forEach(el => card.appendChild(el));
        exerciseList.appendChild(card);
    });
}

// Espera a que Auth cargue y luego inicializa
onAuthStateChanged(auth, async (user) => {
    if (!user) return alert("Debes iniciar sesión para acceder.");
    const uid = user.uid;

    // 1) Cargar favoritos del usuario
    const userSnap = await getDoc(docRef(db, "user_app", uid));
    favorites = userSnap.exists() && Array.isArray(userSnap.data().favorites)
        ? userSnap.data().favorites
        : [];

    // 2) Cargar ejercicios de Firestore
    await Promise.all(collectionNames.map(async colName => {
        const snap = await getDocs(collection(db, colName));
        const part = colName.replace("exercises_", "");
        allExercises[part] = snap.docs.map(d => ({ id: d.id, ...d.data(), bodyPart: part }));
    }));

    // 3) Poblar selector con Favoritos + grupos musculares
    select.appendChild(new Option("Favoritos", FAVORITES_VALUE));
    Object.keys(allExercises).sort().forEach(part => {
        const label = part.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
        select.appendChild(new Option(label, part));
    });

    // 4) Si editId, cargar rutina existente (igual que antes)
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
            noteInput.value     = r.note || "";
            selected            = r.exercises.slice();
            const first = selected[0]?.bodyPart;
            if (first) {
                select.value    = first;
                currentList     = allExercises[first];
                render(currentList);
            }
        }
    }

    // 5) Mensaje inicial
    exerciseList.innerHTML = `<p>Selecciona un grupo muscular…</p>`;
});

// Cambio de selector
select.addEventListener("change", () => {
    if (select.value === FAVORITES_VALUE) {
        const favList = Object.values(allExercises)
            .flat()
            .filter(e => favorites.includes(e.id));
        render(favList);
    } else {
        currentList    = allExercises[select.value] || [];
        searchInput.value = "";
        selected       = [];
        render(currentList);
    }
});

// Búsqueda en input
searchInput.addEventListener("input", () => {
    const term = searchInput.value.trim().toLowerCase();
    let listToFilter;
    if (select.value === FAVORITES_VALUE) {
        listToFilter = Object.values(allExercises).flat().filter(e => favorites.includes(e.id));
    } else {
        listToFilter = currentList;
    }
    const filtered = !term
        ? listToFilter
        : listToFilter.filter(ex =>
            ex.name.toLowerCase().includes(term) ||
            ex.target.toLowerCase().includes(term) ||
            (ex.equipment||"").toLowerCase().includes(term)
        );
    render(filtered);
});

// Guardar rutina (sin cambios) ...

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
