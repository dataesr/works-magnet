import { WebSocketServer } from 'ws';

import { chunkArray } from './utils/utils';
import { createIssue } from './utils/github';

const webSocketServer = new WebSocketServer({ noServer: true, path: '/ws' });

webSocketServer.on('connection', (webSocket) => {
  webSocket.on('error', console.error);
  webSocket.on('open', () => console.log('Opening websocket connexion'));
  webSocket.on('message', async (json) => {
    const { data, email } = JSON.parse(json);
    const perChunk = 30;
    const results = [];
    let toast = {};
    for (const [i, d] of chunkArray({ array: data, perChunk }).entries()) {
      const promises = d.map((item) => createIssue(item, email).catch((error) => error));
      const r = await Promise.all(promises);
      results.push(...r);
      toast = {
        description: `${Math.min(data.length, (i + 1) * perChunk)} / ${
          data.length
        } issue(s) submitted`,
        id: `processOpenAlex${i}`,
        title: 'OpenAlex corrections are being processed',
      };
      if (data.length > perChunk) {
        webSocket.send(JSON.stringify(toast));
      }
    }

    const firstError = results.find(
      (result) => !result.status.toString().startsWith('2'),
    );
    if (firstError?.status) {
      toast = {
        description: `Error while submitting Github issues : ${firstError?.message}`,
        id: 'errorOpenAlex',
        title: `Error ${firstError.status}`,
        toastType: 'error',
      };
      webSocket.send(JSON.stringify(toast));
    } else {
      toast = {
        description: `${data.length} correction(s) to OpenAlex have been saved -
          see <a href="https://github.com/dataesr/openalex-affiliations/issues" target="_blank">https://github.com/dataesr/openalex-affiliations/issues</a>`,
        id: 'successOpenAlex',
        title: 'OpenAlex corrections sent',
        toastType: 'success',
      };
      webSocket.send(JSON.stringify(toast));
    }
  });
});

export default webSocketServer;
