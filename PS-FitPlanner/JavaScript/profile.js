import {arrayRemove, collection, doc, getDoc, getFirestore, updateDoc} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

import {auth, db} from "./firebase_config.js";
import {getUserProfile} from "./GetDB/getUser.js";
import {loadHeader} from "./GlobalLoad/loadHeader.js";


const alumnosRef = collection(db, "profesores");
let alumnos = []
let profesor = ""
const user = await getUserProfile()


todoas()
async function todoas()
{
    await getProfesor(user.id)
    getInfo(profesor)
    await getalumnos()
    load_alumns()
    num_alumns()

}

async function getProfesor(profe)
{
    let ref = doc(db, "user_app", profe)
    const snap = await getDoc(ref)
    profesor = {id: snap.id, ...snap.data()}
    console.log(profesor)


}
async function getalumnos()
{
    console.log(profesor)
    for (const alum of profesor.alumnos) {
        let alu = doc(db, "user_app", alum.id)
        let snap = await getDoc(alu)
        alumnos.push(
            {id: snap.id,
                ...snap.data()}
        )
    }

}
function getInfo(user)
{
    document.querySelector("#name_avatar").innerHTML = user.name
    document.querySelector("#icon").src = "../Resources/icono.avif" //user.icon
    document.querySelector(".rectangle").innerHTML = `<table>
                    <tr>
                        <th class="half-left">
                            <div class="part">
                                <label class="tag">Correo</label>
                                <p>${user.email}</p>
                            </div>
                        </th>
                        <th>
                            <div class="part">
                                <label class="tag">Edad</label>
                                <p>${user.edad}años</p>
                            </div>
                        </th>

                    </tr>
                    <tr>
                        <th>
                            <div class="part">
                                <label class="tag">Altura</label>
                                <p>${user.altura}cm</p>
                            </div>
                        </th>
                        <th>
                            <div class="part">
                                <label class="tag">Peso</label>
                                <p>${user.peso}kg</p>
                            </div>
                        </th>
                    </tr>
                    <tr>
                        <th class="half-right">
                            <div class="part">
                                <label class="tag">Sexo</label>
                                <p>${user.genero}</p>
                            </div>
                        </th>
                    </tr>
                </table>`
}




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

    loadFooter()
    load_info()
}

function load_info()
{
    load_alumns()
}
function num_alumns()
{
    document.querySelector("#alumnos").innerHTML = `Número de alumnos: ${alumnos.length}/${profesor.capacidad}`
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
            <button class="button_desasig" onclick="desasignar('${alumno.id}\', \'${alumno.name}')">Desasignar</button>
         </li>`;
    })
    document.querySelector("#alum-list").innerHTML = temp
}
async function desasignar(userID, userName)
{
    let alumRef = doc(db, "user_app", userID)
    let profeRef = doc(db, "profesional_user_app", profesor.id)
    const confirmado = confirm(`Estas seguro de desasignar a ${userName}?`)
    console.log(userID)
    if (confirmado)
    {
        await updateDoc(profeRef,
            {alumnos: arrayRemove(alumRef)})
        location.reload()

    }

}



Promise.all([loadTemplate("../Templates/header.html" , "main_header"),
    loadTemplate("../Templates/footer.html" , "main_footer")]).then(() =>
{
    load()
})

window.desasignar = desasignar