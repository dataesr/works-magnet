import path from 'path';
import YAML from 'yamljs';
import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import * as OAV from 'express-openapi-validator';

import { handleErrors } from './commons/middlewares/handle-errors';
import router from './router';
import webSocketServer from './webSocketServer';

const apiSpec = 'src/openapi/api.yml';
const apiDocument = YAML.load(apiSpec);
const app = express();

const expressServer = app.listen(process.env.WS_PORT, () => { console.log(`WebSocket server is running on port ${process.env.WS_PORT}`); });
expressServer.on('upgrade', (request, socket, head) => {
  webSocketServer.handleUpgrade(request, socket, head, (websocket) => {
    webSocketServer.emit('connection', websocket, request);
  });
});

expressServer.on('connection', () => console.log('Connected !'));

app.use(express.json({ limit: 52428800 }));
app.use(express.urlencoded({ extended: false }));
app.disable('x-powered-by');
if (process.env.NODE_ENV === 'development') {
  app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] }));
} else {
  app.use(express.static(path.join(path.resolve(), 'dist')));
}

app.get('/api/docs/specs.json', (req, res) => { res.status(200).json(apiDocument); });

app.use(OAV.middleware({
  apiSpec,
  validateRequests: { removeAdditional: true },
  validateResponses: true,
  ignoreUndocumented: true,
}));

app.use('/api', router);

app.use(handleErrors);

export default app;
