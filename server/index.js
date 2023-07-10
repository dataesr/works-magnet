import 'dotenv/config';

import logger from './src/services/logger';

import app from './src/app';

let httpServer;

async function cleanup() {
  app.isReady = false;
  logger.info('SIGTERM/SIGINT signal received');
  if (httpServer) {
    await httpServer.close();
  }
  logger.info('HTTP server stopped');
  process.exit(1);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

function createAPIServer(port) {
  httpServer = app.listen(port, () => {
    logger.info(`Server started at http://localhost:${port}`);
    app.isReady = true;
  });
}

createAPIServer(3000);
