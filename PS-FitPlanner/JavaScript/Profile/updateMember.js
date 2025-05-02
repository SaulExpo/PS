import {getFirestore, doc, updateDoc, collection, query, where, getDocs, serverTimestamp} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import {auth, db} from "../firebase_config.js";

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("fake-payment-form").addEventListener("submit", async function(e) {
        e.preventDefault();
        const tipo = document.getElementById('payment-form').dataset.tipoSuscripcion;

        await actualizarSuscripcion(tipo);
        document.getElementById('payment-form').style.display = 'none';
    });
});


async function actualizarSuscripcion(tipo) {
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
            tipo_suscripcion: tipo,  // Por ejemplo: 'miembro' o 'miembro superior'
            inicio_suscripcion: serverTimestamp(),
        });
        let message = "Gracias por comprar una suscripción a nuestra web.\n" +
            "\n" +
            "Usted se ha registrado como " + tipo + " para contar con nuevas características";
        let title = "Suscripción Actualizada!"
        sendEmail(user.email, message, title)

    } else {
        console.error("No se encontró el usuario en Firestore.");
    }
}

async function renovarSuscripcion() {
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
        let message= "Su suscripción ha sido renovada con éxito con fecha de inicio: " + time.toLocaleString('es-ES')
            + " dispone de 30 días hábiles con su suscripcíón"
        sendEmail(user.email, message, "Suscripción Renovada!")
        alert("Suscripción renovada")

    } else {
        console.error("No se encontró el usuario en Firestore.");
    }
}

function showPaymentForm(plan, price, tipo) {
    const form = document.getElementById('payment-form');
    document.getElementById('form-title').innerText = `Pago - Plan ${plan} (${price})`;
    form.style.display = 'block';

    // Guardamos el tipo elegido para luego usarlo en el submit
    form.dataset.tipoSuscripcion = tipo;
}
window.showPaymentForm = showPaymentForm;
window.renovarSuscripcion = renovarSuscripcion;

function sendEmail(email, message, title) {
    emailjs.init('CTnfkkYqegWMlezAo'); // Reemplaza con tu public key de EmailJS
    const params = {
        email: email,
        message: message,
        title: title
    };
    emailjs.send('service_cmud1pq', 'template_ckg59mk', params)
        .then(function(response) {
            console.log(response)
            alert('Correo enviado con éxito');
        }, function(error) {
            alert('Error al enviar el correo');
            console.log(error);
        });
}
