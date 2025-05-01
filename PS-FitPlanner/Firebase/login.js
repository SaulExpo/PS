// Firebase/login.js

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');

    form.addEventListener('submit', async e => {
        e.preventDefault();

        // 1) Tomamos los valores según los IDs del HTML
        const email    = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        try {
            // 2) Intentamos el login en Firebase Auth
            const userCred = await auth.signInWithEmailAndPassword(email, password);
            console.log('Usuario logueado:', userCred.user.uid);

            // 3) (Opcional) Guardar token en localStorage
            const token = await userCred.user.getIdToken();
            localStorage.setItem('jwt', token);

            // 4) Redirigir a página protegida
            alert('¡Bienvenido de vuelta!');
            window.location.href = 'first_page.html';
        } catch (err) {
            console.error('Error en login:', err);
            alert(`Error al iniciar sesión: ${err.message}`);
        }
    });
});
