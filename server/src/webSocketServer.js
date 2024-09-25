import { WebSocketServer } from 'ws';

const webSocketServer = new WebSocketServer({ noServer: true, path: '/ws' });
const webSockets = {};

webSocketServer.on('connection', (webSocket, request) => {
  const uuid = request?.url.match(/ws\?uuid=([\w-]*)/)[1];
  webSockets[uuid] = webSocket;
  console.log(`Websocket connection opened: ${uuid}`);
  webSocket.on('close', () => {
    delete webSockets[uuid];
    console.log(`Closing websocket ${uuid}`);
  });
  webSocket.on('error', console.error);
  webSocket.on('open', () => { console.log(`Opening websocket ${uuid}`); });
});

webSocketServer.send = ({ message, uuid }) => {
  if (Object.keys(webSockets).includes(uuid)) {
    webSockets[uuid].send(message);
  } else {
    console.error(`Websocket client ${uuid} does not exist.`);
  }
};

export default webSocketServer;
