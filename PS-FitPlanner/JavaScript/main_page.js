import {loadHeader} from "./GlobalLoad/loadHeader.js";
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
            console.log(document.getElementsByClassName("text-box")[0])
            document.getElementsByClassName("text-box")[0].innerHTML = "<p>"+json.message_main_page+"</p>"
            document.querySelector("#imagenes").src = "../Resources/main_foto.jpg"
        })
    loadFooter()
}