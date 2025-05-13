import { db } from "../firebase_config.js";

import {collection, getDocs} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import {getCollectionCached} from "./cacheLoad.js";

const exerciseCollections = [
    "exercises_back",
    "exercises_cardio",
    "exercises_chest",
    "exercises_lower_arms",
    "exercises_lower_legs",
    "exercises_neck",
    "exercises_shoulders",
    "exercises_upper_arms",
    "exercises_upper_legs",
    "exercises_waist",
];

function getQueryParam(param) {
    return new URLSearchParams(window.location.search).get(param);
}

export async function loadExerciseDetail() {
    const nameParam = getQueryParam("name");
    if (!nameParam) {
        document.getElementById("exercise-name").textContent = "Nombre no especificado.";
        return;
    }

    let foundExercise = null;
    let foundCollection = null;

    for (const collName of exerciseCollections) {
        const docs = await getCollectionCached(collName);
        for (const data of docs) {
            if (data.name.toLowerCase() === nameParam.toLowerCase()) {
                foundExercise = data;
                foundCollection = collName;
            }
        }
        if (foundExercise) break;
    }

    if (!foundExercise) {
        document.getElementById("exercise-name").textContent = "Ejercicio no encontrado.";
        return;
    }

    const images = await getCollectionCached("exercises_images");
    const imageDoc = images.find(doc => Boolean(doc[foundCollection]));
    const imageUrl = imageDoc ? imageDoc[foundCollection] : "";

    const imgEl = document.getElementById("exercise-image");
    imgEl.src = imageUrl;
    imgEl.alt = foundExercise.name;


    document.getElementById("exercise-image").src = imageUrl;
    document.getElementById("exercise-image").alt = foundExercise.name;

    document.getElementById("exercise-name").textContent = foundExercise.name.toUpperCase();
    document.getElementById("body-part").innerHTML = `<strong>Body Part:</strong> ${foundExercise.bodyPart}`;
    document.getElementById("equipment").innerHTML = `<strong>Equipment:</strong> ${foundExercise.equipment}`;
    document.getElementById("target").innerHTML = `<strong>Primary Muscle:</strong> ${foundExercise.target}`;
    document.getElementById("secondary-muscles").innerHTML = `<strong>Secondary Muscles:</strong> ${foundExercise.secondaryMuscles.join(", ")}`;

    const instructionsList = document.getElementById("instructions");
    instructionsList.innerHTML = "";
    foundExercise.instructions.forEach(step => {
        const li = document.createElement("li");
        li.textContent = step;
        instructionsList.appendChild(li);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadExerciseDetail();
    import("../GlobalLoad/loadHeader.js").then(m => m.loadHeader());
    import("../GlobalLoad/loadFooter.js").then(m => m.loadFooter());
});
