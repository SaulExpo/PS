import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {collection, getDocs, query, where, doc, deleteDoc, updateDoc} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import Swal from 'https://cdn.skypack.dev/sweetalert2';
import { auth, db } from "../firebase_config.js";
import {myRoutinesLanguage} from "../Language/my_routinesLanguage.js";

const token = localStorage.getItem("jwt");
if (!token) {
    window.location.href = "../Pages/login.html"
}

const userRoutinesCol = collection(db, "user_routines");
const listEl = document.getElementById("routine-list");
myRoutinesLanguage()

async function loadUserRoutines(user) {
    listEl.innerHTML = "";

    const q = query(userRoutinesCol, where("uid", "==", user.uid));
    const snap = await getDocs(q);
    console.log(`Documentos recibidos para ${user.uid}:`, snap.docs.length);

    let description
    let save
    let edit
    let add
    let deleteTxt
    let sureDelete
    let confirm
    let deny
    let duration
    let rest
    let language = localStorage.getItem("language");
    if (snap.empty) {
        if (language === "english") {
            listEl.innerHTML = "<p>You don´t have any routine yet.</p>";
        } else {
            listEl.innerHTML = "<p>Aún no tienes niguna rutina</p>";
        }
        return;
    }
    if (language === "english") {
        description = "Without description."
        add = "Add note..."
        save = "Save note"
        edit = "Edit"
        deleteTxt = "Delete"
        sureDelete = "Delete this routine?"
        confirm = "Yes, delete"
        deny = `Don't delete`
        duration = "Duration:"
        rest = "Rest:"
    } else {
        description = "Sin descripción."
        add = "Añadir nota..."
        save = "Guardar nota"
        edit = "Editar"
        deleteTxt = "Borrar"
        sureDelete = "¿Borrar esta rutina?"
        confirm = "Si, borrar"
        deny = `No borrar`
        duration = "Duración:"
        rest = "Descanso:"
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
        descEl.textContent = data.description || description;

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
        textarea.placeholder = add;
        textarea.value = data.note || "";
        const saveNoteBtn = document.createElement("button");
        saveNoteBtn.className = "save-note-btn";
        saveNoteBtn.textContent = save;
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
        editBtn.textContent = edit;
        editBtn.onclick = () => window.location.href = `exercise_selector.html?editId=${id}`;

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = deleteTxt;
        deleteBtn.onclick = async () => {
            Swal.fire({
                title: sureDelete,
                showDenyButton: true,
                confirmButtonText: confirm,
                denyButtonText: deny
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
        durationEl.textContent = `${duration} ${data.duration || "-"}`;

        const restEl = document.createElement("div");
        restEl.className = "routine-rest";
        restEl.textContent = `${rest} ${data.rest || "-"}`;

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


