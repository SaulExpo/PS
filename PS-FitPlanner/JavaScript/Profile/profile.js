import {serverTimestamp, addDoc, arrayRemove, collection, doc, getDoc, getFirestore, updateDoc, getDocs, query, where, arrayUnion} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import Swal from 'https://cdn.skypack.dev/sweetalert2';

import {auth, db} from "../firebase_config.js";
import {getUserProfile} from "../GetDB/getUser.js";
import {loadHeader} from "../GlobalLoad/loadHeader.js";
//import {uploadExercises} from "../update_exercises"

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

//sadapic936@exitings.com
//kilih41722@idoidraw.com

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
    document.querySelector("#buttons_profile").innerHTML = `<ul>
                <li>
                    <button class="button_profile" onclick="location.replace('main_page.html')">
                        <img id="home" src="../Resources/home.png" >
                        Home
                    </button>
                    <button class="button_profile" onclick="location.replace('graphic.html')">
                        <img id="graphic" src="../Resources/graphic.png" >
                        Graphics
                    </button>
                    <button class="button_profile" onclick="location.replace('select_payment_plan.html')">
                        <img src="../Resources/suscription.png" id="suscription" alt="foto perfil" >
                        Suscription
                    </button>
                    <button class="button_profile" onclick="location.replace('./edit_profile.html')">
                        <img src="../Resources/edit.jpg" id="editProfile" alt="foto perfil" >
                        Edit Profile
                    </button>
                    <button class="button_profile" onclick="uploadExercises()">
                        Update exercises
                    </button>
                </li>
            </ul>`
    await getalumnos()
    load_alumns()
    num_alumns()
    document.querySelector("#profe_view").style = "display:grid"
}

