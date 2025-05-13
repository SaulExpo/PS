import {
    collection,
    addDoc,
    updateDoc,
    doc as docRef,
    getDoc,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { db, auth } from "../firebase_config.js";
import { getCollectionCached } from "./cacheLoad.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import Swal from "https://cdn.skypack.dev/sweetalert2";
import Sortable from "https://cdn.skypack.dev/sortablejs";

const select        = document.getElementById("bodypart-select");
const searchInput   = document.getElementById("exercise-search");
const exerciseList  = document.getElementById("exercise-list");
const summaryEl     = document.getElementById("selected-summary");
const nameInput     = document.getElementById("routine-name");
const descInput     = document.getElementById("routine-description");
const durationInput = document.getElementById("routine-duration");
const restInput     = document.getElementById("routine-rest");
const saveBtn       = document.getElementById("save-export-routine");

// Botón para seleccionar 4 ejercicios aleatorios
const randomBtn = document.createElement("button");
randomBtn.id = "random-four-btn";
randomBtn.textContent = "Random exercises";
randomBtn.className = "random-btn";
saveBtn.parentNode.insertBefore(randomBtn, saveBtn);

const FAVORITES_VALUE = "favoritos";
const ALL_VALUE       = "";
const COLLECTIONS     = [
    "exercises_cardio","exercises_chest","exercises_lower_arms",
    "exercises_lower_legs","exercises_neck","exercises_shoulders",
    "exercises_upper_arms","exercises_upper_legs","exercises_waist","exercises_back"
];

let currentList = [];
let selected    = [];
let editId      = null;
let favorites   = [];
const userRoutinesCol = collection(db, "user_routines");

async function fetchExercises(part) {
    const all = [];
    for (const col of COLLECTIONS) {
        const docs = await getCollectionCached(col);
        const bp = col.replace("exercises_", "");
        docs.forEach(d => all.push({ id: d.id, bodyPart: bp, ...d }));
    }
    if (part === ALL_VALUE) return all;
    if (part === FAVORITES_VALUE) return all.filter(e => favorites.includes(e.id));
    return all.filter(e => e.bodyPart === part);
}

function updateSummary() {
    summaryEl.innerHTML = "";
    if (!selected.length) {
        summaryEl.innerHTML = "<p>No hay ejercicios seleccionados.</p>";
        return;
    }

    selected.forEach((e, idx) => {
        const container = document.createElement("div");
        container.className = "summary-item";
        container.setAttribute("data-id", e.id);

        // Drag handle
        const dragHandle = document.createElement("span");
        dragHandle.className = "drag-handle";
        dragHandle.textContent = "☰";
        dragHandle.style.cursor = "grab";
        dragHandle.style.padding = "0 8px";

        const linkEl = document.createElement("a");
        linkEl.textContent = e.name;
        linkEl.href      = `exercise_detail.html?name=${encodeURIComponent(e.name)}`;
        linkEl.target    = "_blank";
        linkEl.className = "summary-link";
        linkEl.style.marginRight = "8px";

        const repsSelect = document.createElement("select");
        repsSelect.innerHTML = `
      <option value="3x10">3x10</option>
      <option value="4x12">4x12</option>
      <option value="5x15">5x15</option>`;
        repsSelect.value = e.reps;
        repsSelect.style.margin = "0 8px";
        repsSelect.addEventListener("change", () => {
            selected[idx].reps = repsSelect.value;
        });

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Eliminar";
        removeBtn.style.margin = "0 8px";
        removeBtn.addEventListener("click", () => {
            selected.splice(idx, 1);
            updateSummary();
        });

        container.append(dragHandle, linkEl, repsSelect, removeBtn);
        summaryEl.appendChild(container);
    });
}

function render(list) {
    exerciseList.innerHTML = "";
    if (!list.length) {
        exerciseList.innerHTML = "<p>No hay ejercicios para mostrar.</p>";
        return;
    }
    list.forEach(ex => {
        const card = document.createElement("div");
        card.className = "exercise-card";
        card.style.position = "relative";

        // Favoritos
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
                currentList = await fetchExercises(FAVORITES_VALUE);
                render(currentList);
            }
        });

        const repsSelect = document.createElement("select");
        repsSelect.innerHTML = `
      <option value="3x10">3x10</option>
      <option value="4x12">4x12</option>
      <option value="5x15">5x15</option>`;
        repsSelect.value = selected.find(s => s.id === ex.id)?.reps || "5x15";

        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = selected.some(s => s.id === ex.id);
        cb.style.margin = "0 8px";
        cb.addEventListener("change", () => {
            if (cb.checked) {
                selected.push({
                    id:       ex.id,
                    bodyPart: ex.bodyPart,
                    name:     ex.name,
                    reps:     repsSelect.value
                });
            } else {
                selected = selected.filter(s => s.id !== ex.id);
            }
            updateSummary();
        });

        const nameEl   = document.createElement("div");
        nameEl.innerHTML = `<strong>
      <a href="exercise_detail.html?name=${encodeURIComponent(ex.name)}" target="_blank">
        ${ex.name}
      </a>
    </strong>`;
        const targetEl = document.createElement("div");
        targetEl.textContent = `Target: ${ex.target}`;
        const equipEl  = document.createElement("div");
        equipEl.textContent  = `Equip: ${ex.equipment}`;

        [favBtn, cb, nameEl, targetEl, equipEl, repsSelect]
            .forEach(el => card.appendChild(el));

        exerciseList.appendChild(card);
    });
}

