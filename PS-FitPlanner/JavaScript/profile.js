import {initializeApp} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import {
    arrayRemove,
    collection,
    doc,
    getDoc,
    getFirestore,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

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
async function todoas()
{
    await getProfesor("JkzYVjCBRaLhVjoFC8UY")
    getInfo(profesor)
    await getalumnos()
    load_alumns()
    num_alumns()

}

async function getProfesor(profe)
{
    let ref = doc(db, "profesores", profe)
    const snap = await getDoc(ref)
    profesor = {id: snap.id, ...snap.data()}


}
async function getalumnos()
{
    for (const alum of profesor.alumnos) {
        let alu = doc(db, "alumnos", alum.id)
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
                                <p>${user.sexo}</p>
                            </div>
                        </th>
                    </tr>
                </table>`
    document.querySelector("#icon").src = "../Resources/icono.avif"
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
    let alumRef = doc(db, "alumnos", userID)
    let profeRef = doc(db, "profesores", profesor.id)
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