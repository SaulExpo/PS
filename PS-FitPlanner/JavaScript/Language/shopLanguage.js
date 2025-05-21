export async function shopLanguage() {
    let language = localStorage.getItem("language");
    let json_language = language === "english"
        ? "../JSON/English/shopEnglish.json"
        : "../JSON/Español/shopEspañol.json"
    fetch(json_language)
        .then(function (res) {
            return res.json();
        })
        .then(function (json) {
            console.log(json);
            document.getElementById("title1").textContent = json.title1
            document.getElementById("title2").textContent = json.title2
            document.getElementById("supliers").textContent = json.supliers
            document.getElementById("protein").textContent = json.protein
            document.getElementById("creatine").textContent = json.creatine
            document.getElementById("material").textContent = json.material
            document.getElementById("recommendations").textContent = json.recommendations
        })
        .catch(function (err) {
            console.error("Error cargando JSON:", err);
        });
}

