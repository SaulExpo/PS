import {getFirestore, collection, getDocs, doc, setDoc, addDoc, serverTimestamp, query, orderBy, onSnapshot, getDoc, where} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import {onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {db, auth} from "../firebase_config.js";

let chatHistory = {};
let user_name;
let receiver_data
let unsubscribe = null;
const urlParams = new URLSearchParams(window.location.search);
const receiver = urlParams.get('to');



async function main() {
    // Obtén el perfil de usuario (necesitas implementar esta función)
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userRef = doc(db, "user_app", user.uid);
            const q = query(collection(db, "user_app"), where("email", "==", receiver));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                receiver_data = doc.data();
            });

            // Marcar como en línea
            await setDoc(userRef, {
                estado: "en línea",
                notificacion: "NO",
                ultimoAcceso: serverTimestamp()
            }, { merge: true });


            // Al salir, marcar como desconectado
            window.addEventListener("beforeunload", async () => {
                console.log("ME FUI")
                await setDoc(userRef, {
                    estado: "desconectado",
                    ultimoAcceso: serverTimestamp()
                }, { merge: true });
            });
        } else {
            console.log("Usuario no autenticado");
        }

        user_name = user.email;
        console.log("Usuario:", user_name);

        // Inicializa historial de chat
        const saved = localStorage.getItem("chatHistory");
        if (saved) {
            chatHistory = JSON.parse(saved);
        }



        // Configura los listeners de notificaciones
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }

        await loadChatFromFirestore(user_name, receiver);

        document.getElementById("send").addEventListener("click", async () => {
            const msg = document.getElementById("usermsg").value.trim();
            const to = receiver;
            console.log(to);
            const time = new Date().toLocaleTimeString();

            if (!msg || !user_name || !to) {
                alert("Completa todos los campos");
                return;
            }

            // Añadir mensaje al chat
            addMessage("self", to, msg, time);
            document.getElementById("usermsg").value = "";

            // Obtener el chatId
            const chatId = getChatId(user_name, to);

            // Usamos setDoc para actualizar o crear el documento de chat
            await setDoc(doc(db, "chats", chatId), { users: [user_name, to], cerrado: false}, { merge: true });

            // Agregar mensaje a la subcolección "messages"
            const messagesRef = collection(doc(db, "chats", chatId), "messages");
            await addDoc(messagesRef, {
                from: user_name,
                to: to,
                msg: msg,
                time: serverTimestamp(), // Marca de tiempo del servidor
            });

            if(!receiver_data.notificacion || receiver_data.notificacion == "NO"){
                const userRef = doc(db, "user_app", receiver_data.uid);

                // Marcar como en línea
                await setDoc(userRef, {
                    notificacion: "SI",
                }, { merge: true });

                sendEmail()
            }
        });

        // Renderiza el chat si hay un destinatario
        const currentRecipient = receiver;
        if (currentRecipient) {
            renderChat(currentRecipient);
        }
    });

}

function addMessage(who, userKey, message, time) {
    if (!chatHistory[userKey]) chatHistory[userKey] = [];
    chatHistory[userKey].push({ from: who, msg: message, time });
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));

    if (receiver === userKey) {
        renderChat(userKey);
    }
}

function renderChat(userKey) {
    const chatbox = document.getElementById("chatbox");
    chatbox.innerHTML = "";
    (chatHistory[userKey] || []).forEach(m => {
        const who = m.from === "self" ? "Tú" : m.from;
        const className = m.from === "self" ? "me" : "them";
        chatbox.innerHTML += `<div class="${className}"><b>${who}</b> [${m.time}]: ${m.msg}</div>`;
    });
    chatbox.scrollTop = chatbox.scrollHeight;
}

function getChatId(user1, user2) {
    return [user1, user2].sort().join("_");
}

function sendEmail(){
    emailjs.init('CTnfkkYqegWMlezAo'); // Reemplaza con tu public key de EmailJS
        const params = {
        from_name: user_name,
        reply_to: receiver_data.email,
        message: receiver_data.email,
    };
    console.log(params)
    emailjs.send('service_cmud1pq', 'template_rzkpa2j', params)
    .then(function(response) {
        console.log(response)
        alert('Correo enviado con éxito');
    }, function(error) {
        alert('Error al enviar el correo');
        console.log(error);
    });
}

async function loadChatFromFirestore(user1, user2) {
    const chatId = getChatId(user1, user2); // Función personalizada para obtener el chatId
    if (unsubscribe) unsubscribe();  // Cancelar cualquier suscripción anterior


    const chatRef = doc(db, "chats", chatId);  // Referencia al documento del chat
    const messagesRef = collection(chatRef, "messages");  // Referencia a la subcolección de mensajes
    const messagesQuery = query(messagesRef, orderBy("time"));  // Ordenamos los mensajes por tiempo*/

    unsubscribe = onSnapshot(messagesQuery, async snapshot => {
        const q = query(collection(db, "user_app"), where("email", "==", receiver));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
        receiver_data = doc.data();
    });
        const messages = [];
        let lastVisibleMessage = chatHistory[user2]?.length || 0;

        snapshot.docs.forEach((doc, index) => {
            const data = doc.data();
            const fromSelf = data.from === user1;

            const msgObj = {
            from: fromSelf ? "self" : data.from,
            msg: data.msg,
            time: data.time ? new Date(data.time.toDate()).toLocaleTimeString() : "..."
        };

        messages.push(msgObj);

        // Mostrar notificaciones si es necesario
        if (!fromSelf && index >= lastVisibleMessage) {
            const isVisible = document.visibilityState === "visible";
            const currentRecipient = receiver;

            if (Notification.permission === "granted" && (user2 !== currentRecipient || !isVisible)) {
                new Notification(`Nuevo mensaje de ${data.from}`, {
                    body: data.msg,
                    icon: "https://cdn-icons-png.flaticon.com/512/1384/1384023.png"
                });
            }
        }
    });

        chatHistory[user2] = messages;  // Actualizar el historial del chat
        renderChat(user2);  // Función personalizada para renderizar el chat
    });
}

window.addEventListener("load", main);
