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

    let language = localStorage.getItem("language");
    let json_language = language === "english"
        ? "../JSON/english_data.json"
        : "../JSON/data.json";

    fetch(json_language)
        .then(function (res) {
            return res.json();
        })
        .then(function (json) {
                document.querySelectorAll(".info")[0].textContent = json.first_page.today;
                document.querySelectorAll(".info")[1].textContent = json.first_page.calendar;
                document.querySelectorAll("#picture")[0].src = json.first_page.today_img;
                document.querySelectorAll("#picture")[1].src = json.first_page.calendar_img;
                document.querySelectorAll("#picture")[1].addEventListener("click", () => {
                    location.replace("../Pages/calendar.html");
                });

                document.querySelectorAll("#picture")[2].src = json.first_page.recommendations_image;
                document.querySelectorAll("#picture")[2].alt = "Recommendations";
                document.querySelectorAll(".info")[2].innerHTML = "";
                loadRecommendations().then(function (picks) {
                    var ul = document.createElement("ul");
                    ul.id = "recommendations-list";

                    picks.forEach(function (name) {
                        var li = document.createElement("li");
                        var a = document.createElement("a");
                        a.textContent = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
                        a.href = "exercise_detail.html?name=" + encodeURIComponent(name);
                        li.appendChild(a);
                        ul.appendChild(li);
                    });

                    document.querySelectorAll(".info")[2].appendChild(ul);
                });
        })
        .catch(function (err) {
            console.error("Error cargando JSON:", err);
        });

    async function loadRecommendations() {
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
