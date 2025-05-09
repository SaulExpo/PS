import { createUserWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { auth, db } from "../firebase_config.js";
import {doc, setDoc} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import {sendEmailVerification} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import Swal from 'https://cdn.skypack.dev/sweetalert2';

let email
let name
let surname
let password
let repeatPassword

// Registrar usuario
const register = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        sendEmailVerification(user)
            .then(() => {
                console.log('Correo de verificación enviado');
            })
            .catch((error) => {
                console.error('Error al enviar verificación:', error);
            });
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
        repeatPassword = document.getElementById("repeat_password").value;

        if (password !== repeatPassword)
        {
            Swal.fire({
                title: "The passwords do not match.",
                icon: "warning",
                confirmButtonColor: "#d51313",
                confirmButtonText: "Ok"
            })
            return
        }
        if (email && password) {
            register(email, password);
        } else {
            Swal.fire({
                title: "Please complete all fields.",
                icon: "warning",
                confirmButtonColor: "#d51313",
                confirmButtonText: "Ok"
            })
        }
    });
});