// updateRest.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// 1) Inicializa Firebase (usa tu propia config)
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
const db  = getFirestore(app);

// 2) Función que mapea level → rest
function restByLevel(level) {
    switch (level) {
        case "advanced":     return "2:30";
        case "intermediate": return "3:00";
        case "beginner":     return "3:30";
        default:             return "3:00";
    }
}

// 3) Recorre y actualiza
(async function addRestField() {
    const col = collection(db, "routines");
    const snap = await getDocs(col);
    console.log(`⏳ Procesando ${snap.size} rutinas…`);

    for (const docSnap of snap.docs) {
        const data  = docSnap.data();
        const level = data.level;
        const rest  = restByLevel(level);

        const ref = doc(db, "routines", docSnap.id);
        await updateDoc(ref, { rest });
        console.log(`✔ ${docSnap.id}: level=${level} → rest=${rest}`);
    }

    console.log("✅ ¡Terminado! Todos los documentos tienen ya el campo `rest`.");
})();
