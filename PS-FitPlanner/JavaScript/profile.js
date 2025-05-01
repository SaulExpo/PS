import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import {
    getFirestore,
    setDoc,
    doc,
    getDoc,
    collection,
    getDocs,
    addDoc,
    onSnapshot, updateDoc, arrayRemove
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import { BehaviorSubject } from 'https://cdn.jsdelivr.net/npm/rxjs@7.8.1/+esm';
// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC872To8NAS_2tw-h-MB_Rv9Py8donENrw",
    authDomain: "pruebas-d7e1c.firebaseapp.com",
    projectId: "pruebas-d7e1c",
    storageBucket: "pruebas-d7e1c.firebasestorage.app",
    messagingSenderId: "156231547127",
    appId: "1:156231547127:web:ca5030f6e18d76a5f67bf2",
    measurementId: "G-W4XMMQDGRE"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const alumnosRef = collection(db, "profesores");
let alumnos = []
let profesor = ""

todoas()
//get_users()
async function todoas()
{
    await getProfesor("JkzYVjCBRaLhVjoFC8UY")
    await getalumnos()
    load_alumns()
    num_alumns()

}

async function getProfesor(profe)
{
    let ref = doc(db, "profesores", profe)
    const snap = await getDoc(ref)
    profesor = await snap.data()

}
async function getalumnos()
{
    for (const alum of profesor.alumnos) {
        let alu = doc(db, "alumnos", alum.id)
        let snap = await getDoc(alu)
        alumnos.push(snap.data())
    }

}
onSnapshot(alumnosRef, (snap) =>
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
            const personal = json.personal;
            document.querySelector("h1").textContent = personal.name

            /*
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
    console.log("hola")
    console.log(alumnos)
    let temp = ''
    alumnos.forEach(alumno =>
    {

        temp += `<li class="alumno">
            <p>${alumno.name}</p>
            <button class="button_desasig" onclick="desasignar('${alumno.name}')">Desasignar</button>
         </li>`;
    })
    document.querySelector("#alum-list").innerHTML = temp
}
function desasignar(user)
{
    console.log(alumnos)
    return
    let encontrado = ''
    let alumno = alumnos.find(val => {
        if(val.data().name === user)
        {
            encontrado
        }
    })
    const confirmado = confirm(`Estas seguro de desasignar a ${user}?`)
    /*if (confirmado) {
        updateDoc(alumnosRef,
            {
                alumnos: arrayRemove(alumno)
            })
    }
    alumnos.forEach(val =>
    {
        console.log(val.data())
    })*/

}


async function get_users()
{
    let profesores = await getDocs(alumnosRef)
    profesores.forEach(val =>
    {
        if (val.data().name === profesor)
        {
            val.data().alumnos.forEach(alumno =>
            {
                console.log(alumno.id)
                let ref = doc(db, "alumnos", "O3bOV8CK3lNVCxHhUiQQ")
                getDoc(ref)
            })

        }
    })

}

Promise.all([loadTemplate("../Templates/header.html" , "main_header"),
    loadTemplate("../Templates/footer.html" , "main_footer")]).then(() =>
{
    load()
})

window.desasignar = desasignar