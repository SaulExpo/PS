export async function first_pageLanguage() {
    let language = localStorage.getItem("language");
    let json_language = language === "english"
        ? "../JSON/English/first_pageEnglish.json"
        : "../JSON/Español/first_pageEspañol.json"
    fetch(json_language)
        .then(function (res) {
            return res.json();
        })
        .then(function (json) {
            console.log(json);
            document.querySelectorAll(".info")[0].textContent = json.first_page.today;
            document.querySelectorAll(".info")[1].textContent = json.first_page.calendar;
            document.querySelectorAll("#picture")[1].addEventListener("click", () => {
                location.replace("../Pages/calendar.html");
            });
            console.log(document.querySelectorAll("#picture"))
            document.getElementById("ejercicios").textContent = json.first_page.recommendations_title
            document.getElementById("calendar").textContent = json.first_page.calendar_title
            document.querySelectorAll(".title")[0].textContent = json.first_page.today_title
        })
        .catch(function (err) {
            console.error("Error cargando JSON:", err);
        });
}