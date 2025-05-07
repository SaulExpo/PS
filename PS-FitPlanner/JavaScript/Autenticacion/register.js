import { createUserWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { auth, db } from "../firebase_config.js";
import {doc, setDoc} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

let email
let name
let surname
let password

// Registrar usuario
const register = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "user_app", user.uid), {
            name: name,
            surname: surname,
            email: user.email,
            uid: user.uid,
            createdAt: new Date(),
            tipo_suscripcion: "usuario"
        });
        window.location.href="../Pages/login.html";
    } catch (error) {
        console.error("Error al registrar:", error.message);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("register-form");
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        email = document.getElementById("email").value.trim();
        name = document.getElementById("name").value.trim();
        surname = document.getElementById("surname").value.trim();
        password = document.getElementById("password").value;

        if (email && password) {
            register(email, password);
        } else {
            alert("Por favor completa todos los campos.");
        }
    });
});