async function carga_alum() {
    if (user.profe_asig.id === "null")
    {
        document.querySelector("#profe_asig").innerHTML = "<p>There is not a professional assigned</p>"

        console.log("You don't have professionals")
        await cargaProfesLibres()
        document.querySelector("#alumn_view").style = "display:grid"
        return
    }
    let ref = doc(db, "user_app", user.profe_asig.id);
    let profeMio =  await getDoc(ref)
    cargaMiProfe(profeMio);
    await cargaProfesLibres();
    document.querySelector("#alumn_view").style = "display:grid"

}
function cargaMiProfe(profe) {
    console.log(profe.data())
    let temp = `<p>${profe.data().name}</p>
            <button class="button_user_action" onclick="desasignarPro('${profe.data().id}', '${profe.data().name}')">Leave</button>
            <button class="button_user_action" onclick=location.href="./chat.html?to=${profe.data().email}">Chat</button>`
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
                        <button class="button_user_action" onclick="cambiarPro('${profe.id}', '${profe.name}')">Follow</button>
                    </li>`
    }
    document.querySelector("#profe_list").innerHTML = temp
}

async function getalumnos()
{
    for (const alum of user.alumnos) {
        let alu = doc(db, "user_app", alum.id)
        let snap = await getDoc(alu)
        if (snap.data() === undefined) continue
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
                                <label class="tag">Email</label>
                                <p>${user.email}</p>
                            </div>
                        </th>
                        <th>
                            <div class="part">
                                <label class="tag">Age</label>
                                <p>${user.edad}años</p>
                            </div>
                        </th>

                    </tr>
                    <tr>
                        <th>
                            <div class="part">
                                <label class="tag">Height</label>
                                <p>${user.altura}cm</p>
                            </div>
                        </th>
                        <th>
                            <div class="part">
                                <label class="tag">Weight</label>
                                <p>${user.peso}kg</p>
                            </div>
                        </th>
                    </tr>
                    <tr>
                        <th class="half-right">
                            <div class="part">
                                <label class="tag">Sex</label>
                                <p>${user.genero}</p>
                            </div>
                        </th>
                        <th class="half-right">
                            <div class="part">
                                <label class="tag">Suscription</label>
                                <p>${user.tipo_suscripcion}</p>
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
        await updateDoc(newProfRef,
            {
                alumnos: arrayUnion(userRef)
            })
        const refAsig = collection(db, "registro_asignacion")
        await addDoc(refAsig, {
            asignacion: `${newProfe.data().name}:${user.name}`,
            timeAsig: serverTimestamp()
        })
        await cambioReferencia(userRef, newProfRef);


        sendEmail(newProfe.data(), `The user ${user.name} with email ${user.email}, had been assigned to your students`)
        sendEmail(user, `You had been assigned to the professional's list ${newProfe.data().name}`)
        location.reload()
    }
    if (miProfe.id === newProfe.id)
    {
        console.log("You are already assigned to that professional")
        return
    }

    await updateDoc(miProfeRef, {
        asignado: Number(miProfe.data().asignado) - 1
    })
    await updateDoc(newProfRef, {
        asignado: Number(newProfe.data().asignado) + 1
    })
    await updateDoc(newProfRef,
        {
            alumnos: arrayUnion(userRef)
        })
    await updateDoc(miProfeRef,
        {
            alumnos: arrayRemove(userRef)
        })
    const refAsig = collection(db, "registro_asignacion")
    await addDoc(refAsig, {
        asignacion: `${newProfe.data().name}:${user.name}`,
        timeAsig: serverTimestamp()
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
    document.querySelector("#alumnos").innerHTML = `Number of Students: ${alumnos.length}/${user.capacidad}`
}
function load_alumns()
{
    let temp = ''
    alumnos.forEach(alumno =>
    {

        temp += `<li class="alumno">
            <p>${alumno.name}</p>
            <button class="button_user_action" onclick="desasignar('${alumno.id}\', \'${alumno.name}')">Leave</button>
            <button class="button_user_action" onclick=location.href="./chat.html?to=${alumno.email}">Chat</button>
         </li>`;
    })
    document.querySelector("#alum-list").innerHTML = temp
}
async function desasignar(userID, userName)
{
    let alumRef = doc(db, "user_app", userID)
    let profeRef = doc(db, "user_app", user.id)
    const confirmado = confirm(`Are you sure to want to unassign ${userName}?`)
    if (confirmado)
    {
        let miAlumno = await getDoc(alumRef)
        let miProfe = await getDoc(profeRef)
        sendEmail(miAlumno.data(), `The teacher ${miProfe.data().name}, had unassign you from his students`)
        await updateDoc(profeRef,
            {alumnos: arrayRemove(alumRef),
                asignado: miProfe.data().asignado - 1,
            })
        await updateDoc(alumRef,
            {profe_asig: doc(db, "user_app", "null")})

        const refAsig = collection(db, "registro_asignacion")
        addDoc(refAsig, {
            asignacion: `null:${miAlumno.data().name}`,
            timeAsig: serverTimestamp()
        })

        location.reload()

    }

}

async function desasignarPro(profeID, profeName)
{
    let userRef = doc(db, "user_app", user.id)
    const confirmado = confirm(`Are you sure to want to unassign ${profeName}?`)

    if (confirmado)
    {
        let miProfeRef = doc(db, "user_app", user.profe_asig.id)
        let miProfe = await getDoc(miProfeRef)
        sendEmail(miProfe.data(), `The user ${user.name} with email ${user.email}, had unassign from his students`)
        await updateDoc(miProfeRef,
            {
                asignado: miProfe.data().asignado- 1,
            })
        await updateDoc(userRef, {
            profe_asig: doc(db, "user_app", "null"),
        })
        const refAsig = collection(db, "registro_asignacion")
        addDoc(refAsig, {
            asignacion: `null:${user.name}`,
            timeAsig: serverTimestamp()
        })
        location.reload()
    }

}

function sendEmail(userdata, message){
    emailjs.init('CTnfkkYqegWMlezAo');

    const params = {
        email: userdata.email,
        message: message,
        title: "Cambio en los usuarios"
    };
    console.log(params)
    emailjs.send('service_cmud1pq', 'template_ckg59mk', params)
        .then(function(response) {
            console.log(response)
            Swal.fire({
                title: "email sent successfully",
                icon: "warning",
                confirmButtonColor: "#d51313",
                confirmButtonText: "Ok"
            })
        }, function(error) {
            alert('Error al enviar el correo');
            console.log(error);
        });
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