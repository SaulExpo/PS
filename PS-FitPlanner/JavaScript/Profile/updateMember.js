import {getFirestore, doc, updateDoc, collection, query, where, getDocs, serverTimestamp} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import {auth, db} from "../firebase_config.js";
import Swal from 'https://cdn.skypack.dev/sweetalert2';

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("fake-payment-form").addEventListener("submit", async function(e) {
        e.preventDefault();
        const tipo = document.getElementById('payment-form').dataset.tipoSuscripcion;
        const periodo = document.getElementById('payment-form').dataset.tipoRenovacion;

        await actualizarSuscripcion(tipo, periodo);
        document.getElementById('payment-form').style.display = 'none';
    });
});


async function actualizarSuscripcion(tipo, periodo) {
    const user = auth.currentUser;

    if (!user) {
        alert("Usuario no autenticado.");
        return;
    }

    // Buscar el documento del usuario en Firestore
    const userQuery = query(collection(db, "user_app"), where("email", "==", user.email));
    const querySnapshot = await getDocs(userQuery);

    if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userRef = doc(db, "user_app", userDoc.id);

        await updateDoc(userRef, {
            tipo_suscripcion: tipo,
            periodo_suscripcion: periodo,
            inicio_suscripcion: serverTimestamp(),
        });
        Swal.fire({
            title: "Updated subscription!",
            icon: "success",
            confirmButtonColor: "#d51313",
            confirmButtonText: "Ok"
        })
        let time = new Date()
        let message = "Thank you for purchasing a subscription to our website.\n" +
            "\n" +
            "You have registered as " + tipo + " to have new features\n" +
            "Your subscription started at: " + time.toLocaleString('es-ES') + ".\n" +
            "If you have any questions you can contact us at this email: produccionsoftware5@gmail.com";
        let title = "Updated Subscription!"
        sendEmail(user.email, message, title)

    } else {
        console.error("No se encontró el usuario en Firestore.");
    }
}

export async function renovarSuscripcion() {
    const user = auth.currentUser;

    if (!user) {
        alert("Usuario no autenticado.");
        return;
    }

    // Buscar el documento del usuario en Firestore
    const userQuery = query(collection(db, "user_app"), where("email", "==", user.email));
    const querySnapshot = await getDocs(userQuery);

    if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userRef = doc(db, "user_app", userDoc.id);

        await updateDoc(userRef, {
            inicio_suscripcion: serverTimestamp(),
        });
        let time = new Date()
        let message= "Your subscription has been successfully renewed with a start date of: " + time.toLocaleString('es-ES')
            + " You have 30 business days with your subscription"
        sendEmail(user.email, message, "Suscripción Renovada!")
        Swal.fire({
            title: "Renewed subscription!",
            icon: "success",
            confirmButtonColor: "#d51313",
            confirmButtonText: "Ok"
        })
    } else {
        console.error("No se encontró el usuario en Firestore.");
    }
}

async function cancelarSuscripcion() {
    const user = auth.currentUser;

    if (!user) {
        alert("Usuario no autenticado.");
        return;
    }

    // Buscar el documento del usuario en Firestore
    const userQuery = query(collection(db, "user_app"), where("email", "==", user.email));
    const querySnapshot = await getDocs(userQuery);

    if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userRef = doc(db, "user_app", userDoc.id);

        await updateDoc(userRef, {
            tipo_suscripcion: "usuario",
        });

        let message= "Your subscription has been successfully cancelled"
        sendEmail(user.email, message, "Suscription cancelled!")
        Swal.fire({
            title: "Cancelled subscription!",
            icon: "success",
            confirmButtonColor: "#d51313",
            confirmButtonText: "Ok"
        })
    } else {
        console.error("No se encontró el usuario en Firestore.");
    }
}


function showPaymentForm(plan, price, tipo, periodo) {
    const form = document.getElementById('payment-form');
    document.getElementById('form-title').innerText = `Pago - Plan ${plan} (${price})`;
    form.style.display = 'block';

    // Guardamos el tipo elegido para luego usarlo en el submit
    form.dataset.tipoSuscripcion = tipo;
    form.dataset.tipoRenovacion = periodo;
}
window.showPaymentForm = showPaymentForm;
window.cancelarSuscripcion = cancelarSuscripcion;

function sendEmail(email, message, title) {
    emailjs.init('CTnfkkYqegWMlezAo');
    const params = {
        email: email,
        message: message,
        title: title
    };
    emailjs.send('service_cmud1pq', 'template_ckg59mk', params)
        .then(function(response) {
            console.log(response)

        }, function(error) {
            alert('Error al enviar el correo');
            console.log(error);
        });
}
