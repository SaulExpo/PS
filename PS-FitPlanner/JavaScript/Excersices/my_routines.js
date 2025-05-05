// my_routines.js
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
import { auth, db } from "../firebase_config.js";

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

        const descEl = document.createElement("div");
        descEl.className = "routine-description";
        descEl.textContent = data.description || "Without description.";

        const noteDisplay = document.createElement("div");
        noteDisplay.className = "routine-note-display";
        noteDisplay.textContent = data.note || "";

        const noteBtn = document.createElement("button");
        noteBtn.className = "note-btn";
        noteBtn.textContent = "✏️ Note";

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
        editBtn.onclick = () => {
            window.location.href = `exercise_selector.html?editId=${id}`;
        };

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "Delete";
        deleteBtn.onclick = async () => {
            if (!confirm("¿Delete this routine?")) return;
            await deleteDoc(doc(db, "user_routines", id));
            loadUserRoutines(user);
        };

        actions.append(noteBtn, editBtn, deleteBtn);
        card.append(nameEl, descEl, noteDisplay, noteEditor, actions);
        listEl.appendChild(card);
    });
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        loadUserRoutines(user);
    } else {
        listEl.innerHTML = "<p>Inicia sesión para ver tus rutinas.</p>";
    }
});
