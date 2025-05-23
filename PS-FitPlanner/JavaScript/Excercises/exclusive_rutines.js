const { admin, db } = require('../firebase_admin.js'); // Adjust path to your admin module

async function seedExclusiveRoutines() {
    const groups = [
        "cardio",
        "chest",
        "lower_arms",
        "lower_legs",
        "neck",
        "shoulders",
        "upper_arms",
        "upper_legs",
        "waist",
        "back"
    ];

    console.log("🎬 Starting exclusive routines seed...");

    for (const group of groups) {
        const colName = `exercises_${group}`;
        const snap = await db.collection(colName).get();
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const chosen = docs
            .sort(() => 0.5 - Math.random())
            .slice(0, 4)
            .map(d => ({
                id: d.id,
                bodyPart: group,
                name: d.name,
                reps: "4x12"
            }));

        const routineDoc = {
            name: `${group.charAt(0).toUpperCase() + group.slice(1)} Elite Routine`,
            routineType: group,
            description: `Elite ${group} routine: high-intensity program for strength and definition.`,
            exclusiveDescription: `This advanced ${group} program focuses on maximizing hypertrophy and functional performance.`,
            duration: `${20 + Math.floor(Math.random() * 11)} mins`, // 20–30 mins
            rest: `${1 + Math.floor(Math.random() * 2)}`,           // 1–2 mins
            exercises: chosen,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        try {
            const ref = await db.collection("exclusive_routines").add(routineDoc);
            console.log(`✔ Routine "${routineDoc.name}" created (ID: ${ref.id})`);
        } catch (err) {
            console.error(`✖ Error creating "${routineDoc.name}":`, err);
        }
    }

    console.log("Exclusive routines seed completed.");
    process.exit(0);
}

seedExclusiveRoutines().catch(err => {
    console.error("Error running seedExclusiveRoutines:", err);
    process.exit(1);
});
