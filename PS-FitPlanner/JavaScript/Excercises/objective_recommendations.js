import { getUserProfile } from "../GetDB/getUser.js";
import { getCollectionCached } from "./cacheLoad.js";
import { translateText } from "../translate.js";

export async function loadObjectiveRecommendations() {
    const user = await getUserProfile();
    if (!user.objetivo) return;

    const objetivo = user.objetivo.toLowerCase();

    const language = localStorage.getItem("language") || "spanish";
    const titleText = language === "spanish"
        ? "Cumple tus objetivos"
        : "Meet your goals";
    const imgAlt = titleText;

    const typeMap = [
        { keywords: ["pérdida de peso", "weight loss"], types: ["fullbody", "cardio"] },
        { keywords: ["upper body", "tren superior"], types: ["upperbody"] },
        { keywords: ["lower body", "tren inferior"], types: ["lowerbody"] }
    ];
    const levelMap = [
        { keywords: ["intermedio", "intermediate"], level: "intermediate" },
        { keywords: ["avanzado", "advanced"],     level: "advanced"     }
    ];

    let selectedTypes = [];
    typeMap.forEach(entry => {
        entry.keywords.forEach(kw => {
            if (objetivo.includes(kw)) selectedTypes.push(...entry.types);
        });
    });

    let selectedLevel = null;
    for (const entry of levelMap) {
        if (entry.keywords.some(kw => objetivo.includes(kw))) {
            selectedLevel = entry.level;
            break;
        }
    }

    const allRoutines = await getCollectionCached("routines");
    const filtered = allRoutines.filter(r => {
        if (selectedTypes.length && !selectedTypes.includes(r.routineType)) return false;
        if (selectedLevel && r.level !== selectedLevel)             return false;
        return true;
    });
    if (!filtered.length) return;

    shuffle(filtered);
    const picks = filtered.slice(0, 3);

    const section = document.createElement("section");
    section.innerHTML = `
      <h2 class="title">${titleText}</h2>
      <div class="card">
        <img
          src="../Resources/maquina.png"
          alt="${imgAlt}"
          class="card-image"
        />
        <div class="container" id="meet-your-goals">
          <div class="content"></div>
        </div>
      </div>
    `;

    const contentDiv = section.querySelector(".content");
    for (const r of picks) {
        const a = document.createElement("a");
        const nameText = language === "spanish"
            ? await translateText(r.name, "es")
            : r.name;
        a.textContent = nameText;
        a.href = `rutine.html?routine=${encodeURIComponent(r.id)}`;
        contentDiv.appendChild(a);
    }

    document.querySelector(".first").appendChild(section);
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}
