import {getUserProfile} from "../GetDB/getUser.js";
import {doc, serverTimestamp, setDoc} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import {db} from "../firebase_config.js";
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("editProfileForm").addEventListener('submit', async function(e) {
        e.preventDefault();
        await getUserProfile().then(async user => {
            const name = document.getElementById('editProfileName').value;
            const surname = document.getElementById('editProfileSurname').value;
            const email = document.getElementById('editProfileEmail').value;
            const edad = document.getElementById('editProfileEdad').value;
            const peso = document.getElementById('editProfilePeso').value;
            const altura = document.getElementById('editProfileAltura').value;
            const genero = document.getElementById('editProfileGenero').value;
            console.log(user.uid)
            const userRef = doc(db, "user_app", user.uid);
            await setDoc(userRef, {
                name: name,
                surname: surname,
                email: email,
                edad: edad,
                peso: peso,
                altura: altura,
                genero: genero
            }, {merge: true});
        })
        window.location.href="../../Pages/profile.html";
    })
});