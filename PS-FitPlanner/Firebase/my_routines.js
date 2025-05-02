// my_routines.js
import {
    collection,
    getDocs,
    doc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// 1) Referencia a Firestore
const db = window.db;
const userRoutinesCol = collection(db, "user_routines");

// 2) Función para pintar la lista
async function loadUserRoutines() {
    const list = document.getElementById("routine-list");
    list.innerHTML = "";

    const snap = await getDocs(userRoutinesCol);
    if (snap.empty) {
        list.innerHTML = "<p>No tienes rutinas guardadas aún.</p>";
        return;
    }

    snap.docs.forEach((d) => {
        const data = d.data();
        const id   = d.id;

        const card = document.createElement("div");
        card.className = "routine-card";

        const name = document.createElement("div");
        name.className = "routine-name";
        name.textContent = data.name;

        const description = document.createElement("div");
        description.className = "routine-description";
        description.textContent = data.description || "Sin descripción.";

        const actions = document.createElement("div");
        actions.className = "routine-actions";

        // EDITAR → pasamos el id en query string
        const editBtn = document.createElement("button");
        editBtn.className = "edit-btn";
        editBtn.textContent = "Editar";
        editBtn.onclick = () => {
            window.location.href = `exercise_selector.html?editId=${id}`;
        };

        // ELIMINAR → borramos el doc
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "Eliminar";
        deleteBtn.onclick = async () => {
            if (!confirm("¿Eliminar esta rutina?")) return;
            await deleteDoc(doc(db, "user_routines", id));
            loadUserRoutines();  // refresca la lista
        };

        actions.append(editBtn, deleteBtn);
        card.append(name, description, actions);
        list.appendChild(card);
    });
}

// 3) Al cargar la página…
document.addEventListener("DOMContentLoaded", loadUserRoutines);
