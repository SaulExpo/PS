import {
    collection,
    addDoc,
    updateDoc,
    doc as docRef,
    getDoc
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

// Botón “Random exercises” con estilo como “Eliminar”
const randomBtn = document.createElement("button");
randomBtn.id = "random-four-btn";
randomBtn.textContent = "Random exercises";
randomBtn.className = "random-btn";
randomBtn.style.background = "#e74c3c";
randomBtn.style.color = "#fff";
randomBtn.style.border = "none";
randomBtn.style.padding = "4px 8px";
randomBtn.style.borderRadius = "4px";
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

function updateSummary() {
    summaryEl.innerHTML = "";
    if (!selected.length) {
        summaryEl.innerHTML = "<p>No exercises selected.</p>";
        return;
    }
    selected.forEach((e, idx) => {
        const c = document.createElement("div");
        c.className = "summary-item";
        c.dataset.id = e.id;
        c.style.cssText = "display:flex;align-items:center;padding:8px;border:1px solid #ccc;border-radius:4px;margin-bottom:4px";

        const drag = document.createElement("span");
        drag.className = "drag-handle";
        drag.textContent = "☰";
        drag.style.cssText = "cursor:grab;margin-right:8px";

        const link = document.createElement("a");
        link.textContent = e.name;
        link.href      = `exercise_detail.html?name=${encodeURIComponent(e.name)}`;
        link.target    = "_blank";
        link.style.cssText = "flex-grow:1;text-decoration:none;color:#333";

        const sel = document.createElement("select");
        sel.innerHTML = `
      <option value="3x10">3x10</option>
      <option value="4x12">4x12</option>
      <option value="5x15">5x15</option>`;
        sel.value = e.reps;
        sel.style.margin = "0 8px";
        sel.addEventListener("change", () => {
            selected[idx].reps = sel.value;
            const card = exerciseList.querySelector(`.exercise-card[data-id="${e.id}"]`);
            if (card) {
                const cs = card.querySelector("select.card-reps-select");
                if (cs) cs.value = sel.value;
            }
        });

        const rem = document.createElement("button");
        rem.textContent = "Eliminar";
        rem.style.cssText = "background:#e74c3c;color:#fff;border:none;padding:4px 8px;border-radius:4px;margin-left:8px";
        rem.addEventListener("click", () => {
            selected.splice(idx,1);
            updateSummary();
        });

        c.append(drag, link, sel, rem);
        summaryEl.appendChild(c);
    });
}

function render(list) {
    exerciseList.innerHTML = "";
    if (!list.length) {
        exerciseList.innerHTML = "<p>No exercises to show.</p>";
        return;
    }
    list.forEach(ex => {
        const card = document.createElement("div");
        card.className = "exercise-card";
        card.dataset.id = ex.id;
        card.style.cssText = "position:relative;padding:16px;border:1px solid #ddd;border-radius:8px;margin-bottom:12px;background:#f9f9f9";

        const fav = document.createElement("button");
        fav.className = "fav-btn";
        fav.textContent = favorites.includes(ex.id) ? "❤️" : "🤍";
        fav.style.cssText = "position:absolute;top:8px;right:8px";
        fav.addEventListener("click", async () => {
            const uid = auth.currentUser.uid;
            favorites = favorites.includes(ex.id)
                ? favorites.filter(id=>id!==ex.id)
                : [...favorites, ex.id];
            await updateDoc(docRef(db,"user_app",uid),{ favorites });
            // reaplicar filtro y búsqueda
            const pool = await fetchExercises(select.value);
            currentList = pool;
            const term = searchInput.value.trim().toLowerCase();
            const filtered = term
                ? pool.filter(x=>
                    x.name.toLowerCase().includes(term) ||
                    x.target.toLowerCase().includes(term) ||
                    (x.equipment||"").toLowerCase().includes(term)
                )
                : pool;
            render(filtered);
            updateSummary();
        });

        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = selected.some(s=>s.name===ex.name);
        cb.style.marginRight = "8px";
        cb.addEventListener("change", () => {
            if (cb.checked) {
                if (!selected.some(s=>s.name===ex.name)) {
                    selected.push({
                        id: ex.id,
                        bodyPart: ex.bodyPart,
                        name: ex.name,
                        reps: ex.reps||"5x15"
                    });
                }
            } else {
                selected = selected.filter(s=>s.name!==ex.name);
            }
            updateSummary();
        });

        const nm = document.createElement("div");
        nm.innerHTML = `<strong><a href="exercise_detail.html?name=${encodeURIComponent(ex.name)}" target="_blank">${ex.name}</a></strong>`;
        nm.style.marginBottom = "4px";

        const tgt = document.createElement("div");
        tgt.textContent = `Target: ${ex.target}`;
        tgt.style.fontSize = "0.9em";

        const eq = document.createElement("div");
        eq.textContent = `Equip: ${ex.equipment}`;
        eq.style.fontSize = "0.9em";

        const cs = document.createElement("select");
        cs.className = "card-reps-select";
        cs.innerHTML = `
      <option value="3x10">3x10</option>
      <option value="4x12">4x12</option>
      <option value="5x15">5x15</option>`;
        cs.value = selected.find(s=>s.name===ex.name)?.reps || "5x15";
        cs.style.marginLeft = "8px";
        cs.addEventListener("change", () => {
            const i = selected.findIndex(s=>s.name===ex.name);
            if (i>-1) {
                selected[i].reps = cs.value;
                const sumSel = summaryEl.querySelector(`.summary-item[data-id="${ex.id}"] select`);
                if (sumSel) sumSel.value = cs.value;
            }
        });

        card.append(fav, cb, nm, tgt, eq, cs);
        exerciseList.appendChild(card);
    });
}

// Random
randomBtn.addEventListener("click", async () => {
    const pool = await fetchExercises(select.value);
    if (pool.length < 4) return Swal.fire({ title:"Not enough exercises.", icon:"warning" });
    selected = pool.sort(()=>0.5-Math.random()).slice(0,4)
        .map(x=>({ id:x.id, bodyPart:x.bodyPart, name:x.name, reps:"5x15" }));
    updateSummary();
});

// Autenticación y resto de lógica idéntica...
onAuthStateChanged(auth, async user => {
    if (!user) {
        Swal.fire({ title:"Log in to create a routine.", icon:"warning" });
        return;
    }
    const uid = user.uid;
    const userSnap = await getDoc(docRef(db,"user_app",uid));
    favorites = userSnap.exists() && Array.isArray(userSnap.data().favorites)
        ? userSnap.data().favorites
        : [];

    // POBLAR FILTRO
    select.innerHTML = "";
    select.append(new Option("All exercises", ALL_VALUE));
    select.append(new Option("Favorites", FAVORITES_VALUE));
    COLLECTIONS.forEach(col=>{
        const bp = col.replace("exercises_","").replace(/_/g," ");
        select.append(new Option(bp[0].toUpperCase()+bp.slice(1), col.replace("exercises_","")));
    });
    select.value = ALL_VALUE;

    // SORTABLE
    Sortable.create(summaryEl,{ animation:150, handle:".drag-handle", ghostClass:"sortable-ghost",
        onEnd(evt){
            const [m] = selected.splice(evt.oldIndex,1);
            selected.splice(evt.newIndex,0,m);
            updateSummary();
        }
    });

    // FILTRO & BÚSQUEDA
    select.addEventListener("change", async ()=>{
        currentList = await fetchExercises(select.value);
        searchInput.value = "";
        render(currentList);
        updateSummary();
    });
    searchInput.addEventListener("input", ()=>{
        const t = searchInput.value.trim().toLowerCase();
        const filt = t
            ? currentList.filter(x=>
                x.name.toLowerCase().includes(t) ||
                x.target.toLowerCase().includes(t) ||
                (x.equipment||"").toLowerCase().includes(t)
            )
            : currentList;
        render(filt);
    });

    // GUARDADO con saneado
    saveBtn.addEventListener("click", async ()=>{
        const name        = nameInput.value.trim();
        const description = descInput.value.trim();
        const duration    = durationInput.value.trim();
        const rest        = restInput.value.trim();
        if (!name||!description||!duration) {
            return Swal.fire({ title:"Complete name, description & duration.", icon:"warning" });
        }
        if (!selected.length) {
            return Swal.fire({ title:"Select at least one exercise.", icon:"warning" });
        }

        const cleanExercises = selected.map(e=>({
            id:       e.id,
            bodyPart: e.bodyPart,
            name:     e.name,
            reps:     e.reps || "5x15"
        }));

        const payload = {
            uid,
            name,
            description,
            duration,
            rest:      rest || "",
            exercises: cleanExercises
        };
        console.log("Saving", payload);

        try {
            if (editId) {
                await updateDoc(docRef(db,"user_routines",editId), payload);
                Swal.fire("Updated routine").then(()=>location.href="my_routines.html");
            } else {
                await addDoc(userRoutinesCol, payload);
                Swal.fire("Saved routine").then(()=>location.href="my_routines.html");
            }
        } catch(err) {
            console.error(err);
            Swal.fire("Error saving routine: "+err.message);
        }
    });

    // CARGA DESDE PREDEF (¡aquí está la corrección clave!)
    const fromPre = new URLSearchParams(location.search).get("fromPredefined");
    if (fromPre) {
        try {
            const snap = await getDoc(docRef(db,"routines",fromPre));
            if (!snap.exists()) {
                return Swal.fire("Predefined not found.");
            }
            const r = snap.data();

            // primero carga la lista completa de ejercicios
            currentList = await fetchExercises(ALL_VALUE);

            // rellena campos
            nameInput.value     = r.name;
            descInput.value     = r.description;
            durationInput.value = r.duration || "";
            restInput.value     = r.rest     || "";

            // mapea cada ex de la rutina predefinida
            selected = (r.exercises||[]).map(exercise => {
                const match = currentList.find(x => x.name === exercise.name);
                return {
                    id:       match?.id       || "",
                    bodyPart: match?.bodyPart || "",
                    name:     exercise.name,
                    reps:     exercise.reps   || "5x15"
                };
            }).filter(x => x.id); // descartamos los que no encajen

            updateSummary();
            select.value = ALL_VALUE;
            render(currentList);
            select.dispatchEvent(new Event("change"));
        } catch(err) {
            console.error(err);
            Swal.fire("Error loading predefined.");
        }
        return;
    }

    // EDICIÓN de rutina de usuario (igual que antes)...
    editId = new URLSearchParams(location.search).get("editId");
    if (editId) {
        const snap = await getDoc(docRef(db,"user_routines",editId));
        if (snap.exists()) {
            const r = snap.data();
            nameInput.value     = r.name;
            descInput.value     = r.description;
            durationInput.value = r.duration;
            restInput.value     = r.rest || "";
            selected            = r.exercises.slice();
            updateSummary();
            render(await fetchExercises(select.value));
            select.dispatchEvent(new Event("change"));
        }
    }

    // carga inicial
    currentList = await fetchExercises(ALL_VALUE);
    render(currentList);
});
