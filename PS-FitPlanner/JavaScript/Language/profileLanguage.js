export async function profileLanguage() {
    let language = localStorage.getItem("language");
    let json_language = language === "english"
        ? "../JSON/English/profileEnglish.json"
        : "../JSON/Español/profileEspañol.json"
    fetch(json_language)
        .then(function (res) {
            return res.json();
        })
        .then(function (json) {
            console.log(json);
            document.getElementById("HomeLabel").textContent = json.HomeLabel
            document.getElementById("GraphLabel").textContent = json.GraphLabel
            document.getElementById("SuscriptionLabel").textContent = json.SuscriptionLabel
            document.getElementById("EditLabel").textContent = json.EditLabel
            document.getElementById("Assigned").textContent = json.Assigned
            document.getElementById("Change").textContent = json.Change
            document.getElementById("ChangeP").textContent = json.ChangeP
            document.getElementById("ChangeButton").textContent = json.ChangeButton
            document.getElementById("Available").textContent = json.Available
            document.getElementById("Cancel").textContent = json.Cancel
            document.getElementById("Student").textContent = json.Student
            document.getElementById("height").textContent = json.height
            document.getElementById("age").textContent = json.age
        })
        .catch(function (err) {
            console.error("Error cargando JSON:", err);
        });
}