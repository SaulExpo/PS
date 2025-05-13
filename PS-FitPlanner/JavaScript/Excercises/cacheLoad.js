
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { db } from "../firebase_config.js";

/**
 * Obtiene una colección con cache en localStorage.
 * @param {string} collName Nombre de la colección en Firestore.
 * @param {number} [ttlMinutes] Tiempo en minutos para expirar el cache (por defecto, 60 min).
 * @returns {Promise<Array<object>>} Array de documentos (data()).
 */
export async function getCollectionCached(collName, ttlMinutes = 60) {
    const key       = `cache_${collName}`;
    const metaKey   = `${key}_meta`;
    const now       = Date.now();
    const metaJson  = localStorage.getItem(metaKey);
    if (metaJson) {
        const { timestamp } = JSON.parse(metaJson);
        // Si no ha expirado:
        if (now - timestamp < ttlMinutes * 60_000) {
            const dataJson = localStorage.getItem(key);
            if (dataJson) {
                return JSON.parse(dataJson);
            }
        }
    }
    // Si llega aquí, o no hay cache, o ha expirado:
    const snap = await getDocs(collection(db, collName));
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    localStorage.setItem(key, JSON.stringify(docs));
    localStorage.setItem(metaKey, JSON.stringify({ timestamp: now }));
    return docs;
}
