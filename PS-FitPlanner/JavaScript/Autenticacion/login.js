import {signInWithEmailAndPassword, signOut} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {auth, db} from "../firebase_config.js";
import {collection, doc, getDoc, getDocs, query, updateDoc, where} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import Swal from 'https://cdn.skypack.dev/sweetalert2';
import {renovarSuscripcion} from "../Profile/updateMember.js";
import {getUserRoutines} from "../GetDB/getUserRoutines.js";

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
            Swal.fire({
                title: "You must verify your email before you can log in.",
                icon: "error",
                confirmButtonColor: "#d51313",
                confirmButtonText: "Ok"
            })
            return
        }
        getUserRoutines(user.email).then(rutines => {
            rutines.forEach(rutine => {
                const fecha = new Date(rutine.date);
                fecha.setDate(fecha.getDate() - rutine.rememberDays);
                const hoy = new Date();
                if (esMismaFecha(fecha, hoy)) {
                    sendEmail(user, `Today you have a rutine programmed: ${rutine.rutine.name} at ${rutine.date}`)
                }
            })
        })
        await comprobarSuscripción()
        window.location.href="http://localhost:63342/PS/PS-FitPlanner/Pages/first_page.html?_ijt=vgob1go66v0h87q0cjc6046q57&_ij_reload=RELOAD_ON_SAVE";
        localStorage.setItem("jwt", "Sesion Cerrada");
    } catch (error) {
        console.error("Error al iniciar sesión:", error.message);
    }
};

function esMismaFecha(d1, d2) {
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
}

function sendEmail(userdata, message){
    emailjs.init('CTnfkkYqegWMlezAo');

    const params = {
        email: userdata.email,
        message: message,
        title: "Rutine remembering"
    };
    console.log(params)
    emailjs.send('service_cmud1pq', 'template_ckg59mk', params)
        .then(function(response) {
        }, function(error) {
            alert('Error al enviar el correo');
            console.log(error);
        });
}

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
            if (usuario.data().periodo_suscripcion === "mes") {
                if (diasPasados >= 30) {
                    await renovarSuscripcion()
                }
            } else if (usuario.data().periodo_suscripcion === "año") {
                if (diasPasados >= 365) {
                    await renovarSuscripcion()
                }
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
            Swal.fire({
                title: "Please complete all fields.",
                icon: "warning",
                confirmButtonColor: "#d51313",
                confirmButtonText: "Ok"
            })
        }
    });
});


