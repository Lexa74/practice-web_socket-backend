const WebSocket = require('ws');
const fs = require('fs');
const { randomUUID } = require('crypto');
const {chat} = require('./chat')

const wss = new WebSocket.Server({ port: 8080 });

// Загружаем историю чата из файла, если он существует
// if (fs.existsSync('chat.js')) {
//     chatHistory = JSON.parse(fs.readFileSync('chat.js', 'utf-8'));
// }

wss.on('connection', (ws) => {
    // Отправляем историю чата новому клиенту
    ws.send(JSON.stringify(chat));

    ws.on('message', (message) => {
        const decodedMessage = JSON.parse(message.toString());
        // if(message.type === "new") {
        //     addMessage({decodedMessage})
        // }
        // if(message.type === "view") {
        //     viewMessage({decodedMessage})
        // }
        addMessage({decodedMessage})
    })
    ws.on('close', (code, reason) => {
        console.log(`Connection closed: ${code} - ${reason}`);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

function addMessage({decodedMessage}) {
    // const newMessage = {
    //     id: randomUUID(),
    //     username: "Alex",
    //     message: decodedMessage
    // };
    // const decodedMessage = JSON.parse(message.toString());
    //
    const newMessage = {
        id: randomUUID(),
        username: decodedMessage.username || "Alex",
        message: decodedMessage.message || "Hello world"
    };

    chat.push(newMessage);
    sendClients()
}

function viewMessage({decodedMessage}) {
    const msgId = decodedMessage.id
    const msgIdx = chat.findIndex(el => el.id === msgId)
    chat[msgIdx].isViewed = true

    // fs.writeFileSync('chat.js', JSON.stringify(chatHistory, null, 2));

    sendClients()
}


function sendClients() {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(chat));
        }
    });
}


