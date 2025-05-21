import { collection, getDocs, doc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import {supplementsLanguage} from "/PS/PS-FitPlanner/JavaScript//Language/supplementsLanguage.js";
import { translateText } from "/PS/PS-FitPlanner/JavaScript/translate.js";
import { db } from "/PS/PS-FitPlanner/JavaScript/firebase_config.js";

const productosDocRef = doc(db, "tienda", "suplementos");
const productosRef = collection(productosDocRef, "productos");

supplementsLanguage()

const contenedor = document.getElementById("productos-container");

async function cargarSuplemento() {
    try {
        const querySnapshot = await getDocs(productosRef);
        const language = localStorage.getItem("language");
        const tareas = querySnapshot.docs.map(async (doc) => {
            const producto = doc.data();
            const card = document.createElement("div");
            card.className = "producto-card";

            let nombre, descripcion, comprar;

            if (language === "english") {
                [nombre, descripcion] = await Promise.all([
                    translateText(producto.name, "en"),
                    translateText(producto.description, "en")
                ]);
                comprar = "Buy now";
            } else {
                nombre = producto.name;
                descripcion = producto.description;
                comprar = "Comprar ahora";
            }

            card.innerHTML = `
                <img src="${producto.imageUrl}" alt="${nombre}" />
                <h3>${nombre}</h3>
                <p>${descripcion}</p>
                <a href="${producto.externalUrl}" target="_blank">${comprar}</a>
            `;

            contenedor.appendChild(card);
        });

        // Esperar a que se completen todos en paralelo
        await Promise.all(tareas);
    } catch (error) {
        console.error("Error cargando proteina:", error);
    }
}

cargarSuplemento();
