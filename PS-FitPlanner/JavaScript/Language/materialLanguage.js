export async function materialLanguage() {
    let language = localStorage.getItem("language");
    let json_language = language === "english"
        ? "../JSON/English/materialEnglish.json"
        : "../JSON/Español/materialEspañol.json"
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

