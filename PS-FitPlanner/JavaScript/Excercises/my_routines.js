import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { collection, getDocs, query, where, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import Swal from 'https://cdn.skypack.dev/sweetalert2';
import { auth, db } from "../firebase_config.js";
import { myRoutinesLanguage } from "../Language/my_routinesLanguage.js";
import { translateText } from "../translate.js";

const token = localStorage.getItem("jwt");
if (!token) {
    window.location.href = "../Pages/login.html";
}

const userRoutinesCol = collection(db, "user_routines");
const listEl = document.getElementById("routine-list");
myRoutinesLanguage();

async function loadUserRoutines(user) {
    listEl.innerHTML = "";

    const q = query(userRoutinesCol, where("uid", "==", user.uid));
    const snap = await getDocs(q);

    let description, addNote, saveNoteTxt, editTxt, deleteTxt, sureDelete, confirmTxt, denyTxt, durationTxt, restTxt;
    let addGoalTxt, saveGoalTxt, goalPlaceholder;
    const language = localStorage.getItem("language");
    if (snap.empty) {
        listEl.innerHTML = language === "english"
            ? "<p>You don´t have any routine yet.</p>"
            : "<p>Aún no tienes ninguna rutina</p>";
        return;
    }
    if (language === "english") {
        description    = "Without description.";
        addNote        = "Add note...";
        saveNoteTxt    = "Save note";
        editTxt        = "Edit";
        deleteTxt      = "Delete";
        sureDelete     = "Delete this routine?";
        confirmTxt     = "Yes, delete";
        denyTxt        = "Don't delete";
        durationTxt    = "Duration:";
        restTxt        = "Rest:";
        addGoalTxt     = "Add goal...";
        saveGoalTxt    = "Save goal";
        goalPlaceholder= "New goal description";
    } else {
        description    = "Sin descripción.";
        addNote        = "Añadir nota...";
        saveNoteTxt    = "Guardar nota";
        editTxt        = "Editar";
        deleteTxt      = "Borrar";
        sureDelete     = "¿Borrar esta rutina?";
        confirmTxt     = "Sí, borrar";
        denyTxt        = "No borrar";
        durationTxt    = "Duración:";
        restTxt        = "Descanso:";
        addGoalTxt     = "Añadir objetivo...";
        saveGoalTxt    = "Guardar objetivo";
        goalPlaceholder= "Descripción del objetivo";
    }

    for (const d of snap.docs) {
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
        textarea.placeholder = addNote;
        textarea.value = data.note || "";
        const saveNoteBtn = document.createElement("button");
        saveNoteBtn.className = "save-note-btn";
        saveNoteBtn.textContent = saveNoteTxt;
        noteEditor.append(textarea, saveNoteBtn);

        noteBtn.addEventListener("click", () => {
            noteEditor.style.display = noteEditor.style.display === "none" ? "block" : "none";
        });

        saveNoteBtn.addEventListener("click", async () => {
            const newNote = textarea.value.trim();
            await updateDoc(doc(db, "user_routines", id), { note: newNote });
            loadUserRoutines(user);
        });

        const goals = data.goals || [];
        const goalDisplay = document.createElement("div");
        goalDisplay.className = "routine-goal-display";
        goals.forEach((g, idx) => {
            const wrapper = document.createElement("div");
            wrapper.className = "goal-item";
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = g.completed;
            checkbox.addEventListener("change", async () => {
                const updated = [...goals];
                updated[idx] = { ...g, completed: checkbox.checked };
                await updateDoc(doc(db, "user_routines", id), { goals: updated });
                loadUserRoutines(user);
            });
            const label = document.createElement("span");
            label.textContent = g.text;
            wrapper.append(checkbox, label);
            goalDisplay.appendChild(wrapper);
        });

        const goalBtn = document.createElement("button");
        goalBtn.className = "goal-btn";
        goalBtn.textContent = "🎯";

        const goalEditor = document.createElement("div");
        goalEditor.className = "goal-editor";
        goalEditor.style.display = "none";
        const goalInput = document.createElement("input");
        goalInput.className = "goal-input";
        goalInput.type = "text";
        goalInput.placeholder = goalPlaceholder;
        const saveGoalBtn = document.createElement("button");
        saveGoalBtn.className = "save-goal-btn";
        saveGoalBtn.textContent = saveGoalTxt;
        goalEditor.append(goalInput, saveGoalBtn);

        goalBtn.addEventListener("click", () => {
            goalEditor.style.display = goalEditor.style.display === "none" ? "block" : "none";
        });

        saveGoalBtn.addEventListener("click", async () => {
            const text = goalInput.value.trim();
            if (!text) return;
            const updated = [...goals, { text, completed: false }];
            await updateDoc(doc(db, "user_routines", id), { goals: updated });
            loadUserRoutines(user);
        });

        const actions = document.createElement("div");
        actions.className = "routine-actions";
        const editBtn = document.createElement("button");
        editBtn.className = "edit-btn";
        editBtn.textContent = editTxt;
        editBtn.onclick = () => window.location.href = `exercise_selector.html?editId=${id}`;
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = deleteTxt;
        deleteBtn.onclick = async () => {
            Swal.fire({
                title: sureDelete,
                showDenyButton: true,
                confirmButtonText: confirmTxt,
                denyButtonText: denyTxt
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await deleteDoc(doc(db, "user_routines", id));
                    loadUserRoutines(user);
                }
            });
        };
        actions.append(noteBtn, goalBtn, editBtn, deleteBtn);

        const detailsEl = document.createElement("div");
        detailsEl.className = "routine-extra-details";
        detailsEl.style.display = "none";
        const durationEl = document.createElement("div");
        durationEl.className = "routine-duration";
        durationEl.textContent = `${durationTxt} ${data.duration || "-"}`;
        const restEl = document.createElement("div");
        restEl.className = "routine-rest";
        restEl.textContent = `${restTxt} ${data.rest || "-"}`;
        const exercisesList = document.createElement("ul");
        exercisesList.className = "routine-exercises";
        for (const ex of data.exercises || []) {
            const li = document.createElement("li");
            if (language === "english") {
                li.textContent = `${ex.name} — ${ex.reps}`;
            } else {
                li.textContent = `${await translateText(ex.name, "es")} — ${ex.reps}`;
            }
            exercisesList.appendChild(li);
        }
        detailsEl.append(durationEl, restEl, exercisesList);

        nameEl.addEventListener("click", () => {
            detailsEl.style.display = detailsEl.style.display === "none" ? "block" : "none";
        });

        card.append(nameEl, descEl, noteDisplay, noteEditor, goalDisplay, goalEditor, actions, detailsEl);
        listEl.appendChild(card);
    }
}

onAuthStateChanged(auth, user => {
    if (user) loadUserRoutines(user);
    else listEl.innerHTML = "<p>Login to see your routines.</p>";
});
