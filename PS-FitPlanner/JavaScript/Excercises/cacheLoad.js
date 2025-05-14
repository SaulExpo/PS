import { collection, getDocs, getDoc, doc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { db } from "../firebase_config.js";

/**
 * Obtiene una colección con cache en localStorage.
 * @param {string} collName
 * @param {number} ttlMinutes
 */
export async function getCollectionCached(collName, ttlMinutes = 60) {
    const key     = `cache_${collName}`;
    const metaKey = `${key}_meta`;
    const now     = Date.now();

    const metaJson = localStorage.getItem(metaKey);
    if (metaJson) {
        const { timestamp } = JSON.parse(metaJson);
        if (now - timestamp < ttlMinutes * 60_000) {
            const dataJson = localStorage.getItem(key);
            if (dataJson) return JSON.parse(dataJson);
        }
    }

    // refrescar
    const snap = await getDocs(collection(db, collName));
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    localStorage.setItem(key, JSON.stringify(docs));
    localStorage.setItem(metaKey, JSON.stringify({ timestamp: now }));
    return docs;
}

/**
 * Opcional: obtener un documento individual con caché.
 * @param {string} collName
 * @param {string} docId
 * @param {number} ttlMinutes
 */
export async function getDocCached(collName, docId, ttlMinutes = 60) {
    const key     = `cache_${collName}_${docId}`;
    const metaKey = `${key}_meta`;
    const now     = Date.now();

    const metaJson = localStorage.getItem(metaKey);
    if (metaJson) {
        const { timestamp } = JSON.parse(metaJson);
        if (now - timestamp < ttlMinutes * 60_000) {
            const dataJson = localStorage.getItem(key);
            if (dataJson) return JSON.parse(dataJson);
        }
    }

    const snap = await getDoc(doc(db, collName, docId));
    const data = snap.exists() ? { id: snap.id, ...snap.data() } : null;
    if (data) {
        localStorage.setItem(key, JSON.stringify(data));
        localStorage.setItem(metaKey, JSON.stringify({ timestamp: now }));
    }
    return data;
}