randomBtn.addEventListener("click", async () => {
    const pool = await fetchExercises(select.value);
    if (pool.length < 4) {
        return Swal.fire({
            title: "Not enogh exercises to select.",
            icon:  "warning",
            confirmButtonColor: "#d51313",
            confirmButtonText:  "Ok"
        });
    }
    const chosen = pool.sort(() => 0.5 - Math.random()).slice(0, 4);
    selected = chosen.map(ex => ({
        id:       ex.id,
        bodyPart: ex.bodyPart,
        name:     ex.name,
        reps:     "5x15"
    }));
    updateSummary();
});

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        return Swal.fire({
            title: "Inicia sesión para acceder.",
            icon:  "warning",
            confirmButtonColor: "#d51313"
        });
    }

    const uid     = user.uid;
    const userSnap = await getDoc(docRef(db, "user_app", uid));
    favorites = (userSnap.exists() && Array.isArray(userSnap.data().favorites))
        ? userSnap.data().favorites
        : [];

    select.appendChild(new Option("Todos",      ALL_VALUE));
    select.appendChild(new Option("Favorites",  FAVORITES_VALUE));
    COLLECTIONS.forEach(col => {
        const bp    = col.replace("exercises_", "").replace(/_/g, " ");
        const label = bp[0].toUpperCase() + bp.slice(1);
        select.appendChild(new Option(label, col.replace("exercises_", "")));
    });

    select.value = ALL_VALUE;
    select.dispatchEvent(new Event("change"));

    Sortable.create(summaryEl, {
        animation: 150,
        handle:    ".drag-handle",
        ghostClass: "sortable-ghost",
        onEnd(evt) {
            const [moved] = selected.splice(evt.oldIndex, 1);
            selected.splice(evt.newIndex, 0, moved);
            updateSummary();
        }
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
            selected            = r.exercises.slice();
            updateSummary();
            select.value = r.exercises[0]?.bodyPart || ALL_VALUE;
            select.dispatchEvent(new Event("change"));
        }
    }
});

select.addEventListener("change", async () => {
    currentList = await fetchExercises(select.value);
    searchInput.value = "";
    render(currentList);
    updateSummary();
});

searchInput.addEventListener("input", () => {
    const term = searchInput.value.trim().toLowerCase();
    const filtered = !term
        ? currentList
        : currentList.filter(ex =>
            ex.name.toLowerCase().includes(term) ||
            ex.target.toLowerCase().includes(term) ||
            (ex.equipment||"").toLowerCase().includes(term)
        );
    render(filtered);
});

saveBtn.addEventListener("click", async () => {
    const name        = nameInput.value.trim();
    const description = descInput.value.trim();
    const duration    = durationInput.value.trim();
    const rest        = restInput.value.trim();

    if (!name || !description || !duration) {
        return Swal.fire({
            title: "Completa nombre, descripción y duración.",
            icon:  "warning",
            confirmButtonColor: "#d51313",
            confirmButtonText:  "Ok"
        });
    }
    if (!selected.length) {
        return Swal.fire({
            title: "Selecciona al menos un ejercicio.",
            icon:  "warning",
            confirmButtonColor: "#d51313",
            confirmButtonText:  "Ok"
        });
    }
    const user = auth.currentUser;
    if (!user) {
        return Swal.fire({
            title: "Inicia sesión primero.",
            icon:  "warning",
            confirmButtonColor: "#d51313",
            confirmButtonText:  "Ok"
        });
    }

    const payload = {
        uid:       user.uid,
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
            Swal.fire({
                title: "Rutina actualizada.",
                icon:  "success",
                confirmButtonColor: "#d51313",
                confirmButtonText:  "Ok"
            }).then(() => location.href = "my_routines.html");
        } else {
            await addDoc(userRoutinesCol, payload);
            Swal.fire({
                title: "Rutina guardada.",
                icon:  "success",
                confirmButtonColor: "#d51313",
                confirmButtonText:  "Ok"
            }).then(() => location.href = "my_routines.html");
        }
    } catch (err) {
        console.error(err);
        alert("Error guardando rutina: " + err.message);
    }
});
