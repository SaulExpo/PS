import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

const productosRef = collection(db, "tienda", "materialDeportivo", "productos");

const contenedor = document.getElementById("productos-container");

async function cargarMaterial() {
    const querySnapshot = await getDocs(productosRef);
    querySnapshot.forEach((doc) => {
        const producto = doc.data();
        const card = document.createElement("div");
        card.className = "producto-card";

        card.innerHTML = `
            <img src="${producto.imageUrl}" alt="${producto.name}" />
            <h3>${producto.name}</h3>
            <p>${producto.description}</p>
            <a href="${producto.externalUrl}" target="_blank">Comprar ahora</a>
        `;

        contenedor.appendChild(card);
    });
}

cargarMaterial();
