export async function loginLanguage() {
    let language = localStorage.getItem("language");
    let json_language = language === "english"
        ? "../JSON/English/loginEnglish.json"
        : "../JSON/Español/loginEspañol.json"
    fetch(json_language)
        .then(function (res) {
            return res.json();
        })
        .then(function (json) {
            console.log(json);
            document.getElementById("title").textContent = json.title
            document.getElementById("password").placeholder = json.password
            document.getElementById("forgot").textContent = json.forgot
            document.getElementById("log").value = json.log
        })
        .catch(function (err) {
            console.error("Error cargando JSON:", err);
        });
}