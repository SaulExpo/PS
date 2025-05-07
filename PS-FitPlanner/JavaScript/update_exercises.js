const fs    = require('fs');
const path  = require('path');
const fetch = require('node-fetch');
const admin = require('firebase-admin');

const serviceAccount = require('../JSON/serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

const BODY_PARTS = [/*…*/];
const outputDir = path.join(__dirname, '..', 'JSON');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

async function getExercisesByBodyPart(bodyPart) {
    const url = `https://…/bodyPart/${encodeURIComponent(bodyPart)}`;
    const options = {};

    const res    = await fetch(url, options);
    const result = await res.json();

    const filePath = path.join(outputDir, `exercises_${bodyPart.replace(/ /g,'_')}.json`);
    fs.writeFileSync(filePath, JSON.stringify(result, null, 2));

    // sube a Firestore
    const collName = `exercises_${bodyPart.replace(/ /g, '_')}`;
    const batch    = db.batch();
    result.forEach(ej => {
        const ref = db.collection(collName).doc(ej.id.toString());
        batch.set(ref, ej);
    });
    await batch.commit();
}

(async () => {
    for (const part of BODY_PARTS) {
        await getExercisesByBodyPart(part);
    }
    console.log('¡Listo!');
})();
