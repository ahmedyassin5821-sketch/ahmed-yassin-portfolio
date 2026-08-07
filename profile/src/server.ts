import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser, including prerendered documents.
 *
 * `index: 'index.html'` matters and differs from the CLI default.
 *
 * Every known route is `RenderMode.Prerender`, so its HTML already exists on
 * disk — `/` is `browser/index.html`, `/foo` is `browser/foo/index.html`. With
 * the CLI's default `index: false`, a request for `/` never resolves to that
 * file, falls through to the Angular engine, and gets answered with
 * `index.csr.html` — an empty `<app-root>`. The page then only appears after
 * client-side JavaScript boots, which silently discards every benefit of
 * prerendering: no server HTML for crawlers, and a blank first paint.
 *
 * Caching is split by type. Content-hashed assets are immutable and get a year;
 * HTML must not be, or a deploy never reaches anyone still holding a cached
 * document.
 */
app.use(
  express.static(browserDistFolder, {
    index: 'index.html',
    redirect: false,
    maxAge: '1y',
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
