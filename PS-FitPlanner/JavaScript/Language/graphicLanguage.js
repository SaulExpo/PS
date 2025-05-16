export async function graphicLanguage() {
    let language = localStorage.getItem("language");
    let json_language = language === "english"
        ? "../JSON/English/graphicEnglish.json"
        : "../JSON/Español/graphicEspañol.json"
    fetch(json_language)
        .then(function (res) {
            return res.json();
        })
        .then(function (json) {
            console.log(json);
            document.getElementById("month").textContent = json.month
            document.getElementById("last").textContent = json.last
            document.getElementById("download").textContent = json.download
        })
        .catch(function (err) {
            console.error("Error cargando JSON:", err);
        });
}