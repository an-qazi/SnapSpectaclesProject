// server.js
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });
console.log('WS listening on ws://0.0.0.0:8080');

wss.on('connection', (ws, req) => {
  console.log('client connected from', req.socket.remoteAddress);

  // send a hello + periodic demo payloads
  ws.send(JSON.stringify({ hello: 'spectacles' }));

  const id = setInterval(() => {
    ws.send(JSON.stringify({
      t: Math.floor(Date.now()/1000),
      friends: [{ id: 'alice', proximity: 'near', rssi: -58 }]
    }));
  }, 1000);

  ws.on('message', (msg) => console.log('from client:', msg.toString()));
  ws.on('close', () => clearInterval(id));
});

