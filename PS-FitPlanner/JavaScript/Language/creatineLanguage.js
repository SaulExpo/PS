export async function creatineLanguage() {
    let language = localStorage.getItem("language");
    let json_language = language === "english"
        ? "../JSON/English/creatineEnglish.json"
        : "../JSON/Español/creatineEspañol.json"
    fetch(json_language)
        .then(function (res) {
            return res.json();
        })
        .then(function (json) {
            console.log(json);
            document.getElementById("title").textContent = json.title
            document.getElementById("text").textContent = json.text
        })
        .catch(function (err) {
            console.error("Error cargando JSON:", err);
        });
}

