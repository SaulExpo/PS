const admin = require('firebase-admin');


const productos = require('../../../JSON/material_deportivo.json');
const serviceAccount = require('./service_account.json');


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function subirProductos() {
    const grupoRef = db.collection("tienda").doc("materialDeportivo").collection("productos");

    for (const producto of productos) {
        await grupoRef.add(producto);
        console.log(`✅ Producto subido: ${producto.name}`);
    }

    console.log("🎉 Todos los productos han sido subidos.");
}

subirProductos().catch(console.error);
