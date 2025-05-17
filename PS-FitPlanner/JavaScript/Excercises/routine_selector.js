import { collection, addDoc, updateDoc, doc as docRef, getDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { db, auth } from "../firebase_config.js";
import { getCollectionCached } from "./cacheLoad.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import Swal from "https://cdn.skypack.dev/sweetalert2";
import Sortable from "https://cdn.skypack.dev/sortablejs";
import { excersiseSelectorLanguage } from "../Language/excercise_selectorLanguage.js";
import { translateText } from "../translate.js";

const select        = document.getElementById("bodypart-select");
const searchInput   = document.getElementById("exercise-search");
const exerciseList  = document.getElementById("exercise-list");
const summaryEl     = document.getElementById("selected-summary");
const nameInput     = document.getElementById("routine-name");
const descInput     = document.getElementById("routine-description");
const durationInput = document.getElementById("routine-duration");
const restInput     = document.getElementById("routine-rest");
const saveBtn       = document.getElementById("save-export-routine");
const randomBtn = document.createElement("button");
let language = localStorage.getItem("language");
excersiseSelectorLanguage();
select.innerHTML = "";
randomBtn.id = "random-four-btn";
randomBtn.textContent = language === "english" ? "Random exercises" : "Ejercicios aleatorios";
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
        const bp   = col.replace("exercises_", "");
        docs.forEach(d => {
            const obj = typeof d.data === "function" ? d.data() : d;
            all.push({ id: d.id, bodyPart: bp, ...obj });
        });
    }
    if (part === ALL_VALUE)       return all;
    if (part === FAVORITES_VALUE) return all.filter(e => favorites.includes(e.id));
    return all.filter(e => e.bodyPart === part);
}

// Actualiza el resumen con traducción y estilos
async function updateSummary() {
    summaryEl.innerHTML = "";
    if (!selected.length) {
        summaryEl.innerHTML = language === "english"
            ? "<p>No exercises selected.</p>"
            : "<p>No hay ejercicios seleccionados.</p>";
        return;
    }
    for (const e of selected) {
        const idx = selected.indexOf(e);
        let nombre = language !== "english" ? await translateText(e.name, "es") : e.name;
        const container = document.createElement("div");
        container.className = "summary-item";
        container.dataset.id = e.id;
        container.style.cssText = "display:flex;align-items:center;padding:8px;border:1px solid #ccc;border-radius:4px;margin-bottom:4px";

        const dragHandle = document.createElement("span");
        dragHandle.className = "drag-handle";
        dragHandle.textContent = "☰";
        dragHandle.style.cssText = "cursor:grab;margin-right:8px";

        const linkEl = document.createElement("a");
        linkEl.textContent = nombre;
        linkEl.href = `exercise_detail.html?name=${encodeURIComponent(e.name)}`;
        linkEl.target = "_blank";
        linkEl.className = "summary-link";
        linkEl.style.cssText = "flex-grow:1;text-decoration:none;color:#333";

        const repsSelect = document.createElement("select");
        repsSelect.innerHTML = `
      <option value=\"3x10\">3x10</option>
      <option value=\"4x12\">4x12</option>
      <option value=\"5x15\">5x15</option>`;
        repsSelect.value = e.reps;
        repsSelect.style.margin = "0 8px";
        repsSelect.addEventListener("change", () => {
            selected[idx].reps = repsSelect.value;
        });

        const removeBtn = document.createElement("button");
        removeBtn.textContent = language === "english" ? "Delete" : "Eliminar";
        removeBtn.style.cssText = "background:#e74c3c;color:#fff;border:none;padding:4px 8px;border-radius:4px;margin-left:8px";
        removeBtn.addEventListener("click", () => {
            selected.splice(idx, 1);
            updateSummary();
        });

        container.append(dragHandle, linkEl, repsSelect, removeBtn);
        summaryEl.appendChild(container);
    }
}

