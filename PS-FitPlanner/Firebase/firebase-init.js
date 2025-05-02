// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore }  from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth }       from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBTiD4Phk2rKe1sF62c9qDSk1c3jNFgLf4",
    authDomain: "ps-fitness-app.firebaseapp.com",
    projectId: "ps-fitness-app",
    storageBucket: "ps-fitness-app.firebasestorage.app",
    messagingSenderId: "861934326277",
    appId: "1:861934326277:web:863ae59d1904e86a00826c",
    measurementId: "G-3WZD6X5SC2"
};

// Inicializas la app
const app = initializeApp(firebaseConfig);

// Expones globalmente los servicios
window.db   = getFirestore(app);
window.auth = getAuth(app);
