import {loadHeader} from "../GlobalLoad/loadHeader.js";
import {getUserProfile} from "../GetDB/getUser.js";
export function load()
{
    loadHeader()
    let language = localStorage.getItem("language")
    let json
    if (language == "english"){
        json = "../JSON/english_data.json"
    } else {
        json = "../JSON/data.json"
    }
    fetch(json).then(function(res)
    {
        return res.json();
    })
        .then(function (json)
        {
            const personal = json.personal;
            document.querySelector("#icon").src = personal.image
        })
    getUserProfile().then(user => {
        document.getElementById("Nombre").innerHTML = user.name + " " + user.surname;
        document.getElementById("email").innerHTML = "Email: " + user.email;
        document.getElementById("edad").innerHTML = "Edad: " + user.edad;
        document.getElementById("genero").innerHTML = "Genero: " + user.genero;
        document.getElementById("altura").innerHTML = "Altura: " + user.altura;
        document.getElementById("peso").innerHTML = "Peso: " + user.peso;
    })
    loadFooter()
}