import { collection, doc, query, where, updateDoc, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { db, auth } from "../firebase_config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getCollectionCached, getDocCached } from "./cacheLoad.js";
import { getUserProfile } from "../GetDB/getUser.js";
import Swal from "https://cdn.skypack.dev/sweetalert2";
import { routinesLanguage } from "../Language/routinesLanguage.js";
import { translateText } from "../translate.js";

// Elementos del DOM
const typeSelector    = document.getElementById("typeSelector");
const routineSelector = document.getElementById("routineSelector");
const globalSearch    = document.getElementById("globalSearch");
const searchResults   = document.getElementById("searchResults");
const titleEl         = document.getElementById("title");
const infoEl          = document.getElementById("info");
const durationEl      = document.getElementById("durationContainer");
const restEl          = document.getElementById("restContainer");
const exercisesEl     = document.getElementById("exercises");

// Feedback UI container
const feedbackContainer = document.createElement("div");
feedbackContainer.id = "feedbackContainer";
const feedbackList = document.createElement("div");
feedbackList.id = "feedbackList";

// Estado global
let language = localStorage.getItem("language") || "spanish";
let allRoutines = [];
let routineFavorites = [];
let isSuperior = false;
let currentRoutineId = null;
let selectedRating = 0;

// Inicializar idioma estático
routinesLanguage();

// Carga de tipos de rutina
async function loadRoutineTypes() {
    // Limpiar y repoblar
    typeSelector.innerHTML = '';
    const setTypes = new Set(
        allRoutines.filter(r => !r.isExclusive).map(r => r.routineType)
    );
    const types = Array.from(setTypes).sort();

    // Opción por defecto
    const defaultLabel = language === "english" ? "Select type" : "Selecciona tipo";
    typeSelector.appendChild(new Option(defaultLabel, '', true, true));
    typeSelector.disabled = false;

    // Opciones de tipos
    for (const type of types) {
        const text = language === "english"
            ? type.toUpperCase()
            : await translateText(type.toUpperCase(), "es");
        typeSelector.appendChild(new Option(text, type));
    }
    // Favoritos y exclusivo
    const favLabel = language === "english" ? "FAVORITES" : "FAVORITOS";
    typeSelector.appendChild(new Option(favLabel, "favorites"));
    if (isSuperior) {
        const exLabel = language === "english" ? "EXCLUSIVE" : "EXCLUSIVAS";
        typeSelector.appendChild(new Option(exLabel, "exclusive"));
    }
}

// Carga de nombres según tipo
async function loadRoutineNames(type) {
    routineSelector.innerHTML = '';
    const defaultLabel = language === "english" ? "Select routine" : "Selecciona rutina";
    routineSelector.appendChild(new Option(defaultLabel, '', true, true));
    routineSelector.disabled = false;

    let list = [];
    if (type === "favorites") {
        list = allRoutines.filter(r => routineFavorites.includes(r.id));
    } else if (type === "exclusive") {
        list = allRoutines.filter(r => r.isExclusive);
    } else {
        list = allRoutines.filter(r => r.routineType === type && !r.isExclusive);
    }

    if (!list.length) {
        const msg = type === "favorites"
            ? (language === "english" ? "No favorites yet" : "No tienes rutinas favoritas")
            : (type === "exclusive"
                    ? (language === "english" ? "No exclusive routines" : "No hay rutinas exclusivas")
                    : (language === "english" ? "No routines of this type" : "No hay rutinas de este tipo")
            );
        const opt = document.createElement("option");
        opt.disabled = true;
        opt.textContent = msg;
        routineSelector.appendChild(opt);
    } else {
        for (const r of list) {
            const nameText = language === "english"
                ? r.name
                : await translateText(r.name, "es");
            const label = r.isExclusive
                ? `${nameText} ⭐`
                : nameText;
            routineSelector.appendChild(new Option(label, r.id));
        }
    }
}

// Carga y render de rutina
async function loadRoutine(id) {
    currentRoutineId = id;
    // Obtener documento: normal o exclusivo
    let rDoc = await getDocCached("routines", id);
    let fromEx = false;
    if (!rDoc && isSuperior) {
        rDoc = await getDocCached("exclusive_routines", id);
        fromEx = !!rDoc;
    }
    const r = rDoc || allRoutines.find(x => x.id === id);
    if (!r) return Swal.fire(
        language === "english" ? "Routine not found" : "Rutina no encontrada"
    );
    r.isExclusive = fromEx;

    // Título e info
    titleEl.innerHTML = language === "english"
        ? r.name
        : await translateText(r.name, "es");
    if (r.isExclusive && r.exclusiveDescription) {
        const desc = document.createElement("p");
        desc.className = "exclusive-desc";
        desc.innerText = language === "english"
            ? r.exclusiveDescription
            : await translateText(r.exclusiveDescription, "es");
        infoEl.appendChild(desc);
    } else {
        infoEl.innerText = language === "english"
            ? r.description
            : await translateText(r.description, "es");
    }

    durationEl.textContent = language === "english"
        ? `Duration: ${r.duration || '—'}`
        : await translateText(`Duration: ${r.duration || '—'}`, "es");
    restEl.textContent = language === "english"
        ? `Rest: ${r.rest || '—'} mins`
        : await translateText(`Rest: ${r.rest || '—'} mins`, "es");

    // Botones: crear desde predef, favoritos
    const oldUse = titleEl.querySelector('.create-from-predef-btn');
    if (oldUse) oldUse.remove();
    const oldFav = titleEl.querySelector('.fav-btn');
    if (oldFav) oldFav.remove();

    if (!r.isExclusive) {
        const useBtn = document.createElement('button');
        useBtn.textContent = language === "english"
            ? 'Create from this'
            : 'Crear desde esta';
        useBtn.className = 'create-from-predef-btn';
        useBtn.style.marginLeft = '10px';
        useBtn.addEventListener('click', () => {
            if (!auth.currentUser) return Swal.fire({
                title: language === "english" ? 'Log in to use this feature.' : 'Inicia sesión para usar esta función.',
                icon: 'warning'
            });
            window.location.href = `../Pages/exercise_selector.html?fromPredefined=${id}`;
        });
        titleEl.appendChild(useBtn);
    }

    const favBtn = document.createElement('button');
    favBtn.textContent = routineFavorites.includes(id) ? '❤️' : '🤍';
    favBtn.className = 'fav-btn';
    favBtn.style.marginLeft = '10px';
    favBtn.addEventListener('click', async () => {
        if (!auth.currentUser) return Swal.fire(
            language === "english" ? 'Log in to use favorites' : 'Inicia sesión para favoritos'
        );
        const uid = auth.currentUser.uid;
        routineFavorites = routineFavorites.includes(id)
            ? routineFavorites.filter(x => x !== id)
            : [...routineFavorites, id];
        await updateDoc(doc(db, 'user_app', uid), { routineFavorites });
        favBtn.textContent = routineFavorites.includes(id) ? '❤️' : '🤍';
    });
    titleEl.appendChild(favBtn);

    // Render ejercicios
    exercisesEl.innerHTML = '';
    for (let i = 0; i < r.exercises.length; i++) {
        const ex = r.exercises[i];
        const wrapper = document.createElement('div');
        wrapper.id = `exercise_${i}`;
        exercisesEl.appendChild(wrapper);
        fetch('../Templates/info_exercise.html')
            .then(res => res.text())
            .then(async tpl => {
                wrapper.innerHTML = tpl;
                const nameTranslated = language === "english"
                    ? ex.name
                    : await translateText(ex.name, "es");
                wrapper.querySelector('#name_exercise').innerHTML =
                    `<a href="./exercise_detail.html?name=${encodeURIComponent(ex.name)}">${nameTranslated}</a>`;
                wrapper.querySelector('#reps').innerText = ex.reps;
            });
    }

    // Feedback
    feedbackContainer.innerHTML = `
      <h3>${language === "english" ? 'Rate and comment this routine' : 'Valora y comenta esta rutina'}</h3>
      <div id="starRating">
        <span class="star" data-value="1">☆</span>
        <span class="star" data-value="2">☆</span>
        <span class="star" data-value="3">☆</span>
        <span class="star" data-value="4">☆</span>
        <span class="star" data-value="5">☆</span>
      </div>
      <textarea id="commentBox" placeholder="${language === "english" ? 'Write your comment...' : 'Escribe tu comentario...'}" rows="3"></textarea>
      <button id="submitFeedback">${language === "english" ? 'Send feedback' : 'Envía feedback'}</button>
    `;
    feedbackContainer.appendChild(feedbackList);
    exercisesEl.parentNode.appendChild(feedbackContainer);

    document.querySelectorAll('#starRating .star').forEach(star => {
        star.addEventListener('click', () => {
            selectedRating = +star.dataset.value;
            document.querySelectorAll('#starRating .star').forEach(s =>
                s.textContent = (+s.dataset.value <= selectedRating ? '★' : '☆')
            );
        });
    });
    document.getElementById('submitFeedback').onclick = async () => {
        const commentTxt = document.getElementById('commentBox').value.trim();
        if (!auth.currentUser) return Swal.fire(
            language === "english" ? 'Log in first to comment' : 'Inicia sesión primero'
        );
        if (!commentTxt) return Swal.fire(
            language === "english" ? 'Write a comment' : 'Escribe un comentario'
        );
        await addDoc(collection(db, 'routines_feedback'), {
            routineId: currentRoutineId,
            uid: auth.currentUser.uid,
            rating: selectedRating,
            comment: commentTxt,
            timestamp: Date.now()
        });
        Swal.fire(
            language === "english" ? 'Thanks for your feedback!' : 'Gracias por tu feedback!'
        );
        document.getElementById('commentBox').value = '';
        document.querySelectorAll('#starRating .star').forEach(s => s.textContent = '☆');
        selectedRating = 0;
        loadFeedback(currentRoutineId);
    };

    loadFeedback(id);
}

// Carga de feedback
async function loadFeedback(routineId) {
    const snap = await getDocs(
        query(collection(db, 'routines_feedback'), where('routineId', '==', routineId))
    );
    const feedbacks = snap.docs.map(d => d.data())
        .sort((a, b) => b.timestamp - a.timestamp);
    feedbackList.innerHTML = '';
    if (!feedbacks.length) {
        const msg = language === "english" ? 'No feedback yet' : 'Aún no hay feedback';
        feedbackList.innerHTML = `<p>${msg}</p>`;
        return;
    }
    feedbacks.forEach(f => {
        const div = document.createElement('div');
        div.className = 'feedback-item';
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

// Búsqueda global
globalSearch.addEventListener('input', async () => {
    const q = globalSearch.value.trim().toLowerCase();
    searchResults.innerHTML = '';
    const defaultLbl = language === "english" ? 'Results' : 'Resultados';
    searchResults.appendChild(new Option(defaultLbl, '', true, true));

    const filtered = allRoutines.filter(r =>
        (r.name + ' ' + r.routineType + ' ' + r.description).toLowerCase().includes(q)
    );
    if (!filtered.length) {
        const noMsg = language === "english" ? 'No matches found' : 'No se encontraron coincidencias';
        const opt = document.createElement('option');
        opt.disabled = true;
        opt.textContent = noMsg;
        searchResults.appendChild(opt);
    } else {
        for (const r of filtered) {
            const typeLbl = language === "english"
                ? r.routineType
                : await translateText(r.routineType, "es");
            const nameLbl = language === "english"
                ? r.name
                : await translateText(r.name, "es");
            searchResults.appendChild(new Option(
                `[${typeLbl}] ${nameLbl}`, r.id
            ));
        }
    }
    routinesLanguage();
});

// Listeners de UI
typeSelector.addEventListener('change', () => loadRoutineNames(typeSelector.value));
routineSelector.addEventListener('change', () => loadRoutine(routineSelector.value));
searchResults.addEventListener('change', () => loadRoutine(searchResults.value));

// Inicialización tras auth
onAuthStateChanged(auth, async user => {
    if (!user) return;
    const uid = user.uid;
    const profile = await getUserProfile();
    routineFavorites = profile.routineFavorites || [];
    isSuperior = profile.tipo_suscripcion === 'miembro superior';

    // Cargar rutinas y exclusivas
    const base = await getCollectionCached('routines');
    allRoutines = base.map(r => ({ ...r, isExclusive: false }));
    if (isSuperior) {
        const exclusives = await getCollectionCached('exclusive_routines');
        exclusives.forEach(r => r.isExclusive = true);
        allRoutines = allRoutines.concat(exclusives);
    }

    // Poblado inicial
    await loadRoutineTypes();
});
