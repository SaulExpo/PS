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

const recomendacionesRef = collection(db, "tienda", "recomendaciones_profesional", "productos");
const contenedor = document.getElementById("productos-container");
const filtroTipo = document.getElementById("filtro-tipo");

let currentUser = null;

// Render tarjetas
function renderProducto(producto, id) {
    const card = document.createElement("div");
    card.className = "producto-card";

    card.innerHTML = `
    <img src="${producto.imageUrl}" alt="${producto.name}" />
    <h3>${producto.name}</h3>
    <p>${producto.description}</p>
    <a href="${producto.externalUrl}" target="_blank">Comprar ahora</a>
  `;

    if (producto.tipo) {
        const tipo = document.createElement("small");
        tipo.textContent = `Categoría: ${producto.tipo}`;
        card.appendChild(tipo);
    }

    if (producto.author_name) {
        const autor = document.createElement("small");
        autor.textContent = `Recomendado por: ${producto.author_name}`;
        card.appendChild(autor);
    }

    if (currentUser && producto.added_by === currentUser.uid) {
        const acciones = document.createElement("div");

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
}

// Cargar productos con filtro
async function cargarRecomendaciones(filtro = "todos") {
    contenedor.innerHTML = "";

    const snapshot = await getDocs(recomendacionesRef);
    snapshot.forEach((docSnap) => {
        const producto = docSnap.data();
        const id = docSnap.id;

        if (filtro === "todos" || producto.tipo === filtro) {
            renderProducto(producto, id);
        }
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

// Editar
function editarRecomendacion(id, data) {
    const form = document.getElementById("form-recomendacion");

    form.nombre.value = data.name;
    form.descripcion.value = data.description;
    form.imagen.value = data.imageUrl;
    form.enlace.value = data.externalUrl;
    form.tipo.value = data.tipo || "";

    form.scrollIntoView({ behavior: "smooth" });

    form.onsubmit = async (e) => {
        e.preventDefault();

        await updateDoc(doc(db, "tienda", "recomendaciones_profesional", "productos", id), {
            name: form.nombre.value,
            description: form.descripcion.value,
            imageUrl: form.imagen.value,
            externalUrl: form.enlace.value,
            tipo: form.tipo.value
        });

        alert("Recomendación actualizada.");
        location.reload();
    };
}

// Detectar login y mostrar formulario si es profesional
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
            const data = userData.data();
            const nombreProfesional = data.name || data.nombre || data.surname || "Profesional";

            const nuevaRecomendacion = {
                name: form.nombre.value,
                description: form.descripcion.value,
                imageUrl: form.imagen.value,
                externalUrl: form.enlace.value,
                tipo: form.tipo.value,
                added_by: user.uid,
                author_name: nombreProfesional
            };

            await addDoc(recomendacionesRef, nuevaRecomendacion);
            alert("Recomendación publicada correctamente.");
            location.reload();
        });
    }

    cargarRecomendaciones();
});

// Escuchar cambios en el filtro
filtroTipo.addEventListener("change", () => {
    cargarRecomendaciones(filtroTipo.value);
});
