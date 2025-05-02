import {collection, query, where, getDocs }  from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import {db, auth} from "../firebase_config.js";
import {onAuthStateChanged} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

export async function getUserProfile() {
    const user = await new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            unsubscribe(); // Nos desuscribimos inmediatamente
            if (firebaseUser) resolve(firebaseUser);
            else reject("No hay usuario autenticado");
        });
    });

    console.log("Usuario Firebase:", user);

    const userQuery = query(
        collection(db, "user_app"),
        where("email", "==", user.email)
    );

    const querySnapshot = await getDocs(userQuery);

    if (!querySnapshot.empty) {
        return {
            id: querySnapshot.docs[0].id,
            ...querySnapshot.docs[0].data()
        };
    } else {
        console.warn("Perfil no encontrado en Firestore");
        return null;
    }
}