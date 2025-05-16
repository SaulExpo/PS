import {
    collection,
    doc,
    query,
    where,
    updateDoc,
    addDoc,
    getDocs
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { db, auth } from "../firebase_config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getCollectionCached, getDocCached } from "./cacheLoad.js";
import { getUserProfile } from "../GetDB/getUser.js";
import Swal from "https://cdn.skypack.dev/sweetalert2";

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
const feedbackList      = document.createElement("div");
feedbackList.id = "feedbackList";

let allRoutines       = [];
let routineFavorites  = [];
let isSuperior        = false;   // Will be determined via subscription type
let currentRoutineId  = null;
let selectedRating    = 0;

function loadRoutineTypes() {
    const types = [...new Set(
        allRoutines.filter(r => !r.isExclusive).map(r => r.routineType)
    )];
    typeSelector.innerHTML = '<option disabled selected>Select type</option>';
    types.sort().forEach(type =>
        typeSelector.appendChild(new Option(type.toUpperCase(), type))
    );
    typeSelector.appendChild(new Option("FAVORITES", "favorites"));
    if (isSuperior) {
        typeSelector.appendChild(new Option("EXCLUSIVE", "exclusive"));
    }
    typeSelector.disabled = false;
}

async function loadRoutineNames(type) {
    routineSelector.innerHTML = '<option disabled selected>Select routine</option>';
    let list = [];
    if (type === "favorites") {
        list = allRoutines.filter(r => routineFavorites.includes(r.id));
    } else if (type === "exclusive") {
        list = allRoutines.filter(r => r.isExclusive);
    } else {
        list = allRoutines.filter(r => r.routineType === type && !r.isExclusive);
    }
    if (!list.length) {
        const opt = document.createElement("option");
        opt.disabled = true;
        opt.textContent = type === "favorites"
            ? "You don’t have favorites yet."
            : type === "exclusive"
                ? "No exclusive routines"
                : "No routines of this group";
        routineSelector.appendChild(opt);
    } else {
        list.forEach(r => {
            const label = r.name + (r.isExclusive ? ' ⭐' : '');
            routineSelector.appendChild(new Option(label, r.id));
        });
    }
    routineSelector.disabled = false;
}

async function loadRoutine(id) {
    currentRoutineId = id;
    // Determine if this is a normal or exclusive routine
    let r = null;
    let fromExclusive = false;
    const docNormal = await getDocCached("routines", id);
    if (docNormal) {
        r = docNormal;
    } else {
        const docEx = await getDocCached("exclusive_routines", id);
        if (docEx) {
            r = docEx;
            fromExclusive = true;
        }
    }
    // Fallback to allRoutines cache
    if (!r) {
        r = allRoutines.find(x => x.id === id);
        fromExclusive = r?.isExclusive || false;
    }
    if (!r) return Swal.fire("Routine not found");
    // Ensure isExclusive flag is set properly
    r.isExclusive = fromExclusive;


    titleEl.innerHTML = r.name + (r.isExclusive ? ' <span class="badge exclusive">Exclusive</span>' : '');
    infoEl.innerText = r.description;
    if (r.isExclusive && r.exclusiveDescription) {
        const desc = document.createElement('p');
        desc.className = 'exclusive-desc';
        desc.innerText = r.exclusiveDescription;
        infoEl.appendChild(desc);
    }
    durationEl.textContent = `Duration: ${r.duration || '—'}`;
    restEl.textContent     = `Rest: ${r.rest || '—'} mins`;

    // Remove existing buttons
    const oldUse = titleEl.querySelector('.create-from-predef-btn');
    if (oldUse) oldUse.remove();
    const oldFav = titleEl.querySelector('.fav-btn');
    if (oldFav) oldFav.remove();

    // Create-from-predef button (only for non-exclusive routines)
    if (!r.isExclusive) {
        const useBtn = document.createElement('button');
        useBtn.textContent = 'Create from this';
        useBtn.className = 'create-from-predef-btn';
        useBtn.style.marginLeft = '10px';
        useBtn.addEventListener('click', () => {
            if (!auth.currentUser) {
                return Swal.fire({ title: 'Log in to use this feature.', icon: 'warning' });
            }
            window.location.href = `../Pages/exercise_selector.html?fromPredefined=${id}`;
        });
        titleEl.appendChild(useBtn);
    }

    // Favorite button
    const favBtn = document.createElement('button');
    favBtn.textContent = routineFavorites.includes(id) ? '❤️' : '🤍';
    favBtn.className = 'fav-btn';
    favBtn.style.marginLeft = '10px';
    favBtn.addEventListener('click', async () => {
        if (!auth.currentUser) return Swal.fire('Log in to use favorites');
        const uid = auth.currentUser.uid;
        routineFavorites = routineFavorites.includes(id)
            ? routineFavorites.filter(x => x !== id)
            : [...routineFavorites, id];
        await updateDoc(doc(db, 'user_app', uid), { routineFavorites });
        favBtn.textContent = routineFavorites.includes(id) ? '❤️' : '🤍';
    });
    titleEl.appendChild(favBtn);

    // Exercises rendering
    exercisesEl.innerHTML = '';
    r.exercises.forEach((ex, i) => {
        const wrapper = document.createElement('div');
        wrapper.id = `exercise_${i}`;
        exercisesEl.appendChild(wrapper);
        fetch('../Templates/info_exercise.html')
            .then(res => res.text())
            .then(tpl => {
                wrapper.innerHTML = tpl;
                wrapper.querySelector('#name_exercise').innerHTML =
                    `<a href="./exercise_detail.html?name=${encodeURIComponent(ex.name)}">${ex.name}</a>`;
                wrapper.querySelector('#reps').innerText = ex.reps;
            });
    });

    // Feedback UI
    feedbackContainer.innerHTML = `
    <h3>Rate and comment this routine</h3>
    <div id="starRating">
      <span class="star" data-value="1">☆</span>
      <span class="star" data-value="2">☆</span>
      <span class="star" data-value="3">☆</span>
      <span class="star" data-value="4">☆</span>
      <span class="star" data-value="5">☆</span>
    </div>
    <textarea id="commentBox" placeholder="Write your comment..." rows="3"></textarea>
    <button id="submitFeedback">Send feedback</button>
    `;
    feedbackContainer.appendChild(feedbackList);
    exercisesEl.parentNode.appendChild(feedbackContainer);

    // Star rating
    document.querySelectorAll('#starRating .star').forEach(star => {
        star.addEventListener('click', () => {
            selectedRating = +star.dataset.value;
            document.querySelectorAll('#starRating .star').forEach(s =>
                s.textContent = +s.dataset.value <= selectedRating ? '★' : '☆'
            );
        });
    });
    document.getElementById('submitFeedback').onclick = async () => {
        const comment = document.getElementById('commentBox').value.trim();
        if (!auth.currentUser) return Swal.fire('Log in first to comment');
        if (!comment) return Swal.fire('Write a comment');
        await addDoc(collection(db, 'routines_feedback'), {
            routineId: currentRoutineId,
            uid: auth.currentUser.uid,
            rating: selectedRating,
            comment,
            timestamp: Date.now()
        });
        Swal.fire('Thanks for your feedback!');
        document.getElementById('commentBox').value = '';
        document.querySelectorAll('#starRating .star').forEach(s => s.textContent = '☆');
        selectedRating = 0;
        loadFeedback(currentRoutineId);
    };
    loadFeedback(id);
}

async function loadFeedback(routineId) {
    const feedbackSnap = await getDocs(
        query(
            collection(db, 'routines_feedback'),
            where('routineId', '==', routineId)
        )
    );
    const feedbacks = feedbackSnap.docs
        .map(d => d.data())
        .sort((a, b) => b.timestamp - a.timestamp);
    feedbackList.innerHTML = '';
    if (!feedbacks.length) {
        feedbackList.innerHTML = '<p>No feedback yet.</p>';
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

globalSearch.addEventListener('input', () => {
    const q = globalSearch.value.trim().toLowerCase();
    searchResults.innerHTML = '<option disabled selected>Results</option>';
    const filtered = allRoutines.filter(r =>
        (r.name + ' ' + r.routineType + ' ' + r.description)
            .toLowerCase().includes(q)
    );
    if (!filtered.length) {
        const opt = document.createElement('option');
        opt.disabled = true;
        opt.textContent = 'No matches';
        searchResults.appendChild(opt);
    } else {
        filtered.forEach(r => {
            const label = `[${r.routineType}] ${r.name}` + (r.isExclusive ? ' ⭐' : '');
            searchResults.appendChild(new Option(label, r.id));
        });
    }
});

typeSelector.addEventListener('change', () => loadRoutineNames(typeSelector.value));
routineSelector.addEventListener('change', () => loadRoutine(routineSelector.value));
searchResults.addEventListener('change', () => loadRoutine(searchResults.value));

onAuthStateChanged(auth, async firebaseUser => {
    if (!firebaseUser) return;
    const profile = await getUserProfile();
    routineFavorites = profile.routineFavorites || [];
    isSuperior       = profile.tipo_suscripcion === 'miembro superior';

    const base = await getCollectionCached('routines');
    allRoutines = base.map(r => ({ ...r, isExclusive: false }));
    if (isSuperior) {
        const exclusives = await getCollectionCached('exclusive_routines');
        exclusives.forEach(r => r.isExclusive = true);
        allRoutines = allRoutines.concat(exclusives);
    }

    loadRoutineTypes();
});
