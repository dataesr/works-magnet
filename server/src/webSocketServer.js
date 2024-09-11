import WebSocket, { WebSocketServer } from 'ws';

const wsServer = new WebSocketServer({ noServer: true });

// eslint-disable-next-line arrow-body-style, func-names
wsServer.broadcast = function (message) {
  return this.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

export default wsServer;
