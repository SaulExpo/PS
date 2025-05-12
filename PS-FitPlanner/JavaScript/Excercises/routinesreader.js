import {
    collection, getDocs, getDoc, doc,
    query, where, updateDoc, setDoc
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { db, auth } from "../firebase_config.js";
import { onAuthStateChanged }
    from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const routinesCol      = collection(db, "routines");
const typeSelector     = document.getElementById("typeSelector");
const routineSelector  = document.getElementById("routineSelector");
const globalSearch     = document.getElementById("globalSearch");
const searchResults    = document.getElementById("searchResults");
const titleEl          = document.getElementById("title");
const infoEl           = document.getElementById("info");
const durationEl       = document.getElementById("durationContainer");
const restEl           = document.getElementById("restContainer");
const exercisesEl      = document.getElementById("exercises");

let allRoutines       = [];
let routineFavorites  = [];

onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    const uid     = user.uid;
    const userRef = doc(db, "user_app", uid);
    const snap    = await getDoc(userRef);

    if (snap.exists() && Array.isArray(snap.data().routineFavorites)) {
        routineFavorites = snap.data().routineFavorites;
    } else {
        await setDoc(userRef, { routineFavorites: [] }, { merge: true });
        routineFavorites = [];
    }
});

async function loadAllRoutines() {
    const snap = await getDocs(routinesCol);
    allRoutines = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    console.log("Loaded routines:", allRoutines.length);
}

async function loadRoutineTypes() {
    const snap = await getDocs(routinesCol);
    const types = new Set(snap.docs.map(d => d.data().routineType));

    typeSelector.innerHTML =
        '<option disabled selected>Select type</option>';
    Array.from(types).sort().forEach(type => {
        typeSelector.appendChild(
            new Option(type.toUpperCase(), type)
        );
    });
    typeSelector.appendChild(
        new Option("FAVORITES", "favorites")
    );
}

async function loadRoutineNames(type) {
    routineSelector.innerHTML =
        '<option disabled selected>Select routine</option>';

    let list = [];
    if (type === "favorites") {
        list = allRoutines.filter(r =>
            routineFavorites.includes(r.id)
        );
    } else {
        const q    = query(routinesCol, where("routineType", "==", type));
        const snap = await getDocs(q);
        list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    if (list.length === 0) {
        const opt = document.createElement("option");
        opt.disabled = true;
        opt.textContent =
            type === "favorites"
                ? "No tienes rutinas favoritas"
                : "No hay rutinas de este tipo";
        routineSelector.appendChild(opt);
    } else {
        list.forEach(r => {
            routineSelector.appendChild(
                new Option(r.name, r.id)
            );
        });
    }
    routineSelector.disabled = false;
}

async function loadRoutine(id) {
    const d = await getDoc(doc(routinesCol, id));
    if (!d.exists()) {
        return alert("Rutine not found");
    }
    const r = d.data();

    titleEl.innerText = r.name;
    const favBtn = document.createElement("button");
    favBtn.textContent = routineFavorites.includes(id) ? "❤️" : "🤍";
    favBtn.style.marginLeft = "10px";
    favBtn.addEventListener("click", async () => {
        const user = auth.currentUser;
        if (!user) return alert("Log in to use favorites");
        const uid = user.uid;

        routineFavorites = routineFavorites.includes(id)
            ? routineFavorites.filter(x => x !== id)
            : [...routineFavorites, id];

        await updateDoc(doc(db, "user_app", uid), { routineFavorites });
        favBtn.textContent = routineFavorites.includes(id) ? "❤️" : "🤍";
    });
    titleEl.appendChild(favBtn);

    infoEl.innerText        = r.description;
    durationEl.textContent  = `Duration: ${r.duration || "—"}`;
    restEl.textContent      = `Rest during sets: ${r.rest || "—"} minutes`;

    exercisesEl.innerHTML = "";
    r.exercises.forEach((ex, i) => {
        const wrapper = document.createElement("div");
        wrapper.id = `exercise_${i}`;
        exercisesEl.appendChild(wrapper);
        fetch("../Templates/info_exercise.html")
            .then(res => res.text())
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
    searchResults.innerHTML =
        '<option disabled selected>Results will appear here</option>';
    const filtered = allRoutines.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.routineType.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    );
    if (!filtered.length) {
        const opt = document.createElement("option");
        opt.disabled = true;
        opt.textContent = "No se encontraron coincidencias";
        searchResults.appendChild(opt);
    } else {
        filtered.forEach(r => {
            searchResults.appendChild(
                new Option(`[${r.routineType}] ${r.name}`, r.id)
            );
        });
    }
});

typeSelector.addEventListener("change", () =>
    loadRoutineNames(typeSelector.value)
);
routineSelector.addEventListener("change", () =>
    loadRoutine(routineSelector.value)
);
searchResults.addEventListener("change", () =>
    loadRoutine(searchResults.value)
);

loadAllRoutines().then(loadRoutineTypes);
