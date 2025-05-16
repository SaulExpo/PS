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
            if (language === "english") {
                document.getElementById("años").textContent += "years"
            } else {
                document.getElementById("años").textContent += "años"
            }
            document.getElementById("weight").textContent = json.weight
            document.getElementById("sex").textContent = json.sex
            document.getElementById("suscription2").textContent = json.suscription
            if(document.getElementById("genero").textContent === "Hombre" && language === "english"){
                document.getElementById("genero").textContent = "Man"
            } else if (document.getElementById("genero").textContent === "Mujer" && language === "english"){
                document.getElementById("genero").textContent = "Woman"
            }
            if(document.getElementById("tipo_suscripcion").textContent === "miembro" && language === "english"){
                document.getElementById("tipo_suscripcion").textContent = "Member"
            } else if (document.getElementById("tipo_suscripcion").textContent === "miembro superior" && language === "english"){
                document.getElementById("tipo_suscripcion").textContent = "Superior member"
            } else if (document.getElementById("tipo_suscripcion").textContent === "usuario" && language === "english"){
                document.getElementById("tipo_suscripcion").textContent = "User"
            }
        })
        .catch(function (err) {
            console.error("Error cargando JSON:", err);
        });
}