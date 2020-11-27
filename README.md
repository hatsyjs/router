Hatsy Router
============

[![NPM][npm-image]][npm-url]
[![Build Status][build-status-img]][build-status-link]
[![codecov][codecov-image]][codecov-url]
[![GitHub Project][github-image]][github-url]
[![API Documentation][api-docs-image]][API documentation]

[npm-image]: https://img.shields.io/npm/v/@hatsy/router.svg?logo=npm
[npm-url]: https://www.npmjs.com/package/@hatsy/router
[build-status-img]: https://github.com/hatsyjs/router/workflows/Build/badge.svg
[build-status-link]: https://github.com/hatsyjs/router/actions?query=workflow:Build
[codecov-image]: https://codecov.io/gh/hatsyjs/router/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/hatsyjs/router/tree/master/packages/router/src
[github-image]: https://img.shields.io/static/v1?logo=github&label=GitHub&message=project&color=informational
[github-url]: https://github.com/hatsyjs/router
[api-docs-image]: https://img.shields.io/static/v1?logo=typescript&label=API&message=docs&color=informational
[API documentation]: https://hatsyjs.github.io/router


Routing
-------

This module contains a [Routing] capability that extends request processing context with
[request routing means][RouterMeans].

The latter has the following properties:

- `fullRoute` original route.
- `route` matching route. E.g. a tail section of original route.
- `routeMatch` a successful match of the route(s) against the pattern(s). 

The [@hatsy/route-match] library performs route parsing and matching. 

[Routing]: https://hatsyjs.github.io/kit/modules/@hatsy_router.html#Routing-1
[RouterMeans]: https://hatsyjs.github.io/kit/interfaces/@hatsy_router.RouterMeans.html
[@hatsy/route-match]: https://www.npmjs.com/package/@hatsy/route-match 


Dispatch
--------

Once [Routing] capability applied the request processing can be dispatched by matching route by one of the dispatchers.


### dispatchByName()

```typescript
import { httpListener } from '@hatsy/hatsy';
import { dispatchByName, Routing } from '@hatsy/router';
import { createServer } from 'http';

const server = createServer(httpListener(
    Routing.for(dispatchByName({
      api: apiHandler,       // Handle API request under `/api` route 
      assets: assetsHandler, // Serve static assets under `/assets` route
    })),
));

server.listen(8080);
```

`dispatchByName()` function accepts a map of request processing handlers under route entry names the handler should
 serve. The handler receives a request processing context with the rest of the route.


### dispatchByPattern()

```typescript
import { httpListener } from '@hatsy/hatsy';
import { dispatchByPattern, Routing } from '@hatsy/router';
import { createServer } from 'http';

const server = createServer(httpListener(
    Routing.for(dispatchByPattern([
      { on: 'api/v{apiVersion}/**', to: apiHandler },
      { on: '**/*.html', to: pageHandler },
      { on: 'assets/**', to: assetsHandler },      
    ])),
));

server.listen(8080);
```

`dispatchByPatttern()` function accepts dispatch patterns containing a route pattern and handler that serves
the matching route. The handler receives a request processing context with matching route tail.


Route Format
------------

The route format is [URLRoute] by default, while route patterns parsed by [simpleRoutePattern()].

This can be changed by configuring [Routing] capability.

```typescript
import { httpListener } from '@hatsy/hatsy';
import { matrixRoute, matrixRoutePattern } from '@hatsy/route-match';
import { dispatchByPattern, Routing } from '@hatsy/router';
import { createServer } from 'http'; import { matrixRoute } from './matrix-route';

const server = createServer(httpListener(
    Routing
        .with({
          buildRoute: ({ requestAddresses: { url } }) => matrixRoute(url),
          routePattern: pattern => matrixRoutePattern(pattern),
        }).for(dispatchByPattern([
          { on: 'api;v/**', to: apiHandler }, // API version as matrix attribute
          { on: '**/*.html', to: pageHandler },
          { on: 'assets/**', to: assetsHandler },      
        ])),
));

server.listen(8080);
```


[URLRoute]: https://hatsyjs.github.io/route-match/interfaces/URLRoute.html
[simpleRoutePattern()]: https://hatsyjs.github.io/route-match/globals.html#simpleRoutePattern 
