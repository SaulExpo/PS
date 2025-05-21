export async function supplementsLanguage() {
    let language = localStorage.getItem("language");
    let json_language = language === "english"
        ? "../JSON/English/supplementsEnglish.json"
        : "../JSON/Español/supplementsEspañol.json"
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

