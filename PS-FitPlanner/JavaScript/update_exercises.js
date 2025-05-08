import { db } from "./firebase_config.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

let body_parts;
body_parts = [
"back",
    "cardio",
    "chest",
    "lower arms",
    "lower legs",
    "neck",
    "shoulders",
    "upper arms",
    "upper legs",
    "waist"
];


const baseUrl = 'https://exercisedb.p.rapidapi.com/exercises/bodyPart';
const fetchOptions = {
    method: 'GET',
    headers: {
        'x-rapidapi-key': '002e9eeff7msh94fe3ba3c69eb11p1809a1jsnd6873efe76cc',
        'x-rapidapi-host': 'exercisedb.p.rapidapi.com'
    }
};

async function uploadExercises() {
    for (const part of body_parts) {
        console.log(`Fetching exercises for: ${part}`);
        try {
            const url = `${baseUrl}/${encodeURIComponent(part)}`;
            const response = await fetch(url, fetchOptions);
            if (!response.ok) {
                console.error(`Error fetching ${part}: ${response.status} ${response.statusText}`);
                continue;
            }
            const exercises = await response.json();

            const collName = `exercises_${part.replace(/\s+/g, "_")}`;
            for (const ex of exercises) {
                const docRef = doc(db, collName, ex.id.toString());
                ex.uploadedAt = serverTimestamp();
                await setDoc(docRef, ex, { merge: true });
            }
            console.log(`Uploaded ${exercises.length} exercises for ${part}`);
        } catch (err) {
            console.error(`Upload error for ${part}:`, err);
        }
    }
    console.log("All exercises have been uploaded successfully.");
}

uploadExercises().catch(err => console.error('Critical upload error:', err));
