// routinesreader.js
import { collection, doc, query, where, updateDoc, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { db, auth } from "../firebase_config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getCollectionCached, getDocCached } from "./cacheLoad.js";
import { getUserProfile } from "../GetDB/getUser.js";
import Swal from "https://cdn.skypack.dev/sweetalert2";
import { routinesLanguage } from "../Language/routinesLanguage.js";
import { translateText } from "../translate.js";

document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos del DOM ---
    const typeSelector    = document.getElementById("typeSelector");
    const routineSelector = document.getElementById("routineSelector");
    const globalSearch    = document.getElementById("globalSearch");
    const searchResults   = document.getElementById("searchResults");
    const titleEl         = document.getElementById("title");
    const infoEl          = document.getElementById("info");
    const durationEl      = document.getElementById("durationContainer");
    const restEl          = document.getElementById("restContainer");
    const exercisesEl     = document.getElementById("exercises");

    const feedbackContainer = document.createElement("div");
    feedbackContainer.id = "feedbackContainer";
    const feedbackList = document.createElement("div");
    feedbackList.id = "feedbackList";

    // --- Estado interno ---
    let language = localStorage.getItem("language") || "spanish";
    let allRoutines = [];
    let routineFavorites = [];
    let isSuperior = false;
    let currentRoutineId = null;
    let selectedRating = 0;

    // Inicializa textos estáticos
    routinesLanguage();

    // --- Función: Carga de TIPOS de rutina ---
    async function loadRoutineTypes() {
        typeSelector.innerHTML = '';
        const setTypes = new Set(
            allRoutines.filter(r => !r.isExclusive).map(r => r.routineType)
        );
        const types = Array.from(setTypes).sort();

        // Opción por defecto
        const defaultLabel = language === "english" ? "Select type" : "Selecciona tipo";
        typeSelector.appendChild(new Option(defaultLabel, '', true, true));
        typeSelector.disabled = false;

        // Agrega cada tipo
        for (const type of types) {
            const text = language === "english"
                ? type.toUpperCase()
                : await translateText(type.toUpperCase(), "es");
            typeSelector.appendChild(new Option(text, type));
        }

        // Opción de Favoritos
        const favLabel = language === "english" ? "FAVORITES" : "FAVORITOS";
        typeSelector.appendChild(new Option(favLabel, "favorites"));

        // Opción de Exclusivas si el usuario es miembro superior
        if (isSuperior) {
            const exLabel = language === "english" ? "EXCLUSIVE" : "EXCLUSIVAS";
            typeSelector.appendChild(new Option(exLabel, "exclusive"));
        }
    }

    // --- Función: Carga de NOMBRES según tipo seleccionado ---
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
                const label = r.isExclusive ? `${nameText} ⭐` : nameText;
                // ← IMPORTANTE: el value es el ID de la rutina
                routineSelector.appendChild(new Option(label, r.id));
            }
        }
    }

    // --- Función: Carga y renderizado de una rutina concreta ---
    async function loadRoutine(id) {
        currentRoutineId = id;

        // Intento caché de rutinas estándar
        let rDoc = await getDocCached("routines", id);
        let fromEx = false;
        // Si no existe y es usuario superior, intento exclusivas
        if (!rDoc && isSuperior) {
            rDoc = await getDocCached("exclusive_routines", id);
            fromEx = !!rDoc;
        }

        // Caída de seguridad: buscada en allRoutines
        const r = rDoc || allRoutines.find(x => x.id === id);
        if (!r) {
            return Swal.fire(
                language === "english" ? "Routine not found" : "Rutina no encontrada"
            );
        }
        r.isExclusive = fromEx;

        // --- Render TÍTULO e INFO ---
        titleEl.innerHTML = '';
        infoEl.innerHTML = '';
        titleEl.innerText = language === "english" ? r.name : await translateText(r.name, "es");

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

        // --- Render DURACIÓN y DESCANSO ---
        durationEl.innerText = language === "english"
            ? `Duration: ${r.duration || '—'}`
            : await translateText(`Duration: ${r.duration || '—'}`, "es");
        restEl.innerText = language === "english"
            ? `Rest: ${r.rest || '—'} mins`
            : await translateText(`Rest: ${r.rest || '—'} mins`, "es");

        // --- Botones de acción (usar / favoritos) ---
        // Elimino botones previos
        const oldUse = titleEl.querySelector('.create-from-predef-btn');
        if (oldUse) oldUse.remove();
        const oldFav = titleEl.querySelector('.fav-btn');
        if (oldFav) oldFav.remove();

        // Botón "Crear desde esta" para rutinas no exclusivas
        if (!r.isExclusive) {
            const useBtn = document.createElement('button');
            useBtn.textContent = language === "english" ? 'Create from this' : 'Crear desde esta';
            useBtn.className = 'create-from-predef-btn';
            useBtn.addEventListener('click', () => {
                if (!auth.currentUser) {
                    return Swal.fire({
                        title: language === "english"
                            ? 'Log in to use this feature.'
                            : 'Inicia sesión para usar esta función.',
                        icon: 'warning'
                    });
                }
                window.location.href = `../Pages/exercise_selector.html?fromPredefined=${id}`;
            });
            titleEl.appendChild(useBtn);
        }

        // Botón de favorito / desfavorito
        const favBtn = document.createElement('button');
        favBtn.textContent = routineFavorites.includes(id) ? '❤️' : '🤍';
        favBtn.className = 'fav-btn';
        favBtn.addEventListener('click', async () => {
            if (!auth.currentUser) {
                return Swal.fire(
                    language === "english"
                        ? 'Log in to use favorites'
                        : 'Inicia sesión para favoritos'
                );
            }
            const uid = auth.currentUser.uid;
            routineFavorites = routineFavorites.includes(id)
                ? routineFavorites.filter(x => x !== id)
                : [...routineFavorites, id];
            await updateDoc(doc(db, 'user_app', uid), { routineFavorites });
            favBtn.textContent = routineFavorites.includes(id) ? '❤️' : '🤍';
        });
        titleEl.appendChild(favBtn);

        // --- Render EJERCICIOS ---
        exercisesEl.innerHTML = '';
        r.exercises.forEach((ex, i) => {
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
        });

        // --- Sección de FEEDBACK ---
        feedbackContainer.innerHTML = `
            <h3>${language === "english"
            ? 'Rate and comment this routine'
            : 'Valora y comenta esta rutina'}</h3>
            <div id="starRating">
              <span class="star" data-value="1">☆</span>
              <span class="star" data-value="2">☆</span>
              <span class="star" data-value="3">☆</span>
              <span class="star" data-value="4">☆</span>
              <span class="star" data-value="5">☆</span>
            </div>
            <textarea id="commentBox" placeholder="${language === "english"
            ? 'Write your comment...'
            : 'Escribe tu comentario...'}" rows="3"></textarea>
            <button id="submitFeedback">${language === "english"
            ? 'Send feedback'
            : 'Envía feedback'}</button>
        `;
        feedbackContainer.appendChild(feedbackList);
        exercisesEl.parentNode.appendChild(feedbackContainer);

        // Estrellas interactivas
        document.querySelectorAll('#starRating .star').forEach(star => {
            star.addEventListener('click', () => {
                selectedRating = +star.dataset.value;
                document.querySelectorAll('#starRating .star').forEach(s =>
                    s.textContent = (+s.dataset.value <= selectedRating ? '★' : '☆')
                );
            });
        });

        // Botón de envío de feedback
        document.getElementById('submitFeedback').onclick = async () => {
            if (!auth.currentUser) {
                return Swal.fire(
                    language === "english"
                        ? 'Log in first to comment'
                        : 'Inicia sesión primero'
                );
            }
            if (selectedRating === 0) {
                return Swal.fire(
                    language === "english"
                        ? 'Please select a rating'
                        : 'Por favor selecciona una valoración'
                );
            }
            const commentTxt = document.getElementById('commentBox').value.trim();
            if (!commentTxt) {
                return Swal.fire(
                    language === "english"
                        ? 'Write a comment'
                        : 'Escribe un comentario'
                );
            }

            // Compruebo si ya existe feedback de este usuario para esta rutina
            const fbQuery = query(
                collection(db, 'routines_feedback'),
                where('routineId', '==', currentRoutineId),
                where('uid', '==', auth.currentUser.uid)
            );
            const fbSnap = await getDocs(fbQuery);

            if (fbSnap.empty) {
                await addDoc(collection(db, 'routines_feedback'), {
                    routineId: currentRoutineId,
                    uid: auth.currentUser.uid,
                    rating: selectedRating,
                    comment: commentTxt,
                    timestamp: Date.now()
                });
            } else {
                const existing = fbSnap.docs[0];
                await updateDoc(
                    doc(db, 'routines_feedback', existing.id),
                    { rating: selectedRating, comment: commentTxt, timestamp: Date.now() }
                );
            }

            Swal.fire(
                language === "english"
                    ? 'Thanks for your feedback!'
                    : '¡Gracias por tu feedback!'
            );
            // Limpio formulario
            document.getElementById('commentBox').value = '';
            selectedRating = 0;
            document.querySelectorAll('#starRating .star')
                .forEach(s => s.textContent = '☆');

            await loadFeedback(currentRoutineId);
        };

        // Cargo feedback existente
        await loadFeedback(id);
    }

    // --- Función: Carga de FEEDBACK de Firebase ---
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

    // --- Búsqueda global por texto ---
    globalSearch.addEventListener('input', async () => {
        const q = globalSearch.value.trim().toLowerCase();
        searchResults.innerHTML = '';
        const defaultLbl = language === "english" ? 'Results' : 'Resultados';
        searchResults.appendChild(new Option(defaultLbl, '', true, true));

        let filtered;
        if (language === "english") {
            filtered = allRoutines.filter(r =>
                (r.name + ' ' + r.routineType + ' ' + r.description)
                    .toLowerCase()
                    .includes(q)
            );
        } else {
            filtered = allRoutines.filter(r =>
                (r.name_es + ' ' + r.routineType_es + ' ' + r.description_es)
                    .toLowerCase()
                    .includes(q)
            );
        }

        if (!filtered.length) {
            const noMsg = language === "english"
                ? 'No matches found'
                : 'No se encontraron coincidencias';
            const opt = document.createElement('option');
            opt.disabled = true;
            opt.textContent = noMsg;
            searchResults.appendChild(opt);
        } else {
            filtered.forEach(r => {
                const typeLbl = language === "english" ? r.routineType : r.routineType_es;
                const nameLbl = language === "english" ? r.name : r.name_es;
                searchResults.appendChild(
                    new Option(`[${typeLbl}] ${nameLbl}`, r.id)
                );
            });
        }
    });

    // --- Listeners de UI ---
    typeSelector.addEventListener('change', () => loadRoutineNames(typeSelector.value));
    routineSelector.addEventListener('change', () => loadRoutine(routineSelector.value));
    searchResults.addEventListener('change', () => loadRoutine(searchResults.value));

    // --- Inicialización tras autenticación ---
    onAuthStateChanged(auth, async user => {
        if (!user) return;

        // Carga perfil usuario
        const profile = await getUserProfile();
        routineFavorites = profile.routineFavorites || [];
        isSuperior = profile.tipo_suscripcion === 'miembro superior';

        // Carga colección de rutinas
        const base = await getCollectionCached('routines');
        allRoutines = base.map(r => ({ ...r, isExclusive: false }));
        if (isSuperior) {
            const exclusives = await getCollectionCached('exclusive_routines');
            exclusives.forEach(r => r.isExclusive = true);
            allRoutines = allRoutines.concat(exclusives);
        }

        // Traducciones (solo si idioma español)
        if (language === "spanish") {
            await Promise.all(allRoutines.map(async r => {
                r.name_es = await translateText(r.name, "es");
                r.routineType_es = await translateText(r.routineType, "es");
                r.description_es = await translateText(r.description, "es");
            }));
        }

        // 1) Cargo tipos en selector
        await loadRoutineTypes();

        // 2) Gestiono parámetro ?routine= para preselección automática ← NUEVO
        const params   = new URLSearchParams(window.location.search);
        const presetId = params.get("routine");
        if (presetId) {
            const target = allRoutines.find(r => r.id === presetId);
            if (target) {
                // Determino el tipo de selector (exclusive / favorites / tipo normal)
                const presetType = target.isExclusive
                    ? "exclusive"
                    : (routineFavorites.includes(presetId)
                            ? "favorites"
                            : target.routineType
                    );
                // Preselecciono tipo y cargo nombres
                typeSelector.value = presetType;
                await loadRoutineNames(presetType);
                // Preselecciono rutina y disparo carga
                routineSelector.value = presetId;
                routineSelector.dispatchEvent(new Event("change"));
            }
        }
        // ← fin de la lógica de preselección de rutina
    });
});
