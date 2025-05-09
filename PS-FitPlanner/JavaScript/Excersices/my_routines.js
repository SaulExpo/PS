import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
    collection,
    getDocs,
    query,
    where,
    doc,
    deleteDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import Swal from 'https://cdn.skypack.dev/sweetalert2';

import { auth, db } from "../firebase_config.js";
const token = localStorage.getItem("jwt");
if (!token) {
    window.location.href = "../Pages/login.html"
}

const userRoutinesCol = collection(db, "user_routines");
const listEl = document.getElementById("routine-list");

async function loadUserRoutines(user) {
    listEl.innerHTML = "";

    const q = query(userRoutinesCol, where("uid", "==", user.uid));
    const snap = await getDocs(q);
    console.log(`Documentos recibidos para ${user.uid}:`, snap.docs.length);

    if (snap.empty) {
        listEl.innerHTML = "<p>You don´t have any routine yet.</p>";
        return;
    }

    snap.docs.forEach((d) => {
        const data = d.data();
        const id = d.id;

        const card = document.createElement("div");
        card.className = "routine-card";

        const nameEl = document.createElement("div");
        nameEl.className = "routine-name";
        nameEl.textContent = data.name;
        nameEl.style.cursor = "pointer";

        const descEl = document.createElement("div");
        descEl.className = "routine-description";
        descEl.textContent = data.description || "Without description.";

        const noteDisplay = document.createElement("div");
        noteDisplay.className = "routine-note-display";
        noteDisplay.textContent = data.note || "";

        const noteBtn = document.createElement("button");
        noteBtn.className = "note-btn";
        noteBtn.textContent = "✏️";

        const noteEditor = document.createElement("div");
        noteEditor.className = "note-editor";
        noteEditor.style.display = "none";
        const textarea = document.createElement("textarea");
        textarea.className = "note-input";
        textarea.placeholder = "Add note…";
        textarea.value = data.note || "";
        const saveNoteBtn = document.createElement("button");
        saveNoteBtn.className = "save-note-btn";
        saveNoteBtn.textContent = "Save note";
        noteEditor.append(textarea, saveNoteBtn);

        noteBtn.addEventListener("click", () => {
            noteEditor.style.display = noteEditor.style.display === "none" ? "block" : "none";
        });

        saveNoteBtn.addEventListener("click", async () => {
            const newNote = textarea.value.trim();
            await updateDoc(doc(db, "user_routines", id), { note: newNote });
            loadUserRoutines(user);
        });

        const actions = document.createElement("div");
        actions.className = "routine-actions";

        const editBtn = document.createElement("button");
        editBtn.className = "edit-btn";
        editBtn.textContent = "Edit";
        editBtn.onclick = () => window.location.href = `exercise_selector.html?editId=${id}`;

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "Delete";
        deleteBtn.onclick = async () => {
            Swal.fire({
                title: "¿Delete this routine?",
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: "Yes, delete",
                denyButtonText: `Don't delete`
            }).then(async (result) => {
                /* Read more about isConfirmed, isDenied below */
                if (result.isConfirmed) {
                    await deleteDoc(doc(db, "user_routines", id));
                    loadUserRoutines(user);
                } else if (result.isDenied) {
                    return;
                }
            });

        };

        actions.append(noteBtn, editBtn, deleteBtn);

        const detailsEl = document.createElement("div");
        detailsEl.className = "routine-extra-details";
        detailsEl.style.display = "none";

        const durationEl = document.createElement("div");
        durationEl.className = "routine-duration";
        durationEl.textContent = `Duration: ${data.duration || "-"}`;

        const restEl = document.createElement("div");
        restEl.className = "routine-rest";
        restEl.textContent = `Rest: ${data.rest || "-"}`;

        const exercisesList = document.createElement("ul");
        exercisesList.className = "routine-exercises";
        (data.exercises || []).forEach((ex) => {
            const li = document.createElement("li");
            li.textContent = `${ex.name} — ${ex.reps}`;
            exercisesList.appendChild(li);
        });

        detailsEl.append(durationEl, restEl, exercisesList);

        nameEl.addEventListener("click", () => {
            detailsEl.style.display = detailsEl.style.display === "none" ? "block" : "none";
        });

        card.append(nameEl, descEl, noteDisplay, noteEditor, actions, detailsEl);
        listEl.appendChild(card);
    });
}

onAuthStateChanged(auth, (user) => {
    if (user) loadUserRoutines(user);
    else listEl.innerHTML = "<p>Login you see your rutines.</p>";
});
