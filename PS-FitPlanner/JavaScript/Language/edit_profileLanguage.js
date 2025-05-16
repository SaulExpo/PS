export async function edit_profileLanguage() {
    let language = localStorage.getItem("language");
    let json_language = language === "english"
        ? "../JSON/English/edit_profileEnglish.json"
        : "../JSON/Español/edit_profileEspañol.json"
    fetch(json_language)
        .then(function (res) {
            return res.json();
        })
        .then(function (json) {
            console.log(json);
            document.getElementById("name").textContent = json.name
            document.getElementById("surname").textContent = json.surname
            document.getElementById("age").textContent = json.age
            document.getElementById("height").textContent = json.height
            document.getElementById("weight").textContent = json.weight
            document.getElementById("sex").textContent = json.sex
            document.getElementById("select").textContent = json.select
            document.getElementById("male").textContent = json.male
            document.getElementById("female").textContent = json.female
            document.getElementById("save").textContent = json.save
            document.getElementById("cancel").textContent = json.cancel
        })
        .catch(function (err) {
            console.error("Error cargando JSON:", err);
        });
}