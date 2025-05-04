import {arrayRemove, collection, doc, getDoc, getFirestore, updateDoc, getDocs, query, where} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

import {auth, db} from "../firebase_config.js";
import {getUserProfile} from "../GetDB/getUser.js";
import {loadHeader} from "../GlobalLoad/loadHeader.js";


const token = localStorage.getItem("jwt");
if (!token) {
    window.location.href = "../Pages/login.html"
}
let profesores = []
let alumnos = []
let user = undefined


async function getProfesores() {

    let ref = query(collection(db, "user_app"), where("profesional", "==", true));
    let todo_profe = await getDocs(ref)
    for (const profe of todo_profe.docs) {
        if (profe.data().asignado < profe.data().capacidad)
        {
            profesores.push(
                {id: profe.id, ...profe.data()}
            )
        }


    }
}

getProfesores()
todoas()



async function todoas()
{
    user = await getUserProfile()
    ///Provisional
    if (!user.profe_asig)
    {
        let ref = doc(db, "user_app", user.id)
        await updateDoc(ref, {
            profe_asig: doc(db, "user_app", "null")
        })
        location.reload()
        return

    }
    getInfo()
    if (user.profesional) return await carga_profe()
    return await carga_alum()

}

async function carga_profe() {
    await getalumnos()
    load_alumns()
    num_alumns()
    document.querySelector("#profe_view").style = "display:grid"
}

async function carga_alum() {
    if (user.profe_asig.id === "null")
    {
        document.querySelector("#profe_asig").innerHTML = "<p>No tienes ningún profesional asignado</p>"

        console.log("No tienes profesionales")
        await cargaProfesLibres()
        document.querySelector("#alumn_view").style = "display:grid"
        return
    }
    let ref = doc(db, "user_app", user.profe_asig.id);
    let profeMio =  await getDoc(ref)
    cargaMiProfe(profeMio);
    cargaProfesLibres();
    document.querySelector("#alumn_view").style = "display:grid"

}
function cargaMiProfe(profe) {
    let temp = `<p>${profe.data().name}</p>
            <button class="button_user_action" onclick="desasignarPro('${profe.data().id}', '${profe.data().name}')">Dejar</button>
            <button class="button_user_action">Chat</button>`
    document.querySelector("#profe_asig").innerHTML = temp
}

async function cargaProfesLibres() {
    let temp = ""
    let miProfeRef = doc(db, "user_app", user.profe_asig.id);
    let miProfe = await getDoc(miProfeRef)
    for (const profe of profesores) {
        if (profe.id === miProfe.id)
        {
            continue
        }
        temp += `<li class="profe">
                        <p>${profe.name} ${profe.asignado}/${profe.capacidad}</p>
                        <button class="button_user_action" onclick="cambiarPro('${profe.id}', '${profe.name}')">Seguir</button>
                    </li>`
    }
    document.querySelector("#profe_list").innerHTML = temp
}

async function getalumnos()
{

    for (const alum of user.alumnos) {
        let alu = doc(db, "user_app", alum.id)
        let snap = await getDoc(alu)
        alumnos.push(
            {id: snap.id,
                ...snap.data()}
        )
    }


}

function verProfes()
{
    document.querySelector("#profes_info").style = "display:block"
}
function getInfo()
{
    document.querySelector("#name_avatar").innerHTML = user.name + " " + user.surname
    document.querySelector("#icon").src = "../Resources/icono.avif" //user.icon
    if(!user.edad){
        user.edad = "X"
    }
    if(!user.peso){
        user.peso = "X"
    }
    if(!user.genero){
        user.genero = "X"
    }
    if(!user.altura){
        user.altura = "X"
    }

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

function cancelarCambio()
{
    document.querySelector("#profes_info").style = "display:none"
}
async function cambiarPro(id, name)
{
    let userRef = doc(db, "user_app", user.id)
    let newProfRef = doc(db, "user_app", id)
    let miProfeRef = doc(db, "user_app", user.profe_asig.id)

    let miProfe = await getDoc(miProfeRef);
    let newProfe = await getDoc(newProfRef);
    if (user.profe_asig.id === "null")
    {
        await updateDoc(newProfRef,
            {
                asignado: Number(newProfe.data().asignado) + 1
            })
        await cambioReferencia(userRef, newProfRef);
        location.reload()
        location.reload()
    }
    if (miProfe.id === newProfe.id)
    {
        console.log("Ya estas asignado a ese profesional")
        return
    }

    await updateDoc(miProfeRef, {
        asignado: Number(miProfe.data().asignado) - 1
    })
    await updateDoc(newProfRef, {
        asignado: Number(newProfe.data().asignado) + 1
    })
    await cambioReferencia(userRef, newProfRef);
    location.reload()

    async function cambioReferencia(userRef, newProf) {
        await updateDoc(userRef,
            {
                profe_asig: newProf
            })
    }
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
    document.querySelector("#alumnos").innerHTML = `Número de alumnos: ${alumnos.length}/${user.capacidad}`
}
function load_alumns()
{
    let temp = ''
    alumnos.forEach(alumno =>
    {

        temp += `<li class="alumno">
            <p>${alumno.name}</p>
            <button class="button_user_action" onclick="desasignar('${alumno.id}\', \'${alumno.name}')">Desasignar</button>
         </li>`;
    })
    document.querySelector("#alum-list").innerHTML = temp
}
async function desasignar(userID, userName)
{
    let alumRef = doc(db, "user_app", userID)
    let profeRef = doc(db, "user_app", user.id)
    const confirmado = confirm(`Estas seguro de desasignar a ${userName}?`)
    if (confirmado)
    {
        await updateDoc(profeRef,
            {alumnos: arrayRemove(alumRef)})
        location.reload()

    }

}

async function desasignarPro(profeID, profeName)
{
    let userRef = doc(db, "user_app", user.id)
    const confirmado = confirm(`Estas seguro de desasignar a ${profeName}?`)
    if (confirmado)
    {
        let miProfeRef = doc(db, "user_app", user.profe_asig.id)
        let miProfe = await getDoc(miProfeRef)
        await updateDoc(miProfeRef,
            {
                asignado: Number(miProfe.data().asignado) - 1,
            })
        await updateDoc(userRef, {
            profe_asig: doc(db, "user_app", "null"),
        })
        location.reload()
    }

}



Promise.all([loadTemplate("../Templates/header.html" , "main_header"),
    loadTemplate("../Templates/footer.html" , "main_footer")]).then(() =>
{
    load()
})

window.desasignar = desasignar
window.verProfes = verProfes
window.cancelarCambio = cancelarCambio
window.cambiarPro = cambiarPro
window.desasignarPro = desasignarPro