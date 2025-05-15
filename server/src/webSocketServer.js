import { WebSocketServer } from 'ws';

import { createGithubIssue, formatIssueMentionsCharacterizations, formatIssueOpenAlexAffiliations } from './utils/github';
import { saveIssue } from './utils/s3';
import { chunkArray, getSha1 } from './utils/utils';

const webSocketServer = new WebSocketServer({ noServer: true, path: '/ws' });

webSocketServer.on('connection', (webSocket) => {
  webSocket.on('error', console.error);
  webSocket.on('message', async (json) => {
    const { data, email, options, type } = JSON.parse(json);
    if (!['mentions-characterizations', 'openalex-affiliations'].includes(type)) {
      throw new Error('Issue type should be one of "mentions-characterizations" of "openalex-affiliations"');
    }
    const searchId = getSha1({ text: options });
    const promises = [];
    // Parse all issues and save them into OVH OS
    const issues = data.map((issue, index) => {
      let body = '';
      let title = '';
      if (type === 'openalex-affiliations') {
        ({ body, title } = formatIssueOpenAlexAffiliations({ email, issue }));
      } else if (type === 'mentions-characterizations') {
        ({ body, title } = formatIssueMentionsCharacterizations({ email, issue }));
      }
      if ((body?.length ?? 0) > 0) {
        promises.push(saveIssue({ fileContent: body, fileName: `${Date.now()}_${searchId}_${index}.txt` }));
        return { body, title };
      }
      return {};
    });
    await Promise.all(promises);
    const perChunk = 10;
    const results = [];
    let toast = {};
    // For each issue, open it to Github, 10 by 10
    // eslint-disable-next-line no-restricted-syntax
    for (const [index1, d] of chunkArray({ array: issues, perChunk }).entries()) {
      const promises2 = d.map(({ body, title }) => (body?.length ? createGithubIssue({ body, title, type }) : Promise.resolve()));
      const r = await Promise.all(promises2);
      results.push(...r);
      if (data.length > perChunk) {
        toast = {
          description: `${Math.min(data.length, (index1 + 1) * perChunk)} / ${
            data.length
          } issue${data.length > 1 ? 's' : ''} submitted`,
          id: `processCorrections${index1}`,
          title: `${type.replace('-', ' ')} corrections are being processed`,
        };
        webSocket.send(JSON.stringify(toast));
      }
    }

    const firstError = results.find(
      (result) => !(result?.status?.toString()?.startsWith('2') ?? result?.$metadata?.httpStatusCode?.toString()?.startsWith('2')),
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
