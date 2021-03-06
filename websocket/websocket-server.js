const express = require('express');
const PORT = 3001;
const server = express()
  .use(express.static('build'))
  .listen(PORT, '0.0.0.0', 'localhost',
    () => console.log(`Listening to ${PORT}`));

const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });

const handleClose = () => {
  console.log('Client disconnected');
  // recalculate the number of clients and broadcast to clients
  const clientData = {
    type: 'incomingClient',
    onlineClientNum: wss.clients.size
  };
  handleClientInfo(clientData);
};
// broadcast messages to all clients
const broadcast = data => {
  wss.clients.forEach(client => {
    (client.readyState === WebSocket.OPEN) && client.send(data)
  });
}
// change 'post' to 'incoming' (i.e., postMessage => incomingMessage)
const changeItemType = msg => {
  msg.type = msg.type.replace('post', 'incoming');
  return msg;
};
// process incoming data and broadcast back to all clients
const handleIncomingdata = data => {
  const newData = changeItemType(JSON.parse(data));
  // Broadcast new messages to everyone.
  broadcast(JSON.stringify(newData));
};

// broadcast client information to all clients
const handleClientInfo = () => {
  const clientData = {
    type: 'incomingClient',
    onlineClientNum: wss.clients.size
  };
  console.log(`${clientData.onlineClientNum} user(s) online`);
  // Broadcast the total number of clients
  broadcast(JSON.stringify(clientData));
};
const handleConnection = ws => {
  handleClientInfo();
  ws.on('message', data => handleIncomingdata(data));
  ws.on('close', handleClose);
};

wss.on('connection', handleConnection);