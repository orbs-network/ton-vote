import express, { Request, Response, NextFunction} from 'express';
import cors from 'cors';
import { errorString } from './helpers';
import { TaskLoop } from './task-loop';
import * as Logger from './logger';
import { State } from './state';
import { Fetcher } from './fetcher';

const SOCKET_TIMEOUT_SEC = 60;


export function serve() {
  const app = express();
  app.use(cors());
  app.set('json spaces', 2);

  const state = new State();
  const fetcher = new Fetcher(state);

  app.get('/state', (_request, response) => {
    response.status(200).json(state.getState());
  });

  app.get('/results', (_request, response) => {
    response.status(200).json(state.getProposalResults());
  });

  app.get('/frozenAddresses', (_request, response) => {
    const body = '';
    response.status(200).json(body);
  });

  app.get('/lastFetchUpdate', (_request, response) => {
    response.status(200).json(fetcher.getLastFetchUpdate());
  });

  app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    if (error instanceof Error) {
      Logger.error(`Error response to ${req.url}: ${errorString(error)}.`);
      return res.status(500).json({
        status: 'error',
        error: errorString(error),
      });
    }
    return next(error);
  });

  fetcher.init();
  const fetcherSyncTask = new TaskLoop(() => fetcher.run(), 60 * 1000);  
  fetcherSyncTask.start();

  const server = app.listen(3001, '0.0.0.0', () =>
    Logger.log(`Management service listening on port ${3001}!`)
  );

  server.setTimeout(SOCKET_TIMEOUT_SEC * 1000);
  server.requestTimeout = SOCKET_TIMEOUT_SEC * 1000;
  server.on('close', () => {
    fetcherSyncTask.stop();
  });
  return server;
}
