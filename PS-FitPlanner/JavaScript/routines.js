import {loadHeader} from "./GlobalLoad/loadHeader.js";
import {getUserProfile} from "./GetDB/getUser.js";

export async function load() {




    loadHeader()
    let language = localStorage.getItem("language")
    let json_language
    if (language == "english") {
        json_language = "../JSON/english_data.json"
    } else {
        json_language = "../JSON/data.json"
    }
    fetch(json_language).then(function (res) {
        return res.json();
    })
        .then(function (json) {
            setTimeout(() => {
                document.querySelectorAll(".prueba")[0].textContent = json.rutine.prueba;
                document.querySelectorAll(".info")[1].textContent = json.first_page.calendar
                document.querySelectorAll("#picture")[0].src = json.first_page.today_img;
                document.querySelectorAll("#picture")[1].src = json.first_page.calendar_img;
                document.querySelectorAll("#picture")[1].addEventListener("click", () => {
                    location.replace("../Pages/calendar.html")
                })
            }, 100);


        })
    loadFooter()
}