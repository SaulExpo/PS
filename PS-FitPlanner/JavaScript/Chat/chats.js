import  {where, collection, getDocs, doc, setDoc, query} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import {db} from "../firebase_config.js";
import {getUserProfile} from "../GetDB/getUser.js";
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
        console.error("Error obteniendo los chats: ", error);
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
    const contenedor = document.getElementById('contenedor');
    // Limpiar el contenedor antes de agregar los recuadros (por si ya hay contenido)
    contenedor.innerHTML = '';
    console.log(contenedor)

    // Recorrer la lista de profesionales
    chats.forEach(chat => {
        const otroUsuario = chat.users[0] === user.email ? chat.users[1] : chat.users[0];

        if (!otroUsuario.toLowerCase().includes(filtro.toLowerCase())) return; // Filtrar por nombre
        // Crear el recuadro
        const recuadro = document.createElement('div');
        recuadro.classList.add('recuadro');

        // Crear el nombre del profesional
        const nombre = document.createElement('h3');
        nombre.textContent = otroUsuario;

        const fecha = document.createElement('div');
        const date = new Date(chat.messages[0].time * 1000);
        fecha.textContent = date;

        // Crear el botón "Acceder"
        const boton = document.createElement('button');
        boton.textContent = 'Acceder';
        boton.classList.add('boton-acceder');
        boton.addEventListener('click', () => {
            window.location.href = `../../../chat.html`;
        });


        // Agregar el nombre y el botón al recuadro
        recuadro.appendChild(nombre);
        recuadro.appendChild(fecha);
        recuadro.appendChild(boton);

        if (user.profesional === true) {
            const boton2 = document.createElement('button');
            boton2.textContent = 'Cerrar Chat';
            boton2.classList.add('boton-cerrar');
            boton2.addEventListener('click', async () => {
                const chatRef = doc(db, "chats", chat.id);
                await setDoc(chatRef, {
                    cerrado: true,
                }, {merge: true});
            });
            recuadro.appendChild(boton2);
        }

        // Agregar el recuadro al contenedor
        contenedor.appendChild(recuadro);
    });
}

function generarSelect(){
    profesionales.forEach(profesional => {
        const option = document.createElement('option');
        const select = document.getElementById("p_select")
        option.textContent = profesional.name;
        option.value = profesional.email;
        select.appendChild(option);
    });
}


obtenerProfesionales().then(profesionales =>{
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
