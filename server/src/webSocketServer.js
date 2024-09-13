import WebSocket, { WebSocketServer } from 'ws';

const wsServer = new WebSocketServer({ noServer: true });
console.log(wsServer);

// eslint-disable-next-line arrow-body-style, func-names
wsServer.broadcast = function (message) {
  console.log(this.clients);
  return this.clients.forEach((client) => {
    console.log(client.readyState);
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

export default wsServer;
