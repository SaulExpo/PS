import { BehaviorSubject } from 'https://cdn.jsdelivr.net/npm/rxjs@7.8.1/+esm';

let alumnos = ['Alumno1', 'Alumno2', 'Alumno3', 'Alumno4', 'Alumno5', 'Alumno6'];
let alumnos_sub = new BehaviorSubject(alumnos)
alumnos_sub.subscribe(val =>
{
    load_alumns()
    num_alumns()
})

function load()
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
            /*const personal = json.personal;
            document.querySelector("h1").textContent = personal.name
            let todo = ""
            let temp = ""
            temp = "<p class='info'>Correo: " + personal.correo+ "</p>"
            todo += temp
            temp = "<p class='info'>Edad: " + personal.edad+ "</p>"
            todo += temp
            temp = "<p class='info'>Sexo: " + personal.sexo+ "</p>"
            todo += temp
            temp = "<p class='info'>Altura: " + personal.altura.valor + personal.altura.medida+ "</p>"
            todo += temp
            temp = "<p class='info'>Peso: " + personal.peso.valor + personal.peso.medida+ "</p>"
            todo += temp*/
            document.querySelector(".rectangle").innerHTML = todo
            document.querySelector("#icon").src = personal.image

        })
    loadFooter()
    load_info()
}

function load_info()
{
    load_alumns()
}
function num_alumns()
{
    document.querySelector("#alumnos").innerHTML = `Numero de alumnos: ${alumnos.length}`
}
function load_alumns()
{
    let temp = ''
    for (const alumno of alumnos) {
        temp += `<li class="alumno">
            <p>${alumno}</p>
            <button class="button_desasig" onclick="desasignar('${alumno}')">Desasignar</button>
         </li>`;

    }
    document.querySelector("#alum-list").innerHTML = temp
}
function desasignar(user)
{
    let index = alumnos.findIndex(val => val === user)
    const confirmado = confirm(`Estas seguro de desasignar a ${user}?`)
    if (confirmado) {
        alumnos.splice(index, 1)
        alumnos_sub.next(alumnos)
    }
    console.log(alumnos)


}


Promise.all([loadTemplate("../Templates/header.html" , "main_header"),
    loadTemplate("../Templates/footer.html" , "main_footer")]).then(() =>
{
    load()
})

window.desasignar = desasignar