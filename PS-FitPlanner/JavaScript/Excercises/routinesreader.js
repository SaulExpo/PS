import {collection, doc, query, where, updateDoc, setDoc, addDoc, getDocs} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { db, auth } from "../firebase_config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {getCollectionCached, getDocCached} from "./cacheLoad.js";
import Swal from "https://cdn.skypack.dev/sweetalert2";
import {routinesLanguage} from "../Language/routinesLanguage.js";
import {translateText} from "../translate.js";

const typeSelector    = document.getElementById("typeSelector");
const routineSelector = document.getElementById("routineSelector");
const globalSearch    = document.getElementById("globalSearch");
const searchResults   = document.getElementById("searchResults");
const titleEl         = document.getElementById("title");
const infoEl          = document.getElementById("info");
const durationEl      = document.getElementById("duration");
const restEl          = document.getElementById("rest");
const exercisesEl     = document.getElementById("exercises");
let language = localStorage.getItem("language");

routinesLanguage()

// Contenedor para feedback y lista de comentarios
const feedbackContainer = document.createElement("div");
feedbackContainer.id = "feedbackContainer";
const feedbackList      = document.createElement("div");
feedbackList.id = "feedbackList";

let allRoutines       = [];
let routineFavorites  = [];
let currentRoutineId  = null;
let selectedRating    = 0;

async function loadRoutineTypes() {
    const types = [...new Set(allRoutines.map(r => r.routineType))];
    if (language === "english") {
        typeSelector.innerHTML = '<option id="option1" disabled selected>Select type</option>';
        types.sort().forEach(type =>
            typeSelector.appendChild(new Option(type.toUpperCase(), type))
        );
        typeSelector.appendChild(new Option("FAVORITES", "favorites"));
    } else {
        typeSelector.innerHTML = '<option id="option1" disabled selected>Selecciona tipo</option>';
        for (const type of types.sort()) {
            typeSelector.appendChild(new Option(await translateText(type.toUpperCase(), "es"), type));
        }
        typeSelector.appendChild(new Option("FAVORITOS", "favorites"));
    }
    types.sort().forEach(type =>
        typeSelector.appendChild(new Option(type.toUpperCase(), type))
    );
    typeSelector.disabled = false;
}

async function loadRoutineNames(type) {
    routineSelector.innerHTML = '<option id="option2" disabled selected>Select routine</option>';
    let list = [];
    if (type === "favorites") {
        list = allRoutines.filter(r => routineFavorites.includes(r.id));
    } else {
        list = allRoutines.filter(r => r.routineType === type);
    }
    if (!list.length) {
        const opt = document.createElement("option");
        opt.disabled = true;
        opt.textContent = type === "favorites"
            ? "No tienes rutinas favoritas"
            : "No hay rutinas de este tipo";
        routineSelector.appendChild(opt);
    } else {
        routineSelector.innerHTML = "";
        if (language === "english") {
            list.forEach(r => {
                routineSelector.appendChild(new Option(r.name, r.id));
            });
        } else {
            const translatedNames = await Promise.all(list.map(r => translateText(r.name, "es")));
            for (let i = 0; i < list.length; i++) {
                routineSelector.appendChild(new Option(translatedNames[i], list[i].id));
            }
        }
    }
    routineSelector.disabled = false;
    routinesLanguage()

}

