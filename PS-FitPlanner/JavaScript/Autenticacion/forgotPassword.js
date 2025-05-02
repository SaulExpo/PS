import {sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {auth} from "../firebase_config.js";
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('forgot-password-form').addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        sendPasswordResetEmail(auth, email)
        window.location.href="../Pages/login.html";
    });
});