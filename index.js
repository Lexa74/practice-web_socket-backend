const WebSocket = require('ws');
const fs = require('fs');
const { randomUUID } = require('crypto');
const {chat} = require('./chat')

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    ws.send(JSON.stringify(chat));

    ws.on('message', (message) => {
        const decodedMessage = JSON.parse(message.toString());
        console.log(decodedMessage)
        if(decodedMessage.type === "new") {
            addMessage({decodedMessage})
        }
        if(decodedMessage.type === "view") {
            viewMessage({decodedMessage})
        }
    })
    ws.on('close', (code, reason) => {
        console.log(`Connection closed: ${code} - ${reason}`);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

function addMessage({decodedMessage}) {
    const newMessage = {
        id: randomUUID(),
        username: decodedMessage.username || "Alex",
        message: decodedMessage.message || "Hello world",
        isViewed: false
    };
    chat.push(newMessage);

    fs.writeFileSync('./chat.js', `module.exports = { chat: ${JSON.stringify(chat, null, 2)} };`);

    sendClients()
}

function viewMessage({decodedMessage}) {
    const msgId = decodedMessage.id
    if(!msgId) {
        return console.log("Не передан id")
    }
    const msgIdx = chat.findIndex(el => el.id === msgId)
    chat[msgIdx].isViewed = true

    fs.writeFileSync('./chat.js', `module.exports = { chat: ${JSON.stringify(chat, null, 2)} };`);

    sendClients()
}


function sendClients() {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(chat));
        }
    });
}


