export async function routinesLanguage() {
    let language = localStorage.getItem("language");
    let json_language = language === "english"
        ? "../JSON/English/routinesEnglish.json"
        : "../JSON/Español/routinesEspañol.json"
    fetch(json_language)
        .then(function (res) {
            return res.json();
        })
        .then(function (json) {
            console.log(json);
            document.getElementById("prueba").textContent = json.prueba
            document.getElementById("routine").textContent = json.routine
            document.getElementById("option2").textContent = json.option2
            document.getElementById("search").textContent = json.search
            document.getElementById("globalSearch").placeholder = json.globalSearch
            document.getElementById("option3").textContent = json.option3
            document.getElementById("title").textContent = json.title
            document.getElementById("info").textContent = json.info
            document.getElementById("duration").textContent = json.duration
            document.getElementById("rest").textContent = json.rest
        })
        .catch(function (err) {
            console.error("Error cargando JSON:", err);
        });
}