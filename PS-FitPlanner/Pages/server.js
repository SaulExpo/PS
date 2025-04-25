// server.js
const WebSocket = require('ws');
const wss = new WebSocket.Server({ host: '0.0.0.0', port: 3000 });

let users = {};

wss.on('connection', function connection(ws) {
    let userName = null;

    ws.on('message', function incoming(message) {
        let data = JSON.parse(message);
        console.log("Mensaje recibido:", data);

        if (data.type === 'register') {
            userName = data.name;
            users[userName] = ws;
            console.log(`${userName} conectado`);
        }

        if (data.type === 'message') {
            const to = data.to;
            const msg = data.msg;
            console.log(`${userName} => ${to}: ${msg}`);
            if (users[to]) {
                users[to].send(JSON.stringify({
                    from: userName,
                    msg: msg
                }));
            } else {
                console.log(`Usuario ${to} no está conectado.`);
            }
        }
    });

    ws.on('close', () => {
        if (userName && users[userName]) {
            delete users[userName];
            console.log(`${userName} desconectado`);
        }
    });
});
