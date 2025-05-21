import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    doc,
    getDoc,
    deleteDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBTiD4Phk2rKe1sF62c9qDSk1c3jNFgLf4",
    authDomain: "ps-fitness-app.firebaseapp.com",
    projectId: "ps-fitness-app",
    storageBucket: "ps-fitness-app.firebasestorage.app",
    messagingSenderId: "861934326277",
    appId: "1:861934326277:web:863ae59d1904e86a00826c",
    measurementId: "G-3WZD6X5SC2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Referencia a recomendaciones profesionales en tienda
const recomendacionesRef = collection(db, "tienda", "recomendaciones_profesional", "productos");
const contenedor = document.getElementById("productos-container");

let currentUser = null;

// Cargar recomendaciones
async function cargarRecomendaciones() {
    const querySnapshot = await getDocs(recomendacionesRef);
    querySnapshot.forEach((docSnap) => {
        const producto = docSnap.data();
        const id = docSnap.id;

        const card = document.createElement("div");
        card.className = "producto-card";

        card.innerHTML = `
      <img src="${producto.imageUrl}" alt="${producto.name}" />
      <h3>${producto.name}</h3>
      <p>${producto.description}</p>
      <a href="${producto.externalUrl}" target="_blank">Comprar ahora</a>
    `;

        // Mostrar autor si existe
        if (producto.author_name) {
            const autor = document.createElement("small");
            autor.textContent = `Recomendado por: ${producto.author_name}`;
            autor.style.color = "#999";
            card.appendChild(autor);
        }

        // Si el usuario actual es quien lo publicó, mostrar botones
        if (currentUser && producto.added_by === currentUser.uid) {
            const acciones = document.createElement("div");
            acciones.style.marginTop = "10px";

            const btnEditar = document.createElement("button");
            btnEditar.textContent = "Editar";
            btnEditar.onclick = () => editarRecomendacion(id, producto);

            const btnEliminar = document.createElement("button");
            btnEliminar.textContent = "Eliminar";
            btnEliminar.onclick = () => eliminarRecomendacion(id);

            acciones.appendChild(btnEditar);
            acciones.appendChild(btnEliminar);
            card.appendChild(acciones);
        }

        contenedor.appendChild(card);
    });
}

// Eliminar recomendación
async function eliminarRecomendacion(id) {
    if (confirm("¿Seguro que deseas eliminar esta recomendación?")) {
        await deleteDoc(doc(db, "tienda", "recomendaciones_profesional", "productos", id));
        alert("Recomendación eliminada.");
        location.reload();
    }
}

// Editar recomendación
function editarRecomendacion(id, data) {
    const form = document.getElementById("form-recomendacion");

    document.getElementById("nombre").value = data.name;
    document.getElementById("descripcion").value = data.description;
    document.getElementById("imagen").value = data.imageUrl;
    document.getElementById("enlace").value = data.externalUrl;

    form.scrollIntoView({ behavior: "smooth" });

    form.onsubmit = async (e) => {
        e.preventDefault();

        await updateDoc(doc(db, "tienda", "recomendaciones_profesional", "productos", id), {
            name: form.nombre.value,
            description: form.descripcion.value,
            imageUrl: form.imagen.value,
            externalUrl: form.enlace.value
        });

        alert("Recomendación actualizada.");
        location.reload();
    };
}

// Detectar si el usuario es profesional y permitir publicar
onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    currentUser = user;

    const userRef = doc(db, "user_app", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists() && userSnap.data().profesional === true) {
        document.getElementById("formulario-container").style.display = "block";

        const form = document.getElementById("form-recomendacion");

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const userData = await getDoc(doc(db, "user_app", user.uid));
            let nombreProfesional = "Profesional";

            if (userData.exists()) {
                const data = userData.data();
                nombreProfesional = data.name || data.nombre || data.surname || "Profesional";
            }


            const nuevaRecomendacion = {
                name: document.getElementById("nombre").value,
                description: document.getElementById("descripcion").value,
                imageUrl: document.getElementById("imagen").value,
                externalUrl: document.getElementById("enlace").value,
                added_by: user.uid,
                author_name: nombreProfesional
            };

            await addDoc(recomendacionesRef, nuevaRecomendacion);
            alert("Recomendación publicada correctamente.");
            location.reload();
        });
    }

    cargarRecomendaciones(); // Esperamos auth para mostrar acciones según usuario
});
