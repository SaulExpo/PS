import { getUserProfile } from "../GetDB/getUser.js";
import { getCollectionCached } from "./cacheLoad.js";

export async function loadObjectiveRecommendations() {
    const user = await getUserProfile();
    if (!user.objetivo) return;

    const objetivo = user.objetivo.toLowerCase();
    const isWeightLoss = /pérdida.*peso|weight loss/i.test(objetivo);
    const isUpper = /upper body|parte superior/i.test(objetivo);
    const isLower = /lower body|parte inferior/i.test(objetivo);
    const isIntermediate = /intermedio|intermediate/i.test(objetivo);
    const isAdvanced = /avanzado|advanced/i.test(objetivo);
    const allRoutines = await getCollectionCached("routines");
    const filtered = allRoutines.filter(r => {
        let match = true;
        if (isWeightLoss)        match = ["fullbody", "cardio"].includes(r.type);
        else if (isUpper)        match = r.type === "upperbody";
        else if (isLower)        match = r.type === "lowerbody";

        if (isIntermediate)      match = match && r.level === "intermediate";
        if (isAdvanced)          match = match && r.level === "advanced";

        return match;
    });

    if (filtered.length === 0) return;

    shuffle(filtered);
    const picks = filtered.slice(0, 3);

    const section = document.createElement("section");
    section.innerHTML = `
    <h2 class="title"></h2>
    <div class="card">
      <div class="container" id="Meet your goals">
        <div class="content"></div>
      </div>
    </div>
  `;
    const contentDiv = section.querySelector(".content");
    picks.forEach(r => {
        const a = document.createElement("a");
        a.textContent = r.name;
        // paso el id o nombre por query string. En rutine.html lees ese parámetro.
        a.href = `rutine.html?routine=${encodeURIComponent(r.id || r.name)}`;
        contentDiv.appendChild(a);
    });

    const firstWrapper = document.querySelector(".first");
    firstWrapper.appendChild(section);
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}
