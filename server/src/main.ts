import { serve } from '.';
import * as Logger from './logger';

process.on('uncaughtException', function (err) {
  Logger.log('Uncaught exception on process, shutting down:');
  Logger.error(err.stack);
  process.exit(1);
});

try {
  Logger.log('Ton Vote BE started');

  const server = serve();

  process.on('SIGINT', function () {
    Logger.log('Received SIGINT, shutting down.');
    if (server) {
      server.close(function (err) {
        if (err) {
          Logger.error(err.stack || err.toString());
        }
        process.exit();
      });
    }
  });
} catch (err: any) {
  Logger.log('Exception thrown from main, shutting down:');
  Logger.error(err.stack);
  process.exit(128);
}
