export async function chatsLanguage() {
    let language = localStorage.getItem("language");
    let json_language = language === "english"
        ? "../JSON/English/chatsEnglish.json"
        : "../JSON/Español/chatsEspañol.json"
    fetch(json_language)
        .then(function (res) {
            return res.json();
        })
        .then(function (json) {
            console.log(json);
            document.getElementById("cerrados").textContent = json.close
            document.getElementById("abiertos").textContent = json.open
            document.getElementById("favoritos").textContent = json.favourites
            document.getElementById("nofavoritos").textContent = json.nofavourites
            document.getElementById("firstOption").textContent = json.option
            document.getElementById("StartChat").textContent = json.start
            document.getElementById("buscador").placeholder = json.search
            document.getElementById("select").textContent = json.select
        })
        .catch(function (err) {
            console.error("Error cargando JSON:", err);
        });
}