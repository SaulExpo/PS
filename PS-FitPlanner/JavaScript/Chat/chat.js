import {getFirestore, collection, getDocs, doc, setDoc, addDoc, serverTimestamp, query, orderBy, onSnapshot, getDoc, where} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import {onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {db, auth} from "../firebase_config.js";

let chatHistory = {};
let user_name;
let receiver_data
let unsubscribe = null;
let unsubscribe2 = null;
const urlParams = new URLSearchParams(window.location.search);
const receiver = urlParams.get('to');



async function main() {
    const token = localStorage.getItem("jwt");
    if (!token) {
        window.location.href = "../Pages/login.html"
    }
    // Obtén el perfil de usuario (necesitas implementar esta función)
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userRef = doc(db, "user_app", user.uid);
            const q = query(collection(db, "user_app"), where("email", "==", receiver));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                receiver_data = doc.data();
            });
            document.getElementById("privateChat").textContent = `Private chat with ${receiver_data.name}`

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
            console.log("User not found");
        }

        user_name = user.email;
        console.log("User:", user_name);

        // Inicializa historial de chat
        const saved = localStorage.getItem("chatHistory");
        if (saved) {
            chatHistory = JSON.parse(saved);
        }



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

            addMessage("self", to, msg, time);
            document.getElementById("usermsg").value = "";


            const chatId = getChatId(user_name, to);


            await setDoc(doc(db, "chats", chatId), { users: [user_name, to], cerrado: false}, { merge: true });


            const messagesRef = collection(doc(db, "chats", chatId), "messages");
            await addDoc(messagesRef, {
                from: user_name,
                to: to,
                msg: msg,
                time: serverTimestamp(),
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
        const fecha = m.time
        let hora = fecha.split(":")[0]
        let minuto = fecha.split(":")[1]
        const who = m.from === "self" ? "Tú" : m.from;
        const className = m.from === "self" ? "me" : "them";
        const className1 = m.from === "self" ? "me1" : "them1";
        chatbox.innerHTML += `
  <div class="${className1}">
    <div class="${className}">
      <div class="sender-name"><b>${who}</b></div>
      <div class="message-text">${m.msg}</div>
      <div class="message-time">${hora}:${minuto}</div>
    </div>
  </div>
`;
    });
    chatbox.scrollTop = chatbox.scrollHeight;
}

function getChatId(user1, user2) {
    return [user1, user2].sort().join("_");
}

function sendEmail(){
    emailjs.init('CTnfkkYqegWMlezAo');
        const params = {
        from_name: user_name,
        reply_to: receiver_data.email,
        message: receiver_data.email,
    };
    console.log(params)
    emailjs.send('service_cmud1pq', 'template_rzkpa2j', params)
    .then(function(response) {
        console.log(response)
    }, function(error) {
        alert('There was an error sending the email');
        console.log(error);
    });
}

async function loadChatFromFirestore(user1, user2) {
    const chatId = getChatId(user1, user2);
    if (unsubscribe) unsubscribe();
    if (unsubscribe2) unsubscribe();


    const chatRef = doc(db, "chats", chatId);
    const messagesRef = collection(chatRef, "messages");
    const messagesQuery = query(messagesRef, orderBy("time"));

    unsubscribe2 = onSnapshot(chatRef, async docSnapshot => {
        const chatData = docSnapshot.data();
        await loadInputText(user1, user2);
    });
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

        if (!fromSelf && index >= lastVisibleMessage) {
            const isVisible = document.visibilityState === "visible";
            const currentRecipient = receiver;

            if (Notification.permission === "granted" && (user2 !== currentRecipient || !isVisible)) {
                new Notification(`New message from ${data.from}`, {
                    body: data.msg,
                    icon: "https://cdn-icons-png.flaticon.com/512/1384/1384023.png"
                });
            }
        }
    });

        chatHistory[user2] = messages;
        renderChat(user2);
    });

}

async function loadInputText(user1, user2) {
    const chatId = getChatId(user1, user2);

    const chatRef = doc(db, "chats", chatId);
    const Michat = await getDoc(chatRef);
    if(Michat.data()){
        if (Michat.data().cerrado === true){
            document.getElementById("input-container").style.display = "none";
        }
        else if (Michat.data().cerrado === false){
            document.getElementById("input-container").style.display = "flex";
        }
    }


}


window.addEventListener("load", main);
