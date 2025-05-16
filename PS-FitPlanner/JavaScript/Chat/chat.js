import {getFirestore, collection, getDocs, doc, setDoc, addDoc, serverTimestamp, query, orderBy, onSnapshot, getDoc, where} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import {onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {db, auth} from "../firebase_config.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js";
import {chatLanguage} from "../Language/chatLanguage.js ";

let chatHistory = {};
let user_name;
let receiver_data
let unsubscribe = null;
let unsubscribe2 = null;
const urlParams = new URLSearchParams(window.location.search);
const receiver = urlParams.get('to');
const storage = getStorage();
let language = localStorage.getItem("language");


async function main() {
    chatLanguage()
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
            if(language === "english") {
                document.getElementById("privateChat").textContent = `Private chat with ${receiver_data.name}`
            } else{
                document.getElementById("privateChat").textContent = `Chat privado con ${receiver_data.name}`
            }

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
            const fileInput = document.getElementById('imageInput');
            let files = false
            if (fileInput.files && fileInput.files.length > 0) {
                files = true
                await handleImageUpload(user_name, receiver);
                const preview = document.getElementById('preview');
                fileInput.value = '';
                preview.src = '';
                preview.style.display = 'none';
            }
            const msg = document.getElementById("usermsg").value.trim();
            const to = receiver;
            const time = new Date().toLocaleTimeString();

            if ((!msg && !files) || !user_name || !to) {
                return;
            }
            if (msg === ""){
                return
            }

            addMessage("self", to, msg, time, "text");
            document.getElementById("usermsg").value = "";


            const chatId = getChatId(user_name, to);


            await setDoc(doc(db, "chats", chatId), { users: [user_name, to], cerrado: false}, { merge: true });


            const messagesRef = collection(doc(db, "chats", chatId), "messages");
            await addDoc(messagesRef, {
                from: user_name,
                to: to,
                msg: msg,
                time: serverTimestamp(),
                type: "text",
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

function addMessage(who, userKey, message, time, type) {
    if (!chatHistory[userKey]) chatHistory[userKey] = [];
    chatHistory[userKey].push({ from: who, msg: message, time, type});
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
        let who
        if (language === "english") {
            who = m.from === "self" ? "You" : m.from;
        } else{
            who = m.from === "self" ? "Tú" : m.from;
        }
        const className = m.from === "self" ? "me" : "them";
        const className1 = m.from === "self" ? "me1" : "them1";
        if (m.type != "image") {
            chatbox.innerHTML += `
              <div class="${className1}">
                <div class="${className}">
                  <div class="sender-name"><b>${who}</b></div>
                  <div class="message-text">${m.msg}</div>
                  <div class="message-time">${hora}:${minuto}</div>
                </div>
              </div>
            `;
        } else{
            chatbox.innerHTML += `
              <div class="${className1}">
                <div class="${className}">
                  <div class="sender-name"><b>${who}</b></div>
                  <img src="${m.msg}" alt="">
                  <div class="message-time">${hora}:${minuto}</div>
                </div>
              </div>
            `;
        }
        
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
            time: data.time ? new Date(data.time.toDate()).toLocaleTimeString() : "...",
                type: data.type,
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

const input = document.getElementById('imageInput');
const preview = document.getElementById('preview');
const removeBtn = document.getElementById('removePreview');

async function handleImageUpload(user1, user2) {
    const chatId = getChatId(user1, user2);
    const messagesRef = collection(db, "chats", chatId, "messages");
    const fileInput = input;
    const file = fileInput.files[0];
    if (!file) {
        alert("Selecciona una imagen primero.");
        return;
    }

    try {
        // 1. Crear una referencia en Firebase Storage
        const imagePath = `chat_images/${chatId}/${Date.now()}_${file.name}`;
        const imageRef = storageRef(storage, imagePath);

        // 2. Subir la imagen
        await uploadBytes(imageRef, file);

        // 3. Obtener la URL pública de la imagen
        const imageURL = await getDownloadURL(imageRef);
        const to = receiver;
        const time = new Date().toLocaleTimeString();
        addMessage("self", to, imageURL, time, "image");

        await addDoc(messagesRef, {
            from: user_name,
            to: to,
            msg: imageURL,
            time: serverTimestamp(),
            type: "image",
        });


        fileInput.value = "";

    } catch (error) {
        console.error("❌ Error al subir imagen o guardar mensaje:", error);
    }
}


input.addEventListener('change', function(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('preview');

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
            removeBtn.style.display = "flex"
        };
        reader.readAsDataURL(file);
    }
});


removeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    preview.src = '';
    preview.style.display = 'none';
    removeBtn.style.display = 'none';
    input.value = '';
});


window.addEventListener("load", main);
