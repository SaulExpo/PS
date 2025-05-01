document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById('register-form');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // 1) Recogemos valores del formulario
        const name     = document.getElementById('name').value.trim();
        const surname  = document.getElementById('surname').value.trim();
        const email    = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        try {
            // 2) Creamos el usuario en Firebase Auth
            const userCred = await auth.createUserWithEmailAndPassword(email, password);
            console.log('Usuario creado:', userCred.user.uid);

            // 3) Ajustamos el displayName (nombre completo)
            await userCred.user.updateProfile({
                displayName: `${name} ${surname}`
            });
            console.log('Perfil actualizado');

            // 4) (Opcional) Guardamos datos extra en Firestore
            await db.collection('users')
                .doc(userCred.user.uid)
                .set({
                    name,
                    surname,
                    email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            console.log('Datos adicionales almacenados en Firestore');

            window.location.href = '../Pages/first_page.html';

        } catch (err) {
            console.error('Error en registro:', err);
            alert(err.message);
        }
    });
});
