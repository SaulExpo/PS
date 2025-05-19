// objective_recommendations_fixed.js
import { getUserProfile } from "../GetDB/getUser.js";
import { getCollectionCached } from "./cacheLoad.js";

export async function loadObjectiveRecommendations() {
    const user = await getUserProfile();
    if (!user.objetivo) return;

    const objetivo = user.objetivo.toLowerCase();

    // Mapeo claro de tipos según objetivo
    const typeMap = [
        { keywords: ["pérdida de peso", "weight loss"], types: ["full_body"] },
        { keywords: ["upper body", "tren superior"], types: ["push"] },
        { keywords: ["lower body", "tren inferior"], types: ["legs"] }
    ];

    // Mapeo claro de niveles
    const levelMap = [
        { keywords: ["intermedio", "intermediate"], level: "intermediate" },
        { keywords: ["avanzado",  "advanced"],   level: "advanced"   }
    ];

    // Determinar tipos a filtrar
    let selectedTypes = [];
    typeMap.forEach(entry => {
        entry.keywords.forEach(kw => {
            if (objetivo.includes(kw)) selectedTypes.push(...entry.types);
        });
    });

    // Determinar nivel a filtrar (sólo uno a la vez)
    let selectedLevel = null;
    for (const entry of levelMap) {
        if (entry.keywords.some(kw => objetivo.includes(kw))) {
            selectedLevel = entry.level;
            break;
        }
    }

    const allRoutines = await getCollectionCached("routines");
    const filtered = allRoutines.filter(r => {
        // Filtrar por tipo de rutina (campo routineType)
        if (selectedTypes.length && !selectedTypes.includes(r.routineType)) return false;
        // Filtrar por nivel si se especifica
        if (selectedLevel && r.level !== selectedLevel) return false;
        return true;
    });

    if (!filtered.length) return;

    shuffle(filtered);
    const picks = filtered.slice(0, 3);

    const section = document.createElement("section");
    section.innerHTML = `
    <h2 class="title">Meet your goals</h2>
    <div class="card">
      <img
        src="../Resources/maquina.png"
        alt="Meet your goals"
        class="card-image"
      />
      <div class="container" id="meet-your-goals">
        <div class="content"></div>
      </div>
    </div>
  `;

    const contentDiv = section.querySelector(".content");
    picks.forEach(r => {
        const a = document.createElement("a");
        a.textContent = r.name;
        a.href = `rutine.html?routine=${encodeURIComponent(r.id)}`;
        contentDiv.appendChild(a);
    });

    document.querySelector(".first").appendChild(section);
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}
