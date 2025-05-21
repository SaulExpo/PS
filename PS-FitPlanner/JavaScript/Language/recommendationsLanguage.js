export async function recommendationsLanguage() {
    let language = localStorage.getItem("language");
    let json_language = language === "english"
        ? "../JSON/English/recommendationsEnglish.json"
        : "../JSON/Español/recommendationsEspañol.json"
    fetch(json_language)
        .then(function (res) {
            return res.json();
        })
        .then(function (json) {
            console.log(json);
            document.getElementById("title").textContent = json.title
            document.getElementById("text").textContent = json.text
            document.getElementById("o1").textContent = json.o1
            document.querySelectorAll(".o2").forEach((element) => {element.textContent = json.o2})
            document.querySelectorAll(".o3").forEach((element) => {element.textContent = json.o3})
            document.querySelectorAll(".o4").forEach((element) => {element.textContent = json.o4})
            document.querySelectorAll(".o5").forEach((element) => {element.textContent = json.o5})
            document.querySelectorAll(".o6").forEach((element) => {element.textContent = json.o6})
            document.getElementById("o7").textContent = json.o7
            document.getElementById("new").textContent = json.new
            document.getElementById("nombre").placeholder = json.nombre
            document.getElementById("enlace").placeholder = json.enlace
            document.getElementById("imagen").placeholder = json.imagen
            document.getElementById("descripcion").placeholder = json.descripcion
            document.getElementById("publicar").textContent = json.publicar
            document.getElementById("update").textContent = json.update
            document.getElementById("cancel").textContent = json.cancel
        })
        .catch(function (err) {
            console.error("Error cargando JSON:", err);
        });
}

