import {
    where,
    collection,
    getDocs,
    doc,
    setDoc,
    query, getDoc
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import {db} from "../firebase_config.js";
import {getUserProfile} from "../GetDB/getUser.js";

const token = localStorage.getItem("jwt");
if (!token) {
    window.location.href = "../Pages/login.html"
}

let profesionales = []
let chats = []

async function obtenerProfesionales() {
    try {
        // Obtener los documentos de la colección "chats"
        const q = query(collection(db, "user_app"), where("profesional", "==", true));
        const querySnapshot = await getDocs(q);

        // Iterar a través de los documentos y mostrar los datos
        querySnapshot.forEach((doc) => {
            profesionales.push(doc.data());
        });
        return profesionales
    } catch (error) {
        console.error("Error getting the chats: ", error);
    }
}

async function obtenerChats(estado) {
    chats = [];
    try {
        const user = await getUserProfile();
        // Obtener los documentos de la colección "chats"
        const chatsRef = collection(db, "chats");
        const chatsQuery = query(chatsRef, where("users", "array-contains", user.email), where("cerrado", "==", estado));
        const querySnapshot = await getDocs(chatsQuery);

        // Iterar a través de los documentos y mostrar los datos
        for (const doc of querySnapshot.docs) {
            const chatData = doc.data();
            const chatId = doc.id;

            // Acceder a la subcolección "mensajes" dentro del chat actual
            const mensajesRef = collection(db, "chats", chatId, "messages");
            const mensajesSnapshot = await getDocs(mensajesRef);

            // Obtener todos los mensajes en un array
            const mensajes = mensajesSnapshot.docs.map(mensajeDoc => ({
                id: mensajeDoc.id,
                ...mensajeDoc.data()
            }));

            // Agregar los mensajes al objeto del chat
            chatData.messages = mensajes;

            // Agregar el chat completo al array principal
            chats.push({
                id: chatId,
                ...chatData
            });
        }
    } catch (error) {
        console.error("Error obteniendo los chats: ", error);
    }
}


async function generarRecuadros(filtro = "") {
    const user = await getUserProfile();
    const contenedor = document.getElementById('chatSelection');
    // Limpiar el contenedor antes de agregar los recuadros (por si ya hay contenido)
    contenedor.innerHTML = '';
    console.log(contenedor)


    // Recorrer la lista de profesionales
    for (const chat of chats) {
        let otroUsuario = chat.users[0] === user.email ? chat.users[1] : chat.users[0];
        const q = query(collection(db, "user_app"), where("email", "==", otroUsuario));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            otroUsuario = doc.data();
        });
        console.log(otroUsuario);

        if (!otroUsuario.email.toLowerCase().includes(filtro.toLowerCase())) continue; // Filtrar por nombre
        // Crear el recuadro
        const li = document.createElement('li');
        const a = document.createElement("a");
        a.className = "opcionChat"
        a.href = `./chat.html?to=${otroUsuario.email}`
        const img = document.createElement("img");
        img.className = "w-12 h-12 rounded-full object-cover mr-4";
        if (otroUsuario.profilePicture){
            img.src = otroUsuario.profilePicture;
        } else {
            img.src = "../Resources/icono.avif"
        }
        const div1 = document.createElement("div");
        div1.className="flex-1"
        const div2 = document.createElement("div");
        const div3 = document.createElement("div");
        div2.className="text-sm font-semibold text-gray-900"
        div2.textContent = otroUsuario.name;
        div3.className="text-xs text-gray-500"
        const date = new Date(chat.messages[0].time.seconds * 1000);
        const opciones = { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        const fechaFormateada = date.toLocaleString('es-ES', opciones).replace(',', ' a las');
        div3.textContent = "Last message : " + fechaFormateada;



        li.appendChild(a);
        a.appendChild(img);
        a.appendChild(div1);
        div1.appendChild(div2);
        div1.appendChild(div3);

        if (user.profesional === true) {
            const boton= document.createElement('button');
            boton.textContent = 'Close chat';
            boton.classList.add('boton-cerrar');
            boton.addEventListener('click', async () => {
                const chatRef = doc(db, "chats", chat.id);
                await setDoc(chatRef, {
                    cerrado: true,
                }, {merge: true});
            });
            a.appendChild(boton);
        }

        // Agregar el recuadro al contenedor
        contenedor.appendChild(li);
    }
}

function generarSelect() {
    profesionales.forEach(profesional => {
        const option = document.createElement('option');
        const select = document.getElementById("p_select")
        option.textContent = profesional.name;
        option.value = profesional.email;
        select.appendChild(option);
    });
}

const token = localStorage.getItem("jwt");
if (!token) {
    window.location.href = "../Pages/login.html"
}

obtenerProfesionales().then(profesionales => {
    obtenerChats(false).then(item => {
        generarRecuadros();
        generarSelect();
    })
});

let cerrado = document.getElementById('cerrados')
let abierto = document.getElementById('abiertos')

cerrado.addEventListener('click', () => {
    obtenerChats(true).then(item => {
        generarRecuadros();
    })
    abierto.style.display = 'block'
    cerrado.style.display = 'none'
});

abierto.addEventListener('click', () => {
    obtenerChats(false).then(item => {
        generarRecuadros();
    })
    abierto.style.display = 'none'
    cerrado.style.display = 'block'
});

document.getElementById("buscador").addEventListener("input", (e) => {
    generarRecuadros(e.target.value);
});
