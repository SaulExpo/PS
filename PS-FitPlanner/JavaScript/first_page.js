import {loadHeader} from "./GlobalLoad/loadHeader.js";
import {getUserProfile} from "./GetDB/getUser.js";
import { db } from "./firebase_config.js";
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import Swal from 'https://cdn.skypack.dev/sweetalert2';
import {getCollectionCached} from "./Excercises/cacheLoad.js";
import {first_pageLanguage} from "./Language/first_pageLanguage.js";


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

export async function load() {

    if (localStorage.getItem("jwt")) {
        const user = await getUserProfile();
        document.getElementById("calendar").addEventListener("click", function (e) {
            if (user.tipo_suscripcion == "usuario") {
                e.preventDefault();
                Swal.fire({
                    title: "You must subscribe!",
                    icon: "warning",
                    confirmButtonColor: "#d51313",
                    confirmButtonText: "Ok"
                })
            }
        });
    }

    await loadHeader();
    await loadFooter();
    await first_pageLanguage()
    const picks = await loadRecommendations(); // Espera los resultados

    const ul = document.createElement("ul");
    ul.id = "recommendations-list";

    picks.forEach(function (name) {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.textContent = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
        a.href = "exercise_detail.html?name=" + encodeURIComponent(name);
        li.appendChild(a);
        ul.appendChild(li);
    });
    console.log(picks)
    console.log(document.getElementById("recommendations"));
    console.log(ul)
    document.getElementById("recommendations").appendChild(ul);


    async function loadRecommendations() {
        console.log("A")
        const all = [];
        for (const coll of exerciseCollections) {
            const docs = await getCollectionCached(coll);
            docs.forEach(d => all.push(d.name));
        }
        shuffle(all);
        return all.slice(0, 3);
    }


    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    const user = await getUserProfile()
    console.log(user)
}
