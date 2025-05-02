import {collection, getDocs, doc, deleteDoc, addDoc, serverTimestamp, query, updateDoc, where} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { db } from "../firebase_config.js";

export async function getRoutines() {
    try {
        const routinesSnapshot = await getDocs(collection(db, "routines"));
        return routinesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error obteniendo las rutinas:", error);
    }
}


export async function getUserRoutines(email) {
    try {
        const q = query(collection(db, "user_routine"), where("user_app.email", "==", email));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error obteniendo rutinas del usuario:", error);
    }
}

export async function addUserRoutine(user, rutine, date) {
    try {
        const formData = {
            user_app: user,
            rutine: rutine,
            date: date,
            createdAt: serverTimestamp()
        };
        console.log(formData);

        await addDoc(collection(db, "user_routine"), formData);
        location.reload();
    } catch (error) {
        console.error("Error al añadir rutina:", error);
    }
}

export async function editUserRoutine(user, rutine, date, docId) {
    try {
        const routineRef = doc(db, "user_routine", docId);
        await updateDoc(routineRef, {
            user_app: user,
            rutine: rutine,
            date: date
        });
        location.reload();
    } catch (error) {
        console.error("Error al editar rutina:", error);
    }
}

export async function deleteUserRoutine(docId) {
    try {
        await deleteDoc(doc(db, "user_routine", docId));
        location.reload();
    } catch (error) {
        console.error("Error al eliminar rutina:", error);
    }
}