async function render(list) {
    exerciseList.innerHTML = "";
    if (!list.length) {
        exerciseList.innerHTML = language === "english"
            ? "<p>No exercises to show.</p>"
            : "<p>No hay ejercicios para mostrar.</p>";
        return;
    }
    for (const ex of list) {
        let nombre = language !== "english" ? await translateText(ex.name, "es") : ex.name;
        let equip  = language !== "english" ? await translateText(ex.equipment, "es") : ex.equipment;
        let target = language !== "english" ? await translateText(ex.target, "es") : ex.target;

        const card = document.createElement("div");
        card.className = "exercise-card";
        card.dataset.id = ex.id;
        card.style.cssText = "position:relative;padding:16px;border:1px solid #ddd;border-radius:8px;margin-bottom:12px;background:#f9f9f9";

        const favBtn = document.createElement("button");
        favBtn.className = "fav-btn";
        favBtn.textContent = favorites.includes(ex.id) ? "❤️" : "🤍";
        favBtn.style.cssText = "position:absolute;top:8px;right:8px";
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
        repsSelect.className = "card-reps-select";
        repsSelect.innerHTML = `
      <option value=\"3x10\">3x10</option>
      <option value=\"4x12\">4x12</option>
      <option value=\"5x15\">5x15</option>`;
        repsSelect.value = selected.find(s => s.id === ex.id)?.reps || "5x15";
        repsSelect.style.marginLeft = "8px";
        repsSelect.addEventListener("change", () => {
            const i = selected.findIndex(s => s.id === ex.id);
            if (i > -1) {
                selected[i].reps = repsSelect.value;
                const sumSel = summaryEl.querySelector(`.summary-item[data-id=\"${ex.id}\"] select`);
                if (sumSel) sumSel.value = repsSelect.value;
            }
        });

        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = selected.some(s => s.id === ex.id);
        cb.style.margin = "0 8px";
        cb.addEventListener("change", () => {
            if (cb.checked) {
                selected.push({ id: ex.id, bodyPart: ex.bodyPart, name: ex.name, reps: repsSelect.value });
            } else {
                selected = selected.filter(s => s.id !== ex.id);
            }
            updateSummary();
        });

        const nameEl   = document.createElement("div");
        nameEl.innerHTML   = `<strong><a href=exercise_detail.html?name=${encodeURIComponent(ex.name)} target=\"_blank\">${nombre}</a></strong>`;
        nameEl.style.marginBottom = "4px";
        const targetEl = document.createElement("div");
        targetEl.textContent = `${language === "english" ? "Target:" : "Objetivo:"} ${target}`;
        targetEl.style.fontSize = "0.9em";
        const equipEl  = document.createElement("div");
        equipEl.textContent  = `${language === "english" ? "Equip:" : "Equipo:"} ${equip}`;
        equipEl.style.fontSize = "0.9em";

        [favBtn, cb, nameEl, targetEl, equipEl, repsSelect].forEach(el => card.appendChild(el));
        exerciseList.appendChild(card);
    }
}

