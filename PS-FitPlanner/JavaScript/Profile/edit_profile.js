import {getUserProfile} from "../GetDB/getUser.js";
import {doc, serverTimestamp, setDoc} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import {db} from "../firebase_config.js";
document.addEventListener("DOMContentLoaded", async function () {
    const user = await getUserProfile()
    const name = document.getElementById('editProfileName')
    const surname = document.getElementById('editProfileSurname')
    const email = document.getElementById('editProfileEmail')
    const edad = document.getElementById('editProfileEdad')
    const peso = document.getElementById('editProfilePeso')
    const altura = document.getElementById('editProfileAltura')
    const genero = document.getElementById('editProfileGenero')
    name.value = user.name
    surname.value = user.surname
    email.value = user.email
    edad.value = user.edad
    peso.value = user.peso
    altura.value = user.altura
    genero.value = user.genero
    document.getElementById("editProfileForm").addEventListener('submit', async function (e) {
        e.preventDefault();

        console.log(user.uid)
        const userRef = doc(db, "user_app", user.uid);
        await setDoc(userRef, {
            name: name.value,
            surname: surname.value,
            email: email.value,
            edad: edad.value,
            peso: peso.value,
            altura: altura.value,
            genero: genero.value
        }, {merge: true});
        window.location.href = "../Pages/profile.html";
    })

});