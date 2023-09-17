import { Rendering, RenderMeans } from '@hatsy/hatsy';
import { Logging, RequestContext } from '@hatsy/hatsy/core.js';
import { TestHttpServer } from '@hatsy/hatsy/testing.js';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { silentLogger } from '@proc7ts/logger';
import type { RouterMeans } from '../router.means.js';
import { Routing } from '../routing.capability.js';
import { dispatchByName } from './dispatch-by-name.handler.js';

describe('dispatchByName', () => {
  let server: TestHttpServer;

  beforeAll(async () => {
    server = await TestHttpServer.start();
  });
  afterAll(async () => {
    await server.stop();
  });

  beforeEach(() => {
    server.handleBy(
      {
        handleBy(handler) {
          return Logging.logBy(silentLogger).for(handler);
        },
      },
      Rendering.and(Routing).for(
        dispatchByName({
          first({ route, renderJson }) {
            renderJson({ first: String(route) });
          },
          second: dispatchByName({
            third: dispatchByName({
              'test.html'({ route, renderJson }: RequestContext<RenderMeans & RouterMeans>) {
                renderJson({ test: String(route) });
              },
            }),
          }),
        }),
      ),
    );
  });

  it('dispatches to matching route', async () => {
    const response = await server.get('/first');

    expect(JSON.parse(await response.body())).toEqual({ first: '' });
  });
  it('dispatches to nested route', async () => {
    const response = await server.get('/second/third/test.html?param=value');

    expect(JSON.parse(await response.body())).toEqual({ test: '?param=value' });
  });
  it('does not dispatch when no routes match', async () => {
    const response = await server.get('/missing/test.html');

    expect(response.statusCode).toBe(404);
  });
  it('does not dispatch when route is empty', async () => {
    const response = await server.get('/?param=value');

    expect(response.statusCode).toBe(404);
  });
});
