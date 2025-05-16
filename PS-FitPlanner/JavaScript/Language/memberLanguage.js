export async function memberLanguage() {
    let language = localStorage.getItem("language");
    let json_language = language === "english"
        ? "../JSON/English/memberEnglish.json"
        : "../JSON/Español/memberEspañol.json"
    fetch(json_language)
        .then(function (res) {
            return res.json();
        })
        .then(function (json) {
            console.log(json);
            document.getElementById("member").textContent = json.member
            document.getElementById("superior").textContent = json.superior
            document.querySelectorAll(".contact").forEach(function (element) {
                element.textContent = json.contact
            })
            document.querySelectorAll(".calendar").forEach(function (element) {
                element.textContent = json.calendar
            })
            document.querySelectorAll(".rutines").forEach(function (element) {
                element.textContent = json.rutines
            })
            document.querySelectorAll(".perso").forEach(function (element) {
                element.textContent = json.perso
            })
            document.querySelectorAll(".exclusive").forEach(function (element) {
                element.textContent = json.exclusive
            })
            document.querySelectorAll(".discounts").forEach(function (element) {
                element.textContent = json.discounts
            })
            document.querySelectorAll(".attention").forEach(function (element) {
                element.textContent = json.attention
            })
            document.getElementById("5").textContent = json._5
            document.getElementById("10").textContent = json._10
            document.getElementById("choose").textContent = json.choose
            document.querySelectorAll(".basica").forEach(function (element) {
                element.textContent = json.basica
            })
            document.querySelectorAll(".limited").forEach(function (element) {
                element.textContent = json.limited
            })
            document.querySelectorAll(".complete").forEach(function (element) {
                element.textContent = json.complete
            })
            document.getElementById("52").textContent = json._52
            document.getElementById("50").textContent = json._50
            document.getElementById("102").textContent = json._102
            document.getElementById("100").textContent = json._100
            document.getElementById("renovar").textContent = json.renovar
            document.getElementById("form-title").textContent = json.form_title


        })
        .catch(function (err) {
            console.error("Error cargando JSON:", err);
        });
}