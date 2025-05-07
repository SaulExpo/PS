import { auth } from "../firebase_config.js";
import { signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {getUserProfile} from "../GetDB/getUser.js";
import Swal from 'https://cdn.skypack.dev/sweetalert2';
import {documentId} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const logout = async () => {
    try {
        await signOut(auth);
        console.log("Sesión cerrada correctamente.");
        window.location.href="../Pages/first_page.html";
    } catch (error) {
        console.error("Error al cerrar sesión:", error.message);
    }
};

export async function loadHeader() {
    let language = localStorage.getItem("language")
    let json
    if (language == "english") {
        json = "../JSON/english_data.json"
    } else {
        json = "../JSON/data.json"
    }
    fetch(json).then(function (response) {
        return response.json();
    }).then(async function (myJson) {
        let navega = document.getElementsByClassName("enlaces")
        for (let i = 0; i < navega.length; i++) {
            navega[i].textContent = myJson.nav_items_header[i]
        }
        let logeo = document.getElementsByClassName("logs")
        for (let i = 0; i < logeo.length; i++) {
            logeo[i].textContent = myJson.logeo_header[i]
        }

        document.querySelector("#foto_perf").src = myJson.personal.image
        document.querySelector("#logo").innerHTML = "<img id='logo' src='../Resources/logo%20(no%20text).png' width='64px' height='48px'>"
        document.querySelector("#logo").style.margin = 0


        var iniciar = document.querySelectorAll(".iniciar")
        var cerrar = document.querySelectorAll(".cerrar")
        const token = localStorage.getItem("jwt");
        if (!token) {
            cerrar.forEach((item) => {
                item.style.display = "none"
            })
        } else {
            iniciar.forEach((item) => {
                item.style.display = "none"
            })
        }

        cerrar[0].addEventListener("click", function () {
            localStorage.removeItem("jwt"); // Borra el token del almacenamiento
            logout()
        })

        if (localStorage.getItem("language")) {
            document.getElementById("english").style.display = "block"
            document.getElementById("spanish").style.display = "none"
        } else {
            document.getElementById("spanish").style.display = "block"
            document.getElementById("english").style.display = "none"
        }

        document.getElementById("spanish").addEventListener("click", function () {
            localStorage.setItem("language", "english")
            window.location.reload()
        })

        document.getElementById("english").addEventListener("click", function () {
            localStorage.removeItem("language")
            window.location.reload()
        })
        if (token) {
            const user = await getUserProfile()
            document.getElementById("crear_rutinas").addEventListener("click", function (e) {
                if (user.tipo_suscripcion == "usuario" || user.tipo_suscripcion == "miembro") {
                    e.preventDefault()
                    Swal.fire({
                        title: "Debes aumentar tu suscripción!",
                        icon: "warning",
                        confirmButtonColor: "#3085d6",
                        confirmButtonText: "Ok"
                    })
                }
            })
            console.log(document.getElementById("crear_rutinas"))
            document.getElementById("chat").addEventListener("click", function (e) {
                console.log("A")
                if (!user) {
                    location.replace("../Pages/login.html");
                }
                if (user.tipo_suscripcion == "usuario") {
                    Swal.fire({
                        title: "Debes Suscribirte!",
                        icon: "warning",
                        confirmButtonColor: "#3085d6",
                        confirmButtonText: "Ok"
                    })
                } else {
                    location.replace("../Pages/chats.html");
                }
            })
        } else {
            document.getElementById("chat").addEventListener("click", function (e) {
                location.replace("../Pages/login.html");
            })
        }
    })



}

export function loadTemplate(templatePath, elementId) {
    fetch(templatePath)
        .then(resp => resp.text())
        .then(data => {
            document.getElementById(elementId).innerHTML = data;
        })
        .catch(error => console.error(`Error cargando ${templatePath}:`, error));
}

