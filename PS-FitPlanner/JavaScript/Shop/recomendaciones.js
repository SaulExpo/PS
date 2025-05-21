import {onAuthStateChanged} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {collection, getDocs, doc, getDoc, updateDoc, deleteDoc, addDoc} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { translateText } from "/PS/PS-FitPlanner/JavaScript/translate.js";
import { db, auth } from "/PS/PS-FitPlanner/JavaScript/firebase_config.js";
import {recommendationsLanguage} from "/PS/PS-FitPlanner/JavaScript/Language/recommendationsLanguage.js";
import Swal from 'https://cdn.skypack.dev/sweetalert2';


recommendationsLanguage()
const recomendacionesRef = collection(db, "tienda", "recomendaciones_profesional", "productos");
const contenedor = document.getElementById("productos-container");
const filtroTipo = document.getElementById("filtro-tipo");
const language = localStorage.getItem("language");

let currentUser = null;

// Render tarjetas
async function renderProducto(producto, id) {
    const card = document.createElement("div");
    card.className = "producto-card";
    let nombre, descripcion, tipoText, comprar, category, recommended, edit, deleteText;
    if (language === "english") {
        [nombre, descripcion, tipoText] = await Promise.all([
            translateText(producto.name, "en"),
            translateText(producto.description, "en"),
            translateText(producto.tipo, "en")
        ]);
        comprar = "Buy now";
        category = "Category"
        recommended = "Recommended by"
        edit = "Edit"
        deleteText = "Delete"
    } else {
        nombre = producto.name;
        descripcion = producto.description;
        tipoText = producto.tipo,
        comprar = "Comprar ahora";
        category = "Categoría"
        recommended = "Recomendado por"
        edit = "Editar"
        deleteText = "Eliminar"
    }
    card.innerHTML = `
    <img src="${producto.imageUrl}" alt="${nombre}" />
    <h3>${nombre}</h3>
    <p>${descripcion}</p>
    <a href="${producto.externalUrl}" target="_blank">${comprar}</a>
  `;

    if (producto.tipo) {
        const tipo = document.createElement("small");
        tipo.textContent = `${category}: ${tipoText}`;
        card.appendChild(tipo);
    }

    if (producto.author_name) {
        const autor = document.createElement("small");
        autor.textContent = `${recommended}: ${producto.author_name}`;
        card.appendChild(autor);
    }

    if (currentUser && producto.added_by === currentUser.uid) {
        const acciones = document.createElement("div");

        const btnEditar = document.createElement("button");
        btnEditar.textContent = edit;
        btnEditar.addEventListener("click", () =>{
            editarRecomendacion(id, producto);
            document.getElementById("publicar").style.display = "none";
            document.getElementById("update").style.display = "block";
            document.getElementById("cancel").style.display = "block";
        })

        const btnEliminar = document.createElement("button");
        btnEliminar.textContent = deleteText;
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
    Swal.fire({
        title: language === "english" ? "Are you sure you want to remove this recommendation?" :
            "¿Seguro que deseas eliminar esta recomendación?",
        showDenyButton: true,
        confirmButtonText: language === "english" ? "Yes" : "Si",
        denyButtonText: "No",
    }).then(async (result) => {
        if (result.isConfirmed) {
            await deleteDoc(doc(db, "tienda", "recomendaciones_profesional", "productos", id));
            Swal.fire({
                title: language === "english" ? "Recommendation removed." : "Recomendación eliminada",
                icon: "success",
                confirmButtonColor: "#d51313",
                confirmButtonText: "Ok"
            }).then(async (result) => {
                location.reload()
            })
        }
    });
}

// Editar
function editarRecomendacion(id, data) {
    const form = document.getElementById("form-recomendacion");
    const btn = document.getElementById("update");
    form.nombre.value = data.name;
    form.descripcion.value = data.description;
    form.imagen.value = data.imageUrl;
    form.enlace.value = data.externalUrl;
    form.tipo.value = data.tipo || "";

    form.scrollIntoView({ behavior: "smooth" });

    btn.addEventListener("click", async (e) => {
        e.preventDefault();

        await updateDoc(doc(db, "tienda", "recomendaciones_profesional", "productos", id), {
            name: form.nombre.value,
            description: form.descripcion.value,
            imageUrl: form.imagen.value,
            externalUrl: form.enlace.value,
            tipo: form.tipo.value
        });

        Swal.fire({
            title: language === "english" ? "Recommendation updated." : "Recomendación actualizada.",
            icon: "success",
            confirmButtonColor: "#d51313",
            confirmButtonText: "Ok"
        }).then(async (result) => {
            location.reload()
        })
    });
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
        const btn = document.getElementById("publicar");
        const btn2 = document.getElementById("cancel");

        btn2.addEventListener("click", async (e) => {
            e.preventDefault()
            form.nombre.value = "";
            form.descripcion.value = "";
            form.imagen.value = "";
            form.enlace.value = "";
            form.tipo.value = "";
            btn.style.display = "block";
            btn2.style.display = "none";
            document.getElementById("update").style.display = "none";
        })

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
            Swal.fire({
                title: language === "english" ? "Recommendation published successfully." : "Recomendación publicada correctamente.",
                icon: "success",
                confirmButtonColor: "#d51313",
                confirmButtonText: "Ok"
            }).then(async (result) => {
                location.reload()
            })
        });
    }

    cargarRecomendaciones();
});

// Escuchar cambios en el filtro
filtroTipo.addEventListener("change", () => {
    cargarRecomendaciones(filtroTipo.value);
});
