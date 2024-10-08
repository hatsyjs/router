# Hatsy Router

[![NPM][npm-image]][npm-url]
[![Build Status][build-status-img]][build-status-link]
[![Code Quality][quality-img]][quality-link]
[![Coverage][coverage-img]][coverage-link]
[![GitHub Project][github-image]][github-url]
[![API Documentation][api-docs-image]][api documentation]

[npm-image]: https://img.shields.io/npm/v/@hatsy/router.svg?logo=npm
[npm-url]: https://www.npmjs.com/package/@hatsy/router
[build-status-img]: https://github.com/hatsyjs/router/workflows/Build/badge.svg
[build-status-link]: https://github.com/hatsyjs/router/actions?query=workflow:Build
[quality-img]: https://app.codacy.com/project/badge/Grade/efc90a7b4a2846afb23be5975ad5fbed
[quality-link]: https://app.codacy.com/gh/hatsyjs/router/dashboard?utm_source=gh&utm_medium=referral&utm_content=hatsyjs/router&utm_campaign=Badge_Grade
[coverage-img]: https://app.codacy.com/project/badge/Coverage/efc90a7b4a2846afb23be5975ad5fbed
[coverage-link]: https://app.codacy.com/gh/hatsyjs/router/dashboard?utm_source=gh&utm_medium=referral&utm_content=hatsyjs/router&utm_campaign=Badge_Coverage
[github-image]: https://img.shields.io/static/v1?logo=github&label=GitHub&message=project&color=informational
[github-url]: https://github.com/hatsyjs/router
[api-docs-image]: https://img.shields.io/static/v1?logo=typescript&label=API&message=docs&color=informational
[api documentation]: https://hatsyjs.github.io/router

## Routing

This module contains a [Routing] capability that extends request processing context with
[request routing means][RouterMeans].

The latter has the following properties:

- `fullRoute` original route.
- `route` matching route. E.g. a tail section of original route.
- `routeMatch` a successful match of the route(s) against the pattern(s).

The [@hatsy/route-match] library performs route parsing and matching.

[Routing]: https://hatsyjs.github.io/router/variables/Routing-1.html
[RouterMeans]: https://hatsyjs.github.io/router/interfaces/RouterMeans.html
[@hatsy/route-match]: https://www.npmjs.com/package/@hatsy/route-match

## Dispatch

Once [Routing] capability applied the request processing can be dispatched by matching route by one of the dispatchers.

### dispatchByName()

```typescript
import { httpListener } from '@hatsy/hatsy';
import { dispatchByName, Routing } from '@hatsy/router';
import { createServer } from 'http';

const server = createServer(
  httpListener(
    Routing.for(
      dispatchByName({
        api: apiHandler, // Handle API request under `/api` route
        assets: assetsHandler, // Serve static assets under `/assets` route
      }),
    ),
  ),
);

server.listen(8080);
```

`dispatchByName()` function accepts a map of request processing handlers under route entry names the handler should
serve. The handler receives a request processing context with the rest of the route.

### dispatchByPattern()

```typescript
import { httpListener } from '@hatsy/hatsy';
import { dispatchByPattern, Routing } from '@hatsy/router';
import { createServer } from 'http';

const server = createServer(
  httpListener(
    Routing.for(
      dispatchByPattern([
        { on: 'api/v{apiVersion}/**', to: apiHandler },
        { on: '**/*.html', to: pageHandler },
        { on: 'assets/**', to: assetsHandler },
      ]),
    ),
  ),
);

server.listen(8080);
```

`dispatchByPattern()` function accepts dispatch patterns containing a route pattern and handler that serves
the matching route. The handler receives a request processing context with matching route tail.

## Route Format

The route format is [URLRoute] by default, while route patterns parsed by [simpleRoutePattern()].

This can be changed by configuring [Routing] capability.

```typescript
import { httpListener } from '@hatsy/hatsy';
import { matrixRoute, matrixRoutePattern } from '@hatsy/route-match';
import { dispatchByPattern, Routing } from '@hatsy/router';
import { createServer } from 'http';
import { matrixRoute } from './matrix-route';

const server = createServer(
  httpListener(
    Routing.with({
      buildRoute: ({ requestAddresses: { url } }) => matrixRoute(url),
      routePattern: pattern => matrixRoutePattern(pattern),
    }).for(
      dispatchByPattern([
        { on: 'api;v/**', to: apiHandler }, // API version as matrix attribute
        { on: '**/*.html', to: pageHandler },
        { on: 'assets/**', to: assetsHandler },
      ]),
    ),
  ),
);

server.listen(8080);
```

[URLRoute]: https://hatsyjs.github.io/route-match/interfaces/URLRoute.html
[simpleRoutePattern()]: https://hatsyjs.github.io/route-match/functions/simpleRoutePattern.html
