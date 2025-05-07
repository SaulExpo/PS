import {signInWithEmailAndPassword, signOut} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {auth, db} from "../firebase_config.js";
import {collection, doc, getDoc, getDocs, query, updateDoc, where} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

//Ininicar Sesión
const login = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log(user)
        if (user.emailVerified) {
            console.log('Inicio de sesión exitoso y verificado');
            // Redirige al usuario o continúa la sesión
        } else {
            signOut(auth); // Cierra la sesión si no está verificado
            alert('Debes verificar tu correo antes de poder iniciar sesión.');
            return
        }
        await comprobarSuscripción()
        window.location.href="http://localhost:63342/PS/PS-FitPlanner/Pages/first_page.html?_ijt=vgob1go66v0h87q0cjc6046q57&_ij_reload=RELOAD_ON_SAVE";
        localStorage.setItem("jwt", "Sesion Cerrada");
    } catch (error) {
        console.error("Error al iniciar sesión:", error.message);
    }
};

//Comprobar al iniciar Sesión que el usuario aun esta dentro de su periodo de suscripción
async function comprobarSuscripción() {
    const user = auth.currentUser;

    const userQuery = query(collection(db, "user_app"), where("email", "==", user.email));
    const querySnapshot = await getDocs(userQuery);

    if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userRef = doc(db, "user_app", userDoc.id);
        let usuario = await getDoc(userRef)
        if (usuario.data().inicio_suscripcion) {
            const timestamp = usuario.data().inicio_suscripcion;
            const fecha = timestamp.toDate();
            const ahora = new Date();
            const diferenciaMs = ahora - fecha;
            const diasPasados = diferenciaMs / (1000 * 60 * 60 * 24);
            if (diasPasados >= 30) {
                await updateDoc(userRef, {
                    tipo_suscripcion: "usuario",
                });
            }
        }


    } else {
        console.error("No se encontró el usuario en Firestore.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("login-form");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (email && password) {
            login(email, password);
        } else {
            alert("Por favor completa todos los campos.");
        }
    });
});