async function loadRoutine(id) {
    currentRoutineId = id;
    const docData = await getDocCached("routines", id);
    const r = docData || allRoutines.find(x => x.id === id);
    if (!r) return Swal.fire("Rutina no encontrada");

    if (language === "english") {
        titleEl.innerText      = r.name;
        infoEl.innerText       = r.description;
        durationEl.textContent = `Duration: ${r.duration || "—"}`;
        restEl.textContent     = `Rest during sets: ${r.rest || "—"} minutes`;
    } else {
        titleEl.innerText      = await translateText(r.name, "es");
        infoEl.innerText       = await translateText(r.description, "es");
        durationEl.textContent = await translateText(`Duration: ${r.duration || "—"}`, "es");
        restEl.textContent     = await translateText(`Rest during sets: ${r.rest || "—"} minutes`, "es");
    }


    const existingFav = titleEl.querySelector("button");
    if (existingFav) existingFav.remove();
    const favBtn = document.createElement("button");
    favBtn.textContent = routineFavorites.includes(id) ? "❤️" : "🤍";
    favBtn.style.marginLeft = "10px";
    favBtn.addEventListener("click", async () => {
        if (!auth.currentUser) return Swal.fire("Log in to use favorites");
        const uid = auth.currentUser.uid;
        routineFavorites = routineFavorites.includes(id)
            ? routineFavorites.filter(x => x !== id)
            : [...routineFavorites, id];
        await updateDoc(doc(db, "user_app", uid), { routineFavorites });
        favBtn.textContent = routineFavorites.includes(id) ? "❤️" : "🤍";
    });
    titleEl.appendChild(favBtn);
    let name
    let rate
    let comment
    let sendfeedback
    let log
    let write
    let thanks
    if (language === "english") {
        rate ="Rate and comment this routine"
        comment = "Write your comment..."
        sendfeedback = "Send feedback"
        log = "Log in first to comment"
        write = "Write a comment"
        thanks = "Thanks for your feedback!"
    } else {
        rate = "Valora y comenta esta rutina"
        comment = "Escribe tu comentario..."
        sendfeedback = "Envía feedback"
        log = "Inicia sesión para comentar"
        write = "Escribe un comentario"
        thanks = "Gracias por tu feedback!"
    }
    exercisesEl.innerHTML = "";
    for (const ex of r.exercises) {
        const i = r.exercises.indexOf(ex);
        if (language === "english") {
            name = ex.name
        }else {
            name=await translateText(ex.name, "es");
        }
        const wrapper = document.createElement("div");
        wrapper.id = `exercise_${i}`;
        exercisesEl.appendChild(wrapper);
        fetch("../Templates/info_exercise.html")
            .then(res => res.text())
            .then(async tpl => {
                wrapper.innerHTML = tpl;
                wrapper.querySelector("#name_exercise").innerHTML =
                    `<a href="./exercise_detail.html?name=${encodeURIComponent(ex.name)}">
            ${name}
          </a>`;
                wrapper.querySelector("#reps").innerText = ex.reps;
            });
    }

    feedbackContainer.innerHTML = `
    <h3>${rate}</h3>
    <div id="starRating">
      <span class="star" data-value="1">☆</span>
      <span class="star" data-value="2">☆</span>
      <span class="star" data-value="3">☆</span>
      <span class="star" data-value="4">☆</span>
      <span class="star" data-value="5">☆</span>
    </div>
    <textarea id="commentBox" placeholder="${comment}" rows="3"></textarea>
    <button id="submitFeedback">${sendfeedback}</button>
  `;

    feedbackContainer.appendChild(feedbackList);
    exercisesEl.parentNode.appendChild(feedbackContainer);

    // Handlers de estrellas
    document.querySelectorAll("#starRating .star").forEach(star => {
        star.addEventListener("click", () => {
            selectedRating = +star.dataset.value;
            document.querySelectorAll("#starRating .star").forEach(s =>
                s.textContent = +s.dataset.value <= selectedRating ? "★" : "☆"
            );
        });
    });

    document.getElementById("submitFeedback").onclick = async () => {
        const comment = document.getElementById("commentBox").value.trim();
        if (!auth.currentUser) return Swal.fire(log);
        if (!comment) return Swal.fire(write);
        try {
            await addDoc(collection(db, "routines_feedback"), {
                routineId: currentRoutineId,
                uid:       auth.currentUser.uid,
                rating:    selectedRating,
                comment,
                timestamp: Date.now()
            });
            Swal.fire(thanks);
            document.getElementById("commentBox").value = "";
            document.querySelectorAll("#starRating .star").forEach(s => s.textContent = "☆");
            selectedRating = 0;
            loadFeedback(currentRoutineId);
        } catch (err) {
            console.error(err);
            Swal.fire("Error sending feedback");
        }
    };

    loadFeedback(id);
}

async function loadFeedback(routineId) {
    const feedbackSnap = await getDocs(
        query(
            collection(db, "routines_feedback"),
            where("routineId", "==", routineId)
        )
    );


    const feedbacks = feedbackSnap.docs
        .map(d => d.data())
        .sort((a, b) => b.timestamp - a.timestamp);
    feedbackList.innerHTML = "";
    if (!feedbacks.length) {
        let nofeedback
        if (language === "english") {
            nofeedback = "No feedbak yet"
        }else{
            nofeedback = "Aun no hay feedback"
        }
        feedbackList.innerHTML = nofeedback;
        return;
    }
    feedbacks.forEach(f => {
        const div = document.createElement("div");
        div.className = "feedback-item";
        const stars = '★'.repeat(f.rating) + '☆'.repeat(5 - f.rating);
        const date = new Date(f.timestamp).toLocaleString();
        div.innerHTML = `
      <p><strong>${stars}</strong> &nbsp; <em>${date}</em></p>
      <p>${f.comment}</p>
      <hr>
    `;
        feedbackList.appendChild(div);
    });
}

globalSearch.addEventListener("input", async () => {
    const q = globalSearch.value.trim().toLowerCase();
    searchResults.innerHTML = '<option id="option3" disabled selected></option>';
    const filtered = allRoutines.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.routineType.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    );
    if (!filtered.length) {
        const opt = document.createElement("option");
        opt.disabled = true;
        if (language === "english") {
            opt.textContent = "No matches found";
        } else {
            opt.textContent = "No se encontraron coincidencias";
        }
        searchResults.appendChild(opt);
    } else {
        if (language === "english") {
            for (const r of filtered) {
                searchResults.appendChild(new Option(`[${r.routineType}] ${r.name}`, r.id));
            }
        } else {
            const routineTypes = filtered.map(r => translateText(r.routineType, "es"));
            const names = filtered.map(r => translateText(r.name, "es"));

            const translatedRoutineTypes = await Promise.all(routineTypes);
            const translatedNames = await Promise.all(names);

            for (let i = 0; i < filtered.length; i++) {
                searchResults.appendChild(new Option(`[${translatedRoutineTypes[i]}] ${translatedNames[i]}`, filtered[i].id));
            }
        }
    }
    routinesLanguage()

});

typeSelector.addEventListener("change", () => loadRoutineNames(typeSelector.value));
routineSelector.addEventListener("change", () => loadRoutine(routineSelector.value));
searchResults.addEventListener("change", () => loadRoutine(searchResults.value));

onAuthStateChanged(auth, async user => {
    if (!user) return;
    const uid     = user.uid;
    const userSnap = await getDocCached("user_app", uid);
    routineFavorites = userSnap?.routineFavorites || [];

    allRoutines = await getCollectionCached("routines");
    loadRoutineTypes();

});
