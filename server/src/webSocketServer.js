import { WebSocketServer } from 'ws';

import { createIssue } from './utils/github';
import { chunkArray } from './utils/utils';

const webSocketServer = new WebSocketServer({ noServer: true, path: '/ws' });

webSocketServer.on('connection', (webSocket) => {
  webSocket.on('error', console.error);
  webSocket.on('open', () => console.log('Opening websocket connexion'));
  webSocket.on('message', async (json) => {
    const { data, email, type } = JSON.parse(json);
    const perChunk = 10;
    const results = [];
    let toast = {};
    for (const [i, d] of chunkArray({ array: data, perChunk }).entries()) {
      const promises = d.map((issue) => createIssue({ email, issue, type }).catch((error) => error));
      const r = await Promise.all(promises);
      results.push(...r);
      if (data.length > perChunk) {
        toast = {
          description: `${Math.min(data.length, (i + 1) * perChunk)} / ${
            data.length
          } issue${data.length > 1 ? 's' : ''} submitted`,
          id: `processCorrections${i}`,
          title: `${type.replace('-', ' ')} corrections are being processed`,
        };
        webSocket.send(JSON.stringify(toast));
      }
    }

    const firstError = results.find(
      (result) => !result.status.toString().startsWith('2'),
    );
    if (firstError?.status) {
      toast = {
        description: `Error while submitting Github issues - Error ${firstError.status} - ${firstError?.message}`,
        id: 'errorCorrections',
        title: `Error ${firstError.status}`,
        toastType: 'error',
      };
      webSocket.send(JSON.stringify(toast));
    } else {
      toast = {
        description: `${data.length} correction${
          data.length > 1 ? 's' : ''
        } to ${type.replace('-', ' ')} have been saved -
          see <a href="https://github.com/dataesr/${type}/issues" target="_blank">https://github.com/dataesr/${type}/issues</a>`,
        id: 'successCorrections',
        title: `${type.replace('-', ' ')} correction${
          data.length > 1 ? 's' : ''
        } sent`,
        toastType: 'success',
      };
      webSocket.send(JSON.stringify(toast));
    }
  });
});

export default webSocketServer;
