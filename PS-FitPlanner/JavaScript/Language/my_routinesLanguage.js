export async function myRoutinesLanguage() {
    let language = localStorage.getItem("language");
    let json_language = language === "english"
        ? "../JSON/English/my_routinesEnglish.json"
        : "../JSON/Español/my_routinesEspañol.json"
    fetch(json_language)
        .then(function (res) {
            return res.json();
        })
        .then(function (json) {
            console.log(json);
            document.getElementById("myRoutines").textContent = json.myRoutines
            document.getElementById("create").textContent = json.create
        })
        .catch(function (err) {
            console.error("Error cargando JSON:", err);
        });
}