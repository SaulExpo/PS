export async function registerLanguage() {
    let language = localStorage.getItem("language");
    let json_language = language === "english"
        ? "../JSON/English/registerEnglish.json"
        : "../JSON/Español/registerEspañol.json"
    fetch(json_language)
        .then(function (res) {
            return res.json();
        })
        .then(function (json) {
            console.log(json);
            document.getElementById("title").textContent = json.title
            document.getElementById("name").placeholder = json.name
            document.getElementById("surname").placeholder = json.surname
            document.getElementById("password").placeholder = json.password
            document.getElementById("repeat_password").placeholder = json.repeat_password
            document.getElementById("sign").value = json.sign
        })
        .catch(function (err) {
            console.error("Error cargando JSON:", err);
        });
}