randomBtn.addEventListener("click", async () => {
    const pool = await fetchExercises(select.value);
    const errTitle = language === "english"
        ? "Not enough exercises to select."
        : "No hay suficientes ejercicios para seleccionar.";
    if (pool.length < 4) {
        return Swal.fire({ title: errTitle, icon: "warning", confirmButtonColor: "#d51313", confirmButtonText: "Ok" });
    }
    selected = pool.sort(() => 0.5 - Math.random()).slice(0, 4)
        .map(ex => ({ id: ex.id, bodyPart: ex.bodyPart, name: ex.name, reps: "5x15" }));
    updateSummary();
});

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        const msg = language === "english"
            ? "Log in to access." : "Inicia sesión para acceder.";
        return Swal.fire({ title: msg, icon: "warning", confirmButtonColor: "#d51313" });
    }

    const uid     = user.uid;
    const userSnap = await getDoc(docRef(db, "user_app", uid));
    favorites = (userSnap.exists() && Array.isArray(userSnap.data().favorites))
        ? userSnap.data().favorites
        : [];

    select.innerHTML = "";
    if (language !== "english") {
        select.appendChild(new Option("Todos", ALL_VALUE));
        select.appendChild(new Option("Favoritos", FAVORITES_VALUE));
    } else {
        select.appendChild(new Option("All exercises", ALL_VALUE));
        select.appendChild(new Option("Favorites", FAVORITES_VALUE));
    }
    for (const col of COLLECTIONS) {
        const bp = col.replace("exercises_", "").replace(/_/g, " ");
        let label;
        if (language !== "english") {
            label = await translateText(bp[0].toUpperCase() + bp.slice(1), "es");
            if (label === "Atrás") label = "Espalda";
        } else {
            label = bp[0].toUpperCase() + bp.slice(1);
        }
        select.appendChild(new Option(label, bp));
    }

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

    const fromPre = new URLSearchParams(location.search).get("fromPredefined");
    if (fromPre) {
        try {
            const snap = await getDoc(docRef(db, "routines", fromPre));
            if (!snap.exists()) {
                const nf = language === "english" ? "Predefined not found." : "Predefinido no encontrado.";
                return Swal.fire({ title: nf, icon: "warning", confirmButtonColor: "#d51313" });
            }
            const r = snap.data();

            // cargar lista completa de ejercicios
            currentList = await fetchExercises(ALL_VALUE);
            // rellenar campos del formulario
            nameInput.value     = r.name;
            descInput.value     = r.description;
            durationInput.value = r.duration || "";
            restInput.value     = r.rest     || "";

            // mapear ejercicios de la rutina predefinida
            selected = (r.exercises || []).map(exercise => {
                const match = currentList.find(x => x.name === exercise.name);
                return {
                    id:       match?.id       || "",
                    bodyPart: match?.bodyPart || "",
                    name:     exercise.name,
                    reps:     exercise.reps   || "5x15"
                };
            }).filter(x => x.id);

            select.value = ALL_VALUE;
            select.dispatchEvent(new Event("change"));
        } catch (err) {
            console.error(err);
            const errMsg = language === "english"
                ? "Error loading predefined." : "Error cargando predefinido.";
            Swal.fire({ title: errMsg, icon: "error", confirmButtonColor: "#d51313" });
        }
        return;
    }

    // Edición de rutina de usuario
    editId = new URLSearchParams(location.search).get("editId");
    if (editId) {
        const rutSnap = await getDoc(docRef(db, "user_routines", editId));
        if (rutSnap.exists()) {
            const r = rutSnap.data();
            nameInput.value     = r.name;
            descInput.value     = r.description;
            durationInput.value = r.duration;
            restInput.value     = r.rest || "";
            selected            = r.exercises.slice();
            select.value = selected[0]?.bodyPart || ALL_VALUE;
        }
    }

    select.value = ALL_VALUE;
    select.dispatchEvent(new Event("change"));
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
            (ex.equipment || "").toLowerCase().includes(term)
        );
    render(filtered);
});

// Guardado de rutina
saveBtn.addEventListener("click", async () => {
    const name        = nameInput.value.trim();
    const description = descInput.value.trim();
    const duration    = durationInput.value.trim();
    const rest        = restInput.value.trim();

    if (!name || !description || !duration) {
        const warn = language === "english"
            ? "Complete name, description & duration." : "Completa nombre, descripción y duración.";
        return Swal.fire({ title: warn, icon: "warning", confirmButtonColor: "#d51313", confirmButtonText: "Ok" });
    }
    if (!selected.length) {
        const warn = language === "english"
            ? "Select at least one exercise." : "Selecciona al menos un ejercicio.";
        return Swal.fire({ title: warn, icon: "warning", confirmButtonColor: "#d51313", confirmButtonText: "Ok" });
    }

    const user = auth.currentUser;
    if (!user) {
        const msg = language === "english"
            ? "Log in first." : "Inicia sesión primero.";
        return Swal.fire({ title: msg, icon: "warning", confirmButtonColor: "#d51313", confirmButtonText: "Ok" });
    }

    const payload = {
        uid:       user.uid,
        name,
        description,
        duration,
        rest,
        exercises: selected.map(e => ({ id: e.id, bodyPart: e.bodyPart, name: e.name, reps: e.reps }))
    };

    try {
        if (editId) {
            await updateDoc(docRef(db, "user_routines", editId), payload);
            Swal.fire({ title: language === "english" ? "Routine updated." : "Rutina actualizada.", icon: "success", confirmButtonColor: "#d51313", confirmButtonText: "Ok" })
                .then(() => location.href = "my_routines.html");
        } else {
            await addDoc(userRoutinesCol, payload);
            Swal.fire({ title: language === "english" ? "Routine saved." : "Rutina guardada.", icon: "success", confirmButtonColor: "#d51313", confirmButtonText: "Ok" })
                .then(() => location.href = "my_routines.html");
        }
    } catch (err) {
        console.error(err);
        Swal.fire({ title: language === "english" ? `Error saving routine: ${err.message}` : `Error guardando rutina: ${err.message}`, icon: "error" });
    }
});
