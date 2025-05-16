export async function chatLanguage() {
    let language = localStorage.getItem("language");
    let json_language = language === "english"
        ? "../JSON/English/chatEnglish.json"
        : "../JSON/Español/chatEspañol.json"
    fetch(json_language)
        .then(function (res) {
            return res.json();
        })
        .then(function (json) {
            console.log(json);
            document.getElementById("usermsg").placeholder = json.usermsg
            document.getElementById("send").textContent = json.send
        })
        .catch(function (err) {
            console.error("Error cargando JSON:", err);
        });
}