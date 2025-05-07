import {collection, getDocs, getDoc, doc, query, where} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import {db} from "../firebase_config.js";
const routinesCol = collection(db, "routines");

const typeSelector    = document.getElementById("typeSelector");
const routineSelector = document.getElementById("routineSelector");
const globalSearch    = document.getElementById("globalSearch");
const searchResults   = document.getElementById("searchResults");
const titleEl         = document.getElementById("title");
const infoEl          = document.getElementById("info");
const durationEl      = document.getElementById("durationContainer");
const restEl          = document.getElementById("restContainer");
const exercisesEl     = document.getElementById("exercises");

let allRoutines = [];

async function loadAllRoutines() {
    const snap = await getDocs(routinesCol);
    allRoutines = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    console.log("Loaded routines:", allRoutines.length);
}

async function loadRoutineTypes() {
    const snap = await getDocs(routinesCol);
    const types = new Set();
    snap.docs.forEach(d => types.add(d.data().routineType));
    Array.from(types).sort().forEach(type => {
        const opt = new Option(type.toUpperCase(), type);
        typeSelector.appendChild(opt);
    });
}

async function loadRoutineNames(type) {
    const q = query(routinesCol, where("routineType", "==", type));
    const snap = await getDocs(q);
    routineSelector.innerHTML = '<option disabled selected>Select routine</option>';
    snap.docs.forEach(d => {
        const { name } = d.data();
        const opt = document.createElement("option");
        opt.value = d.id;
        opt.textContent = name;
        routineSelector.appendChild(opt);
    });
    routineSelector.disabled = false;
}

async function loadRoutine(id) {
    const d = await getDoc(doc(routinesCol, id));
    if (!d.exists()) {
        alert("Rutina no encontrada");
        return;
    }
    const r = d.data();
    titleEl.innerText    = r.name;
    infoEl.innerText     = r.description;
    durationEl.textContent = `Duration: ${r.duration || "—"}`;
    restEl.textContent = `Rest time during sets: ${r.rest || "—"} minutes`;


    exercisesEl.innerHTML = "";
    r.exercises.forEach((ex, i) => {
        const wrapper = document.createElement("div");
        wrapper.id = `exercise_${i}`;
        exercisesEl.appendChild(wrapper);
        fetch("../Templates/info_exercise.html")
            .then(resp => resp.text())
            .then(tpl => {
                wrapper.innerHTML = tpl;
                wrapper.querySelector("#name_exercise").innerHTML = `
          <a href="./exercise_detail.html?name=${encodeURIComponent(ex.name)}">
            ${ex.name}
          </a>`;
                wrapper.querySelector("#reps").innerText = ex.reps;
            });
    });
}

globalSearch.addEventListener("input", () => {
    const q = globalSearch.value.toLowerCase();
    searchResults.innerHTML = '<option disabled selected>Results will appear here</option>';
    const filtered = allRoutines.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.routineType.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    );
    if (filtered.length === 0) {
        const opt = document.createElement("option");
        opt.disabled = true;
        opt.textContent = "No se encontraron coincidencias";
        searchResults.appendChild(opt);
    } else {
        filtered.forEach(r => {
            const opt = document.createElement("option");
            opt.value = r.id;
            opt.textContent = `[${r.routineType}] ${r.name}`;
            searchResults.appendChild(opt);
        });
    }
});

typeSelector   .addEventListener("change", () => loadRoutineNames(typeSelector.value));
routineSelector.addEventListener("change", () => loadRoutine(routineSelector.value));
searchResults  .addEventListener("change", () => loadRoutine(searchResults.value));

loadAllRoutines().then(() => {
    console.log("All routines loaded successfully.");
});
loadRoutineTypes().then(() => {});